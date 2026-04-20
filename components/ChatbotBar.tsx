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
//   [nav:/products/orban]   → next.router.push
//   [scroll:product-orban]  → document.getElementById(...).scrollIntoView
// They are stripped from the rendered message and executed on arrival.
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

// Legacy markdown-link fallback — LLM might still emit [label](/path).
// Render as plain text (no nav) since directives are the new path.
const MD_LINK_REGEX = /\[([^\]\n]+)\]\((\/[^\s)]+)\)/g;
function stripMarkdownLinks(content: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  const re = new RegExp(MD_LINK_REGEX.source, MD_LINK_REGEX.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const [, label] = m;
    if (m.index > cursor) nodes.push(content.slice(cursor, m.index));
    nodes.push(
      <span
        key={key++}
        style={{
          color: "#ffb000",
          textShadow: "0 0 6px rgba(255, 176, 0, 0.45)",
        }}
      >
        {label}
      </span>
    );
    cursor = re.lastIndex;
  }
  if (cursor < content.length) nodes.push(content.slice(cursor));
  return nodes.length === 0
    ? content
    : nodes.map((n, i) => <Fragment key={i}>{n}</Fragment>);
}

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "> SKYNET consultant.on — спроси что угодно про продукты Finekot Systems. Я открою нужную страницу сам.",
};

const SESSION_KEY = "finekot_chat_session";

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

export default function ChatbotBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, panelOpen]);

  const executeActions = useCallback(
    (actions: ParsedReply["actions"]) => {
      if (actions.length === 0) return;
      // Run actions with small delays so the user can visually follow them.
      let delay = 0;
      for (const act of actions) {
        setTimeout(() => {
          if (act.type === "nav") {
            // Already on target → treat as scroll-to-top anchor.
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
        delay += 550;
      }
    },
    [router, pathname]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setPanelOpen(true);

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

  return (
    <>
      {/* Floating messages panel above the bar */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed left-0 right-0 z-[498] pointer-events-none"
            style={{ bottom: "var(--chat-bar-h, 72px)" }}
          >
            <div className="max-w-5xl mx-auto px-3 sm:px-6 pb-3">
              <div
                className="pointer-events-auto relative font-mono overflow-hidden"
                style={{
                  background: "rgba(4, 2, 8, 0.96)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(0, 255, 65, 0.28)",
                  borderRadius: "6px",
                  boxShadow:
                    "0 0 36px rgba(0, 255, 65, 0.18), inset 0 0 24px rgba(0, 255, 65, 0.03)",
                }}
              >
                {/* Header */}
                <div
                  className="relative px-3 py-2 flex items-center gap-2 text-[10px]"
                  style={{
                    background: "rgba(0, 255, 65, 0.06)",
                    borderBottom: "1px solid rgba(0, 255, 65, 0.2)",
                    color: "#00ff41",
                    letterSpacing: "0.12em",
                  }}
                >
                  <span style={{ color: "#ffb000", opacity: 0.7 }}>//</span>
                  <span>finekot.shop</span>
                  <span style={{ opacity: 0.4 }}>::</span>
                  <span>consultant</span>
                  <span style={{ opacity: 0.4 }}>::</span>
                  <span style={{ color: "#ffb000" }}>0x3F</span>
                  <span className="flex-1" />
                  <button
                    onClick={() => setMessages([WELCOME_MESSAGE])}
                    className="transition-colors uppercase"
                    style={{
                      color: "rgba(0, 255, 65, 0.4)",
                      letterSpacing: "0.15em",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#00ff41")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(0, 255, 65, 0.4)")
                    }
                    aria-label="Clear"
                  >
                    clr
                  </button>
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="transition-all flex items-center gap-1 px-2 py-1 uppercase"
                    style={{
                      color: "#ff4d6d",
                      background: "rgba(255, 77, 109, 0.08)",
                      border: "1px solid rgba(255, 77, 109, 0.5)",
                      borderRadius: "3px",
                      letterSpacing: "0.2em",
                      fontSize: "10px",
                      fontWeight: 600,
                      textShadow: "0 0 6px rgba(255, 77, 109, 0.5)",
                      boxShadow: "0 0 10px rgba(255, 77, 109, 0.18)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#ff4d6d";
                      e.currentTarget.style.color = "#040208";
                      e.currentTarget.style.boxShadow =
                        "0 0 20px rgba(255, 77, 109, 0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 77, 109, 0.08)";
                      e.currentTarget.style.color = "#ff4d6d";
                      e.currentTarget.style.boxShadow =
                        "0 0 10px rgba(255, 77, 109, 0.18)";
                    }}
                    aria-label="Close consultant log"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span>close</span>
                  </button>
                </div>

                {/* Log */}
                <div
                  ref={messagesRef}
                  className="relative px-3 py-3 space-y-1.5 text-xs leading-relaxed overflow-y-auto overscroll-contain"
                  style={{ maxHeight: "min(50vh, 360px)" }}
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
                          {isUsr ? msg.content : stripMarkdownLinks(msg.content)}
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

      {/* Bottom chat bar — always visible */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[499] font-mono"
        style={{
          background: "rgba(4, 2, 8, 0.97)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderTop: "1px solid rgba(0, 255, 65, 0.35)",
          boxShadow: "0 -6px 24px rgba(0, 255, 65, 0.12)",
        }}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-stretch gap-2 sm:gap-3">
          {/* Terminal indicator (orange >_) */}
          <button
            onClick={() => setPanelOpen((v) => !v)}
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
            aria-label={panelOpen ? "Hide consultant log" : "Show consultant log"}
          >
            <span className="text-lg font-bold">&gt;_</span>
            {!panelOpen && messages.length > 1 && (
              <span
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                style={{
                  background: "#00ff41",
                  boxShadow: "0 0 8px rgba(0, 255, 65, 0.9)",
                }}
              />
            )}
          </button>

          {/* Input (green) */}
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
              onFocus={() => setPanelOpen(true)}
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

          {/* PROMPT button (cyan/blue accent kept green-family for site coherence) */}
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
