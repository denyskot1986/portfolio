"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  Fragment,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Allowed internal routes for nav actions (mirrors SYSTEM_PROMPT whitelist).
const NAV_WHITELIST = /^\/(products\/[a-z0-9-]+|discover|reels-agent)\/?$/i;

// Action directive syntax emitted by the LLM:
//   [nav:/products/david]   → next.router.push
//   [scroll:product-david]  → document.getElementById(...).scrollIntoView
const ACTION_REGEX = /\[(nav|scroll):([^\]\s]+)\]/gi;

type ParsedReply = {
  visible: string;
  actions: Array<{ type: "nav" | "scroll"; target: string }>;
};

function parseReply(raw: string): ParsedReply {
  const actions: ParsedReply["actions"] = [];
  const visible = raw
    .replace(ACTION_REGEX, (_, kind: string, target: string) => {
      const type = kind.toLowerCase() as "nav" | "scroll";
      if (type === "nav" && !NAV_WHITELIST.test(target)) return "";
      actions.push({ type, target });
      return "";
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { visible, actions };
}

// Legacy markdown links — render as plain text (directives are the new path).
const MD_LINK_REGEX = /\[([^\]\n]+)\]\((\/[^\s)]+)\)/g;
// Telegram handle — make the @shop_by_finekot_bot clickable in reply text.
// Matches @name (letters/digits/underscore, 3-32 chars per Telegram rules).
const TG_HANDLE_REGEX = /@([a-zA-Z0-9_]{3,32})/g;

