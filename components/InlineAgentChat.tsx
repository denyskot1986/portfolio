"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import AgentFace from "@/components/AgentFace";
import type { Lang } from "@/lib/i18n";

interface FaceConfig {
  eyeStyle?: "round" | "slit";
  antennaColor?: string;
  extra?: "scanner" | "cross" | "feather" | "dual-mouth" | "none";
}

interface InlineAgentChatProps {
  slug: string;
  agentName: string;
  greeting: string;
  lang: Lang;
  faceConfig?: FaceConfig;
}

interface Msg {
  role: "user" | "assistant";
  content: string;
  replies?: string[];
}

const REPLY_REGEX = /\[reply:\s*([^\]\n]+)\]/gi;
const NOISE_REGEXES: RegExp[] = [
  /\[(nav|scroll):[^\]]*\]/gi,
  /^\s*={3,}\s*$/gm,
];

function parseAssistantReply(raw: string): { visible: string; replies: string[] } {
  const replies: string[] = [];
  let out = raw.replace(REPLY_REGEX, (_, phrase: string) => {
    const trimmed = phrase.trim();
    if (trimmed && replies.length < 4) replies.push(trimmed);
    return "";
  });
  for (const re of NOISE_REGEXES) out = out.replace(re, "");
  out = out.replace(/\n{3,}/g, "\n\n").trim();
  return { visible: out, replies };
}

const STORAGE_PREFIX = "finekot.inlineChat";

interface StoredSession {
  sessionId: string;
  messages: Msg[];
}

function load(slug: string): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}:${slug}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const sessionId = typeof parsed.sessionId === "string" ? parsed.sessionId : null;
    const messages = Array.isArray(parsed.messages)
      ? parsed.messages
          .filter(
            (m: unknown): m is Msg =>
              !!m &&
              typeof m === "object" &&
              ((m as Msg).role === "user" || (m as Msg).role === "assistant") &&
              typeof (m as Msg).content === "string"
          )
          .slice(-40)
      : [];
    if (!sessionId) return null;
    return { sessionId, messages };
  } catch {
    return null;
  }
}

