"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "Что у вас есть?",
  "Нужен AI для бизнеса",
  "Сколько стоит iБоря?",
  "AI для родителей",
];

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "> finekot://consultant_online\n\nЗдесь 7 AI-агентов, готовые системы и кастомные студии. Расскажи что ищешь — подскажу что подойдёт.",
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

function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const cols = Math.max(1, Math.floor(canvas.width / 14));
    const drops = Array(cols).fill(0);
    const draw = () => {
      ctx.fillStyle = "rgba(4, 2, 8, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 255, 65, 0.4)";
      ctx.font = "11px 'JetBrains Mono', monospace";
      for (let i = 0; i < drops.length; i++) {
        const ch = String.fromCharCode(0x30a0 + ((Math.random() * 96) | 0));
        ctx.fillText(ch, i * 14, drops[i] * 14);
        if (drops[i] * 14 > canvas.height && Math.random() > 0.97) drops[i] = 0;
        drops[i]++;
      }
      timer = setTimeout(() => {
        raf = requestAnimationFrame(draw);
      }, 110);
    };
    draw();
    return () => {
      if (timer) clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.09 }}
    />
  );
}

const CONTAINER_W = 360; // matches sm:w-[360px] panel width
const EDGE_GAP = 20; // tailwind *-5

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [side, setSide] = useState<"right" | "left">("right");
  const [flexAlign, setFlexAlign] = useState<"flex-end" | "flex-start">("flex-end");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const peekingRef = useRef(false);
  const posControls = useAnimationControls();
  const prevSideRef = useRef<"right" | "left" | null>(null);

  // Initial snap on first mount, wrap-around slide on every subsequent
  // side change. Wrap direction: exits off the CURRENT edge, teleports
  // off-screen to the opposite edge, slides back in.
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const vw = window.innerWidth;
    const rightRest = vw - CONTAINER_W - EDGE_GAP;
    const leftRest = EDGE_GAP;

    if (prevSideRef.current === null) {
      prevSideRef.current = side;
      posControls.set({ left: side === "right" ? rightRest : leftRest });
      setFlexAlign(side === "right" ? "flex-end" : "flex-start");
      return;
    }
    if (prevSideRef.current === side) return;
    prevSideRef.current = side;

    const offRight = vw + EDGE_GAP;
    const offLeft = -CONTAINER_W - EDGE_GAP;

    let cancelled = false;
    (async () => {
      if (side === "left") {
        // going to left side: exit RIGHT edge, re-enter from LEFT
        await posControls.start({
          left: offRight,
          transition: { duration: 0.55, ease: "easeIn" },
        });
        if (cancelled) return;
        setFlexAlign("flex-start");
        posControls.set({ left: offLeft });
        await posControls.start({
          left: leftRest,
          transition: { duration: 0.55, ease: "easeOut" },
        });
      } else {
        // going to right side: exit LEFT edge, re-enter from RIGHT
        await posControls.start({
          left: offLeft,
          transition: { duration: 0.55, ease: "easeIn" },
        });
        if (cancelled) return;
        setFlexAlign("flex-end");
        posControls.set({ left: offRight });
        await posControls.start({
          left: rightRest,
          transition: { duration: 0.55, ease: "easeOut" },
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [side, posControls]);

  // Resize handling — snap to current resting position for the active side.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      const vw = window.innerWidth;
      posControls.set({
        left: side === "right" ? vw - CONTAINER_W - EDGE_GAP : EDGE_GAP,
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [side, posControls]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true);
      if (messages.length === 0) {
        setMessages([WELCOME_MESSAGE]);
      }
    }
  }, [open, hasOpened, messages.length]);

  // Peek animation on every page load — panel briefly opens then folds
  // back into the toggle so the chat gets noticed. Cancelled if the user
  // clicks the button themselves during the peek window.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const openTimer = setTimeout(() => {
      peekingRef.current = true;
      setOpen(true);
    }, 1200);
    const closeTimer = setTimeout(() => {
      if (peekingRef.current) {
        setOpen(false);
        peekingRef.current = false;
      }
    }, 2300);
    // After the panel finishes folding away (~200ms framer exit anim),
    // slide the toggle button from right to left and park it there.
    const sideTimer = setTimeout(() => {
      if (peekingRef.current === false) setSide("left");
    }, 2650);
    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      clearTimeout(sideTimer);
    };
  }, []);

  const handleToggle = useCallback(() => {
    peekingRef.current = false;
    setOpen((v) => !v);
  }, []);

  const handleClose = useCallback(() => {
    peekingRef.current = false;
    setOpen(false);
  }, []);

  const adjustTextarea = useCallback(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 100) + "px";
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

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
            pageUrl: typeof window !== "undefined" ? window.location.pathname : "/",
            sessionId: getSessionId(),
          }),
        });
        const data = await res.json();
        const reply: string =
          data.reply ||
          data.error ||
          "Связь прервана. Напиши в Telegram: @shop_by_finekot_bot";
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Ошибка соединения. Напиши в Telegram: @shop_by_finekot_bot",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  const send = useCallback(() => {
    void sendMessage(input);
  }, [input, sendMessage]);

  const onSuggestedClick = useCallback(
    (prompt: string) => {
      void sendMessage(prompt);
    },
    [sendMessage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  const showSuggested = useMemo(
    () => !messages.some((m) => m.role === "user") && !loading,
    [messages, loading]
  );

  return (
    <motion.div
      className="fixed bottom-5 z-[500] flex flex-col gap-3"
      style={{
        width: CONTAINER_W,
        alignItems: flexAlign,
      }}
      animate={posControls}
      initial={false}
    >
      {/* Chat panel — V3 Data Stream */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-[320px] sm:w-[360px] overflow-hidden font-mono"
            style={{
              maxHeight: "70vh",
              background: "rgba(4, 2, 8, 0.97)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(0, 255, 65, 0.28)",
              borderRadius: "4px",
              boxShadow: "0 0 32px rgba(0, 255, 65, 0.18), inset 0 0 24px rgba(0, 255, 65, 0.03)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <MatrixRain />

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
              <span>stream</span>
              <span style={{ opacity: 0.4 }}>::</span>
              <span style={{ color: "#ffb000" }}>0x3F</span>
              <span className="flex-1" />
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{ color: "#00ff41", textShadow: "0 0 6px rgba(0, 255, 65, 0.7)" }}
              >
                ●
              </motion.span>
              <button
                onClick={() => setMessages([WELCOME_MESSAGE])}
                className="transition-colors ml-1 uppercase"
                style={{ color: "rgba(0, 255, 65, 0.4)", letterSpacing: "0.15em" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff41")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0, 255, 65, 0.4)")}
                aria-label="Clear"
              >
                clr
              </button>
              <button
                onClick={handleClose}
                className="transition-colors"
                style={{ color: "rgba(0, 255, 65, 0.45)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff41")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0, 255, 65, 0.45)")}
                aria-label="Close"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Tree log */}
            <div
              ref={messagesContainerRef}
              className="relative p-3 space-y-1.5 text-xs leading-relaxed overflow-y-auto overscroll-contain"
              style={{ minHeight: 160, maxHeight: "40vh" }}
            >
              {messages.map((msg, i) => {
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
                        textShadow: `0 0 6px ${isUsr ? "rgba(255, 176, 0, 0.5)" : "rgba(0, 255, 65, 0.5)"}`,
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
                        color: isUsr ? "rgba(255, 200, 120, 0.95)" : "rgba(217, 255, 224, 0.88)",
                      }}
                    >
                      {msg.content}
                    </span>
                  </motion.div>
                );
              })}

              {loading && (
                <div className="flex gap-2">
                  <span className="shrink-0 pt-0.5" style={{ color: "rgba(0, 255, 65, 0.5)" }}>├─</span>
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
                  <span className="shrink-0 pt-0.5" style={{ color: "rgba(0, 255, 65, 0.4)" }}>│</span>
                  <motion.span
                    className="text-[11px]"
                    style={{ color: "#00ff41", textShadow: "0 0 6px rgba(0, 255, 65, 0.5)" }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    processing...
                  </motion.span>
                </div>
              )}
            </div>

            {/* Suggested prompts */}
            <AnimatePresence>
              {showSuggested && messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="relative px-3 pb-2 flex flex-wrap gap-1.5"
                >
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => onSuggestedClick(prompt)}
                      disabled={loading}
                      className="text-[10px] px-2 py-1 transition-all disabled:opacity-40"
                      style={{
                        background: "rgba(0, 255, 65, 0.06)",
                        border: "1px solid rgba(0, 255, 65, 0.3)",
                        color: "#d9ffe0",
                        borderRadius: "3px",
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.background = "rgba(0, 255, 65, 0.15)";
                          e.currentTarget.style.borderColor = "#00ff41";
                          e.currentTarget.style.color = "#00ff41";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0, 255, 65, 0.06)";
                        e.currentTarget.style.borderColor = "rgba(0, 255, 65, 0.3)";
                        e.currentTarget.style.color = "#d9ffe0";
                      }}
                    >
                      &gt; {prompt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Prompt / input */}
            <div
              className="relative px-3 py-2 flex items-start gap-2"
              style={{
                borderTop: "1px solid rgba(0, 255, 65, 0.22)",
                background: "rgba(0, 255, 65, 0.04)",
              }}
            >
              <span className="shrink-0 pt-2 text-xs" style={{ color: "rgba(0, 255, 65, 0.6)" }}>└─</span>
              <span
                className="shrink-0 pt-2 text-[10px]"
                style={{
                  color: "#ffb000",
                  letterSpacing: "0.15em",
                  textShadow: "0 0 6px rgba(255, 176, 0, 0.5)",
                }}
              >
                QUERY
              </span>
              <span className="shrink-0 pt-2 text-xs" style={{ color: "rgba(0, 255, 65, 0.4)" }}>│</span>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); adjustTextarea(); }}
                onKeyDown={handleKeyDown}
                placeholder="type here..."
                rows={1}
                className="flex-1 py-2 bg-transparent text-xs focus:outline-none resize-none leading-relaxed"
                style={{
                  maxHeight: 100,
                  color: "rgba(217, 255, 224, 0.92)",
                  caretColor: "#ffb000",
                }}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="shrink-0 w-7 h-7 flex items-center justify-center transition-all disabled:opacity-30"
                style={{
                  background: "rgba(0, 255, 65, 0.1)",
                  border: "1px solid #00ff41",
                  color: "#00ff41",
                  borderRadius: "3px",
                  textShadow: "0 0 6px rgba(0, 255, 65, 0.6)",
                  boxShadow: "0 0 10px rgba(0, 255, 65, 0.2)",
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.background = "#00ff41";
                    e.currentTarget.style.color = "#040208";
                    e.currentTarget.style.boxShadow = "0 0 24px rgba(0, 255, 65, 0.55)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 255, 65, 0.1)";
                  e.currentTarget.style.color = "#00ff41";
                  e.currentTarget.style.boxShadow = "0 0 10px rgba(0, 255, 65, 0.2)";
                }}
                aria-label="Send"
              >
                {loading ? (
                  <motion.div
                    className="w-3 h-3 rounded-full"
                    style={{ border: "1px solid rgba(0, 255, 65, 0.3)", borderTopColor: "#00ff41" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={handleToggle}
        className="relative w-12 h-12 flex items-center justify-center font-mono"
        style={{
          background: "rgba(255, 176, 0, 0.08)",
          border: "1px solid #ffb000",
          color: "#ffb000",
          borderRadius: "4px",
          textShadow: "0 0 8px rgba(255, 176, 0, 0.7)",
          boxShadow: "0 0 24px rgba(255, 176, 0, 0.3), inset 0 0 12px rgba(255, 176, 0, 0.05)",
        }}
        whileHover={{ scale: 1.05, boxShadow: "0 0 36px rgba(255, 176, 0, 0.55), inset 0 0 12px rgba(255, 176, 0, 0.08)" }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open shop consultant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </motion.svg>
          ) : (
            <motion.span
              key="prompt"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-lg font-bold flex items-center"
              style={{ letterSpacing: "-0.05em" }}
            >
              &gt;_
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <motion.div
            className="absolute inset-0"
            style={{ border: "1px solid rgba(255, 176, 0, 0.5)", borderRadius: "4px" }}
            animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        {!open && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              border: "1px solid #ffb000",
              borderRadius: "4px",
              boxShadow: "0 0 14px rgba(255, 176, 0, 0.5), inset 0 0 6px rgba(255, 176, 0, 0.15)",
            }}
            animate={{ opacity: [0.85, 0.25, 0.85] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.button>
    </motion.div>
  );
}