function renderAssistantText(content: string): React.ReactNode {
  // 1) Strip markdown-link wrappers — keep only the label text.
  const flat = content.replace(MD_LINK_REGEX, (_, label) => label);

  // 2) Linkify any @telegram_handle occurrences.
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  const re = new RegExp(TG_HANDLE_REGEX.source, TG_HANDLE_REGEX.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(flat)) !== null) {
    const [full, handle] = m;
    if (m.index > cursor) nodes.push(flat.slice(cursor, m.index));
    nodes.push(
      <a
        key={key++}
        href={`https://t.me/${handle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-dotted underline-offset-2 transition-colors"
        style={{
          color: "#ffb000",
          textShadow: "0 0 6px rgba(255, 176, 0, 0.5)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#ffd36b";
          e.currentTarget.style.textShadow =
            "0 0 10px rgba(255, 176, 0, 0.85)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#ffb000";
          e.currentTarget.style.textShadow =
            "0 0 6px rgba(255, 176, 0, 0.5)";
        }}
      >
        {full}
      </a>
    );
    cursor = re.lastIndex;
  }
  if (cursor < flat.length) nodes.push(flat.slice(cursor));
  return nodes.length === 0
    ? flat
    : nodes.map((n, i) => <Fragment key={i}>{n}</Fragment>);
}

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Finekot Systems: online",
};

const SESSION_KEY = "finekot_chat_session";
const HISTORY_KEY = "finekot_chat_history";
const HISTORY_MAX = 40;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

function loadHistory(): ChatMessage[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const out: ChatMessage[] = [];
    for (const m of parsed) {
      if (
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
      ) {
        out.push({ role: m.role, content: m.content });
      }
    }
    return out.length ? out.slice(-HISTORY_MAX) : null;
  } catch {
    return null;
  }
}

function saveHistory(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(messages.slice(-HISTORY_MAX))
    );
  } catch {
    /* quota / disabled — ignore */
  }
}

const FRAME_BORDER = "rgba(0, 255, 65, 0.4)";
const FRAME_GLOW = "0 0 24px rgba(0, 255, 65, 0.18)";

export default function ChatbotBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logPanelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const hydratedRef = useRef(false);

  // On first mount, hydrate messages from sessionStorage so the log
  // survives navigation between product pages.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const restored = loadHistory();
    if (restored && restored.length) {
      setMessages(restored);
      // If there's real activity (anything besides the welcome line),
      // show the log so the user sees context on landing.
      if (restored.some((m) => m.content !== WELCOME_MESSAGE.content)) {
        setLogOpen(true);
      }
    }
  }, []);

  // Persist on every change.
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, logOpen]);

  // Close log when user clicks outside of the chat chrome (log panel + bars).
  useEffect(() => {
    if (!logOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const inside =
        logPanelRef.current?.contains(target) ||
        barRef.current?.contains(target) ||
        topBarRef.current?.contains(target);
      if (!inside) setLogOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [logOpen]);

  const executeActions = useCallback(
    (actions: ParsedReply["actions"]) => {
      if (actions.length === 0) return;
      // Tour mode: many scrolls in one reply → slower pacing so the user
      // can actually read each card. 3+ actions → 2.2s between beats.
      const isTour = actions.filter((a) => a.type === "scroll").length >= 3;
      const stepMs = isTour ? 2200 : 550;
      let delay = 0;
      for (const act of actions) {
        setTimeout(() => {
          if (act.type === "nav") {
            if (act.target === pathname) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              router.push(act.target);
            }
          } else if (act.type === "scroll") {
            const el = document.getElementById(act.target);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              el.classList.add("chat-scroll-flash");
              setTimeout(
                () => el.classList.remove("chat-scroll-flash"),
                1600
              );
            }
          }
        }, delay);
        // nav needs less pause than a read-a-card pause.
        delay += act.type === "nav" ? 600 : stepMs;
      }
    },
    [router, pathname]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setLogOpen(true);

      const userMsg: ChatMessage = { role: "user", content: trimmed };
      const historyForApi = messages
        .filter((m) => m !== WELCOME_MESSAGE)
        .concat(userMsg);
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
            pageUrl:
              typeof window !== "undefined" ? window.location.pathname : "/",
            sessionId: getSessionId(),
          }),
        });
        const data = await res.json();
        const raw: string =
          data.reply ||
          data.error ||
          "Связь прервана. Напиши в Telegram: @shop_by_finekot_bot";
        const parsed = parseReply(raw);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: parsed.visible || "> done." },
        ]);
        executeActions(parsed.actions);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Ошибка соединения. Напиши в Telegram: @shop_by_finekot_bot",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, executeActions]
  );

  const adjustTextarea = useCallback(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, []);

  const send = useCallback(() => {
    void sendMessage(input);
  }, [input, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  const visibleMessages = useMemo(
    () => messages.filter((m) => m.content.trim().length > 0),
    [messages]
  );

  const hasActivity = messages.length > 1;

  return (
    <>
      {/* ───── TOP FRAME HEADER ───── */}
      <div
        ref={topBarRef}
        className="fixed top-0 left-0 right-0 z-[499] font-mono"
        style={{
          height: "var(--chat-top-h, 34px)",
          background: "rgba(4, 2, 8, 0.97)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: `1px solid ${FRAME_BORDER}`,
          boxShadow: "0 2px 18px rgba(0, 255, 65, 0.12)",
        }}
      >
        <div
          className="h-full px-3 sm:px-4 flex items-center gap-2 text-[10px]"
          style={{ color: "#00ff41", letterSpacing: "0.12em" }}
        >
          {/* Terminal "traffic lights" */}
          <div className="flex items-center gap-1.5 mr-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#ff5f57", boxShadow: "0 0 6px rgba(255, 95, 87, 0.6)" }}
            />
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#febc2e", boxShadow: "0 0 6px rgba(254, 188, 46, 0.6)" }}
            />
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#28c840", boxShadow: "0 0 6px rgba(40, 200, 64, 0.6)" }}
            />
          </div>
          <span style={{ color: "#ffb000", opacity: 0.7 }}>//</span>
          <span>finekot.shop</span>
          <span style={{ opacity: 0.4 }}>::</span>
          <span>consultant</span>
          <span style={{ opacity: 0.4 }}>::</span>
          <span style={{ color: "#ffb000" }}>0x3F</span>
          <span className="flex-1" />
          {hasActivity && (
            <button
              onClick={() => setLogOpen((v) => !v)}
              className="transition-colors uppercase px-2 py-0.5 hidden sm:inline-flex items-center gap-1"
              style={{
                color: logOpen ? "#00ff41" : "rgba(0, 255, 65, 0.55)",
                letterSpacing: "0.2em",
                border: "1px solid rgba(0, 255, 65, 0.3)",
                borderRadius: "2px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff41")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = logOpen
                  ? "#00ff41"
                  : "rgba(0, 255, 65, 0.55)")
              }
              aria-label={logOpen ? "Hide log" : "Show log"}
            >
              {logOpen ? "hide log" : "log"}
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "#00ff41",
                  boxShadow: "0 0 6px rgba(0, 255, 65, 0.8)",
                }}
              />
            </button>
          )}
          <button
            onClick={() => {
              setMessages([WELCOME_MESSAGE]);
              setLogOpen(false);
              try {
                sessionStorage.removeItem(HISTORY_KEY);
              } catch {}
            }}
            className="transition-colors uppercase"
            style={{
              color: "rgba(0, 255, 65, 0.45)",
              letterSpacing: "0.2em",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff41")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(0, 255, 65, 0.45)")
            }
            aria-label="Clear log"
          >
            clr
          </button>
        </div>
      </div>

      {/* ───── MESSAGE LOG (floats above bottom bar, inside frame) ───── */}
      <AnimatePresence>
        {logOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed left-0 right-0 z-[498] pointer-events-none"
            style={{ bottom: "var(--chat-bar-h, 72px)" }}
          >
            <div className="max-w-5xl mx-auto px-3 sm:px-6 pb-2">
              <div
                ref={logPanelRef}
                className="pointer-events-auto relative font-mono overflow-hidden"
                style={{
                  background: "rgba(4, 2, 8, 0.97)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: `1px solid ${FRAME_BORDER}`,
                  borderRadius: "6px",
                  boxShadow: FRAME_GLOW,
                }}
              >
                {/* slim log header strip */}
                <div
                  className="px-3 py-1.5 flex items-center gap-2 text-[10px]"
                  style={{
                    background: "rgba(0, 255, 65, 0.06)",
                    borderBottom: "1px solid rgba(0, 255, 65, 0.2)",
                    color: "rgba(0, 255, 65, 0.7)",
                    letterSpacing: "0.15em",
                  }}
                >
                  <span style={{ color: "#ffb000", opacity: 0.7 }}>└─</span>
                  <span className="uppercase">session log</span>
                  <span className="flex-1" />
                  <button
                    onClick={() => setLogOpen(false)}
                    className="transition-all flex items-center gap-1 px-2 py-0.5 uppercase"
                    style={{
                      color: "#ff4d6d",
                      background: "rgba(255, 77, 109, 0.08)",
                      border: "1px solid rgba(255, 77, 109, 0.5)",
                      borderRadius: "2px",
                      letterSpacing: "0.2em",
                      fontSize: "10px",
                      fontWeight: 600,
                      textShadow: "0 0 6px rgba(255, 77, 109, 0.5)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#ff4d6d";
                      e.currentTarget.style.color = "#040208";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 77, 109, 0.08)";
                      e.currentTarget.style.color = "#ff4d6d";
                    }}
                    aria-label="Hide log"
                  >
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span>hide</span>
                  </button>
                </div>

                <div
                  ref={messagesRef}
                  className="relative px-3 py-3 space-y-1.5 text-xs leading-relaxed overflow-y-auto overscroll-contain"
                  style={{ maxHeight: "min(45vh, 320px)" }}
                >
                  {visibleMessages.map((msg, i) => {
                    const isUsr = msg.role === "user";
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex gap-2"
                      >
                        <span
                          className="shrink-0 pt-0.5"
                          style={{ color: "rgba(0, 255, 65, 0.5)" }}
                        >
                          ├─
                        </span>
                        <span
                          className="shrink-0 text-[10px] pt-[3px]"
                          style={{
                            color: isUsr ? "#ffb000" : "#00ff41",
                            letterSpacing: "0.12em",
                            textShadow: `0 0 6px ${
                              isUsr
                                ? "rgba(255, 176, 0, 0.5)"
                                : "rgba(0, 255, 65, 0.5)"
                            }`,
                            width: 26,
                          }}
                        >
                          {isUsr ? "USR" : "SYS"}
                        </span>
                        <span
                          className="shrink-0 pt-0.5"
                          style={{ color: "rgba(0, 255, 65, 0.4)" }}
                        >
                          │
                        </span>
                        <span
                          className="flex-1 whitespace-pre-wrap break-words"
                          style={{
                            color: isUsr
                              ? "rgba(255, 200, 120, 0.95)"
                              : "rgba(217, 255, 224, 0.88)",
                          }}
                        >
                          {isUsr ? msg.content : renderAssistantText(msg.content)}
                        </span>
                      </motion.div>
                    );
                  })}
                  {loading && (
                    <div className="flex gap-2">
                      <span
                        className="shrink-0 pt-0.5"
                        style={{ color: "rgba(0, 255, 65, 0.5)" }}
                      >
                        ├─
                      </span>
                      <span
                        className="shrink-0 text-[10px] pt-[3px]"
                        style={{
                          color: "#00ff41",
                          letterSpacing: "0.12em",
                          textShadow: "0 0 6px rgba(0, 255, 65, 0.5)",
                          width: 26,
                        }}
                      >
                        SYS
                      </span>
                      <span
                        className="shrink-0 pt-0.5"
                        style={{ color: "rgba(0, 255, 65, 0.4)" }}
                      >
                        │
                      </span>
                      <motion.span
                        className="text-[11px]"
                        style={{
                          color: "#00ff41",
                          textShadow: "0 0 6px rgba(0, 255, 65, 0.5)",
                        }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      >
                        processing...
                      </motion.span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── BOTTOM INPUT BAR ───── */}
      <div
        ref={barRef}
        className="fixed bottom-0 left-0 right-0 z-[499] font-mono"
        style={{
          background: "rgba(4, 2, 8, 0.97)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderTop: `1px solid ${FRAME_BORDER}`,
          boxShadow: "0 -6px 24px rgba(0, 255, 65, 0.12)",
        }}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-stretch gap-2 sm:gap-3">
          {/* Terminal indicator (orange >_) */}
          <button
            onClick={() => setLogOpen((v) => !v)}
            className="shrink-0 w-11 h-11 flex items-center justify-center transition-all relative"
            style={{
              background: "rgba(255, 176, 0, 0.08)",
              border: "1px solid #ffb000",
              color: "#ffb000",
              borderRadius: "4px",
              textShadow: "0 0 8px rgba(255, 176, 0, 0.7)",
              boxShadow:
                "0 0 18px rgba(255, 176, 0, 0.25), inset 0 0 10px rgba(255, 176, 0, 0.05)",
              letterSpacing: "-0.05em",
            }}
            aria-label={logOpen ? "Hide log" : "Show log"}
          >
            <span className="text-lg font-bold">&gt;_</span>
            {!logOpen && hasActivity && (
              <span
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                style={{
                  background: "#00ff41",
                  boxShadow: "0 0 8px rgba(0, 255, 65, 0.9)",
                }}
              />
            )}
          </button>

          {/* Input */}
          <div
            className="flex-1 flex items-center gap-2 px-3"
            style={{
              background: "rgba(0, 255, 65, 0.04)",
              border: "1px solid rgba(0, 255, 65, 0.35)",
              borderRadius: "4px",
              boxShadow: "inset 0 0 14px rgba(0, 255, 65, 0.06)",
            }}
          >
            <span
              className="shrink-0 hidden sm:inline text-[10px] tracking-[0.2em]"
              style={{
                color: "#ffb000",
                textShadow: "0 0 6px rgba(255, 176, 0, 0.5)",
              }}
            >
              QUERY
            </span>
            <span
              className="shrink-0 hidden sm:inline text-xs"
              style={{ color: "rgba(0, 255, 65, 0.4)" }}
            >
              │
            </span>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextarea();
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setLogOpen(true)}
              placeholder="Спроси про продукт — я открою страницу..."
              rows={1}
              className="flex-1 py-2 bg-transparent text-xs sm:text-sm focus:outline-none resize-none leading-relaxed placeholder:text-[rgba(77,122,94,0.7)]"
              style={{
                minHeight: 28,
                maxHeight: 120,
                color: "rgba(217, 255, 224, 0.95)",
                caretColor: "#ffb000",
              }}
            />
          </div>

          {/* PROMPT button */}
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="shrink-0 px-4 sm:px-5 h-11 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: loading
                ? "rgba(0, 255, 65, 0.2)"
                : "rgba(0, 255, 65, 0.08)",
              border: "1px solid #00ff41",
              color: "#00ff41",
              borderRadius: "4px",
              letterSpacing: "0.2em",
              fontSize: "11px",
              fontWeight: 600,
              textShadow: "0 0 6px rgba(0, 255, 65, 0.6)",
              boxShadow:
                "0 0 14px rgba(0, 255, 65, 0.22), inset 0 0 8px rgba(0, 255, 65, 0.04)",
            }}
            onMouseEnter={(e) => {
              if (e.currentTarget.disabled) return;
              e.currentTarget.style.background = "#00ff41";
              e.currentTarget.style.color = "#040208";
              e.currentTarget.style.boxShadow =
                "0 0 28px rgba(0, 255, 65, 0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = loading
                ? "rgba(0, 255, 65, 0.2)"
                : "rgba(0, 255, 65, 0.08)";
              e.currentTarget.style.color = "#00ff41";
              e.currentTarget.style.boxShadow =
                "0 0 14px rgba(0, 255, 65, 0.22), inset 0 0 8px rgba(0, 255, 65, 0.04)";
            }}
            aria-label="Send prompt"
          >
            {loading ? (
              <motion.div
                className="w-3.5 h-3.5 rounded-full"
                style={{
                  border: "1px solid rgba(0, 255, 65, 0.3)",
                  borderTopColor: "#00ff41",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <>
                <span className="hidden sm:inline">PROMPT</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