function save(slug: string, data: StoredSession) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}:${slug}`, JSON.stringify(data));
  } catch {
    /* quota — ignore */
  }
}

function freshSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

const UI_COPY: Record<Lang, {
  title: string;
  send: string;
  newChat: string;
  confirm: string;
  placeholderCycle: (name: string) => string;
  initChip: string[];
}> = {
  EN: {
    title: "agent channel",
    send: "SEND",
    newChat: "new chat",
    confirm: "confirm?",
    placeholderCycle: (n) => `${n} online`,
    initChip: ["What do you actually do?", "How much does it cost?", "Show me a typical day"],
  },
  RU: {
    title: "канал агента",
    send: "SEND",
    newChat: "новый чат",
    confirm: "подтвердить?",
    placeholderCycle: (n) => `${n} online`,
    initChip: ["Что ты умеешь?", "Сколько стоишь?", "Покажи типичный день"],
  },
  UA: {
    title: "канал агента",
    send: "SEND",
    newChat: "новий чат",
    confirm: "підтвердити?",
    placeholderCycle: (n) => `${n} online`,
    initChip: ["Що ти вмієш?", "Скільки коштуєш?", "Покажи типовий день"],
  },
};

export default function InlineAgentChat({
  slug,
  agentName,
  greeting,
  lang,
  faceConfig,
}: InlineAgentChatProps) {
  const reduced = useReducedMotion() ?? false;
  const t = UI_COPY[lang];

  // Hydration-safe: start empty and populate from localStorage after mount.
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const hydrated = useRef(false);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // First-time greeting seed (only if no prior history for this slug).
  const initialGreeting: Msg = useMemo(
    () => ({
      role: "assistant",
      content: greeting,
      replies: t.initChip.slice(0, 3),
    }),
    [greeting, t.initChip]
  );

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const stored = load(slug);
    if (stored && stored.messages.length > 0) {
      setMessages(stored.messages);
      setSessionId(stored.sessionId);
    } else {
      const fresh = freshSessionId();
      setSessionId(fresh);
      setMessages([initialGreeting]);
    }
  }, [slug, initialGreeting]);

  // Language / greeting refresh. If the user hasn't actually written anything
  // yet, the only message is the initial greeting — and we want it in the
  // current UI language. The LangProvider hydrates AFTER the first render
  // (EN default → RU from localStorage), which was leaving the greeting
  // frozen in English. Also re-runs on real lang switcher clicks.
  useEffect(() => {
    if (!hydrated.current) return;
    setMessages((prev) => {
      const hasUserTurn = prev.some((m) => m.role === "user");
      if (hasUserTurn) return prev;
      return [initialGreeting];
    });
  }, [initialGreeting]);

  // Persist on every message change after hydration.
  useEffect(() => {
    if (!hydrated.current || !sessionId) return;
    save(slug, { sessionId, messages });
  }, [slug, sessionId, messages]);

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  // Typewriter placeholder loop.
  useEffect(() => {
    const target = t.placeholderCycle(agentName);
    if (reduced) {
      setPlaceholder(target);
      return;
    }
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      if (cancelled) return;
      for (let i = 1; i <= target.length; i++) {
        timers.push(
          setTimeout(() => {
            if (!cancelled) setPlaceholder(target.slice(0, i));
          }, i * 70)
        );
      }
      const holdAt = target.length * 70 + 2500;
      for (let i = 1; i <= target.length; i++) {
        timers.push(
          setTimeout(() => {
            if (!cancelled) setPlaceholder(target.slice(0, target.length - i));
          }, holdAt + i * 40)
        );
      }
      timers.push(setTimeout(run, holdAt + target.length * 40 + 600));
    };
    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [agentName, reduced, t]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      const userMsg: Msg = { role: "user", content: trimmed };
      const historyForApi = messages.concat(userMsg).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      if (inputRef.current) inputRef.current.style.height = "auto";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: historyForApi,
            agentId: slug,
            sessionId,
            pageUrl: typeof window !== "undefined" ? window.location.pathname : "/",
          }),
        });
        const data = await res.json();
        const raw: string =
          data.reply ||
          data.error ||
          "Связь прервана. @shop_by_finekot_bot в Telegram.";
        const parsed = parseAssistantReply(raw);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: parsed.visible || "> online.",
            replies: parsed.replies.length ? parsed.replies : undefined,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Сбой связи. Попробуй ещё раз или напиши @shop_by_finekot_bot.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, sessionId, slug]
  );

  const adjustTextarea = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void sendMessage(input);
      }
    },
    [input, sendMessage]
  );

  // Two-click reset: first click flips the button into "confirm?" state for
  // 3 seconds, second click actually clears. No native confirm() modal —
  // stays inside the CRT aesthetic.
  const handleResetClick = () => {
    if (confirmTimerRef.current) {
      clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
    if (!confirmReset) {
      setConfirmReset(true);
      confirmTimerRef.current = setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    const fresh = freshSessionId();
    setSessionId(fresh);
    setMessages([initialGreeting]);
    setConfirmReset(false);
  };

  useEffect(() => () => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
  }, []);

  return (
    <motion.div
      initial={reduced ? false : { clipPath: "inset(0 0 100% 0)", opacity: 0 }}
      animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
      className="w-full font-mono"
      style={{
        background: "rgba(2,10,4,0.85)",
        border: "1px solid rgba(0,255,65,0.35)",
        borderRadius: 8,
        boxShadow:
          "0 0 28px rgba(0,255,65,0.14), inset 0 0 56px rgba(0,255,65,0.04)",
        overflow: "hidden",
      }}
    >
      {/* header — macOS dots + face + name + online + reset */}
      <div
        className="flex items-center gap-3 px-3 sm:px-4 py-2.5"
        style={{
          borderBottom: "1px solid rgba(0,255,65,0.25)",
          background: "rgba(0,255,65,0.04)",
        }}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#ff5f57" }} />
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#febc2e" }} />
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <div className="shrink-0">
          <AgentFace
            size={30}
            eyeStyle={faceConfig?.eyeStyle ?? "round"}
            antennaColor={faceConfig?.antennaColor}
            extra={faceConfig?.extra ?? "none"}
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div
            className="uppercase text-[11px] leading-tight truncate"
            style={{
              color: "#00ff41",
              letterSpacing: "0.22em",
              textShadow: "0 0 6px rgba(0,255,65,0.5)",
            }}
          >
            {agentName} · {t.title}
          </div>
          <div className="flex items-center gap-1.5 text-[9px] uppercase" style={{ color: "rgba(0,255,65,0.55)", letterSpacing: "0.22em" }}>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{
                background: "#00ff41",
                boxShadow: "0 0 6px rgba(0,255,65,0.9)",
                animation: reduced ? undefined : "inlineChatPulse 1.8s ease-in-out infinite",
              }}
            />
            <span>online · {slug}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleResetClick}
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded uppercase text-[10px] transition-all"
          style={{
            color: confirmReset ? "#ff4d6d" : "#ffb000",
            background: confirmReset
              ? "rgba(255,77,109,0.08)"
              : "rgba(255,176,0,0.06)",
            border: `1px solid ${
              confirmReset ? "rgba(255,77,109,0.6)" : "rgba(255,176,0,0.45)"
            }`,
            letterSpacing: "0.2em",
            textShadow: confirmReset
              ? "0 0 6px rgba(255,77,109,0.5)"
              : "0 0 6px rgba(255,176,0,0.5)",
          }}
          title={confirmReset ? t.confirm : t.newChat}
          aria-label={confirmReset ? t.confirm : t.newChat}
          onMouseEnter={(e) => {
            if (confirmReset) return;
            e.currentTarget.style.background = "rgba(255,176,0,0.18)";
            e.currentTarget.style.borderColor = "rgba(255,176,0,0.75)";
          }}
          onMouseLeave={(e) => {
            if (confirmReset) return;
            e.currentTarget.style.background = "rgba(255,176,0,0.06)";
            e.currentTarget.style.borderColor = "rgba(255,176,0,0.45)";
          }}
        >
          <span aria-hidden className="text-[14px] leading-none font-bold">
            {confirmReset ? "!" : "+"}
          </span>
          <span className="hidden sm:inline">
            {confirmReset ? t.confirm : t.newChat}
          </span>
        </button>
      </div>

      {/* messages */}
      <div
        ref={streamRef}
        className="px-3 sm:px-4 py-3 text-[13px] leading-relaxed overflow-y-auto overscroll-contain"
        style={{
          height: "clamp(360px, 52vh, 520px)",
          color: "rgba(217,255,224,0.92)",
        }}
      >
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          const isLast = i === messages.length - 1;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-3 last:mb-1"
            >
              <div className="flex gap-2">
                <span
                  className="shrink-0 text-[10px] pt-0.5"
                  style={{
                    width: 36,
                    color: isUser ? "#ffb000" : "#00ff41",
                    letterSpacing: "0.12em",
                    textShadow: `0 0 6px ${isUser ? "rgba(255,176,0,0.5)" : "rgba(0,255,65,0.5)"}`,
                  }}
                >
                  {isUser ? "USR" : agentName.slice(0, 3).toUpperCase()}
                </span>
                <span
                  className="flex-1 whitespace-pre-wrap break-words"
                  style={{
                    color: isUser ? "rgba(255,200,120,0.95)" : "rgba(217,255,224,0.92)",
                  }}
                >
                  {m.content}
                </span>
              </div>
              {!isUser && isLast && m.replies?.length && !loading && (
                <div className="flex flex-col gap-1.5 mt-2 pl-[44px]">
                  {m.replies.map((r, ri) => (
                    <button
                      key={ri}
                      type="button"
                      onClick={() => void sendMessage(r)}
                      disabled={loading}
                      className="group text-left px-2.5 py-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-[12px]"
                      style={{
                        background: "rgba(255,176,0,0.06)",
                        border: "1px solid rgba(255,176,0,0.35)",
                        borderRadius: 3,
                        color: "#ffd88a",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,176,0,0.14)";
                        e.currentTarget.style.borderColor = "rgba(255,176,0,0.7)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,176,0,0.06)";
                        e.currentTarget.style.borderColor = "rgba(255,176,0,0.35)";
                      }}
                    >
                      <span className="shrink-0 font-bold" style={{ color: "#ffb000" }} aria-hidden>
                        {ri + 1} →
                      </span>
                      <span className="break-words">{r}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
        {loading && (
          <div className="flex gap-2 mb-2">
            <span
              className="shrink-0 text-[10px] pt-0.5"
              style={{
                width: 36,
                color: "#00ff41",
                letterSpacing: "0.12em",
              }}
            >
              {agentName.slice(0, 3).toUpperCase()}
            </span>
            <motion.span
              className="text-[12px]"
              style={{ color: "#00ff41", textShadow: "0 0 6px rgba(0,255,65,0.5)" }}
              animate={reduced ? undefined : { opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            >
              thinking...
            </motion.span>
          </div>
        )}
      </div>

      {/* input */}
      <div
        className="flex items-end gap-2 px-3 sm:px-4 py-2.5"
        style={{
          borderTop: "1px solid rgba(0,255,65,0.25)",
          background: "rgba(0,255,65,0.03)",
        }}
      >
        <div
          className="flex-1 min-w-0 flex items-center gap-2 px-3 py-1"
          style={{
            background: "rgba(0,255,65,0.04)",
            border: "1px solid rgba(0,255,65,0.35)",
            borderRadius: 4,
          }}
        >
          <span
            className="shrink-0 text-[10px] hidden sm:inline"
            style={{ color: "#ffb000", letterSpacing: "0.2em", textShadow: "0 0 6px rgba(255,176,0,0.5)" }}
          >
            QUERY
          </span>
          <div className="relative flex-1 min-w-0">
            {!input && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 flex items-center"
                style={{
                  color: "rgba(77,122,94,0.7)",
                  fontSize: 15,
                }}
              >
                <span
                  className="mr-2 inline-block align-[-1px]"
                  style={{
                    width: "0.22em",
                    height: "1em",
                    background: "rgba(0,255,65,0.8)",
                    boxShadow: "0 0 8px rgba(0,255,65,0.68)",
                    animation: "blink 1s step-end infinite",
                  }}
                />
                <span>{placeholder}</span>
              </div>
            )}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextarea();
              }}
              onKeyDown={handleKeyDown}
              rows={1}
              className="w-full py-1.5 bg-transparent focus:outline-none resize-none leading-relaxed"
              style={{
                minHeight: 26,
                maxHeight: 140,
                color: "rgba(217,255,224,0.95)",
                caretColor: "#00ff41",
                fontSize: 15,
              }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => void sendMessage(input)}
          disabled={loading || !input.trim()}
          className="shrink-0 h-10 px-4 font-mono uppercase text-[11px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "rgba(0,255,65,0.08)",
            border: "1px solid #00ff41",
            color: "#00ff41",
            borderRadius: 4,
            letterSpacing: "0.22em",
            fontWeight: 700,
            textShadow: "0 0 6px rgba(0,255,65,0.5)",
            boxShadow: "0 0 14px rgba(0,255,65,0.2)",
          }}
        >
          {t.send}
        </button>
      </div>

      <style>{`
        @keyframes inlineChatPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </motion.div>
  );
}
