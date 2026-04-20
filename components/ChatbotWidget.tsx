"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  // При первом открытии — показываем welcome.
  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true);
      if (messages.length === 0) {
        setMessages([WELCOME_MESSAGE]);
      }
    }
  }, [open, hasOpened, messages.length]);

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
      // История для API — без welcome-сообщения (оно client-only).
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

  // Suggested prompts показываем только пока юзер ни разу не написал.
  const showSuggested = useMemo(
    () => !messages.some((m) => m.role === "user") && !loading,
    [messages, loading]
  );

  return (
    <div className="fixed bottom-5 right-5 z-[500] flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[320px] sm:w-[360px] flex flex-col"
            style={{ maxHeight: "70vh" }}
          >
            {/* Messages */}
            <AnimatePresence>
              {messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  ref={messagesContainerRef}
                  className="mb-3 overflow-y-auto overscroll-contain p-3 space-y-3"
                  style={{
                    maxHeight: "45vh",
                    background: "rgba(4, 2, 8, 0.92)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(0, 255, 65, 0.22)",
                    borderRadius: "4px",
                    boxShadow: "0 0 32px rgba(0, 255, 65, 0.14), inset 0 0 24px rgba(0, 255, 65, 0.03)",
                  }}
                >
                  <div className="sticky top-0 flex justify-end">
                    <button
                      onClick={() => setMessages([WELCOME_MESSAGE])}
                      className="transition-colors text-[10px] font-mono px-1 uppercase tracking-[0.12em]"
                      style={{ color: "rgba(0, 255, 65, 0.35)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(0, 255, 65, 0.8)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0, 255, 65, 0.35)")}
                    >
                      $ clear
                    </button>
                  </div>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div
                          className="w-5 h-5 flex items-center justify-center text-[7px] font-bold mr-2 mt-0.5 shrink-0"
                          style={{
                            background: "rgba(0, 255, 65, 0.1)",
                            border: "1px solid rgba(0, 255, 65, 0.5)",
                            color: "#00ff41",
                            borderRadius: "3px",
                            textShadow: "0 0 6px rgba(0, 255, 65, 0.7)",
                          }}
                        >
                          AI
                        </div>
                      )}
                      <div
                        className="max-w-[82%] px-3 py-2 text-xs leading-relaxed font-mono whitespace-pre-wrap"
                        style={
                          msg.role === "user"
                            ? {
                                background: "rgba(255, 176, 0, 0.08)",
                                border: "1px solid rgba(255, 176, 0, 0.3)",
                                color: "#ffb000",
                                borderRadius: "4px",
                                borderBottomRightRadius: "1px",
                                textShadow: "0 0 4px rgba(255, 176, 0, 0.3)",
                              }
                            : {
                                background: "rgba(0, 255, 65, 0.04)",
                                border: "1px solid rgba(0, 255, 65, 0.18)",
                                color: "rgba(217, 255, 224, 0.85)",
                                borderRadius: "4px",
                                borderBottomLeftRadius: "1px",
                              }
                        }
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div
                        className="w-5 h-5 flex items-center justify-center text-[7px] font-bold mr-2 mt-0.5 shrink-0"
                        style={{
                          background: "rgba(0, 255, 65, 0.1)",
                          border: "1px solid rgba(0, 255, 65, 0.5)",
                          color: "#00ff41",
                          borderRadius: "3px",
                          textShadow: "0 0 6px rgba(0, 255, 65, 0.7)",
                        }}
                      >
                        AI
                      </div>
                      <div
                        className="px-3 py-2 font-mono"
                        style={{
                          background: "rgba(0, 255, 65, 0.04)",
                          border: "1px solid rgba(0, 255, 65, 0.18)",
                          borderRadius: "4px",
                          borderBottomLeftRadius: "1px",
                        }}
                      >
                        <motion.span
                          className="text-[10px]"
                          style={{ color: "#00ff41", textShadow: "0 0 6px rgba(0, 255, 65, 0.5)" }}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        >
                          &gt; processing...
                        </motion.span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggested prompts — видны только до первого user-сообщения */}
            <AnimatePresence>
              {showSuggested && messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="mb-3 flex flex-wrap gap-1.5"
                >
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => onSuggestedClick(prompt)}
                      disabled={loading}
                      className="text-[10px] font-mono px-2 py-1 transition-all disabled:opacity-40"
                      style={{
                        background: "rgba(0, 255, 65, 0.06)",
                        border: "1px solid rgba(0, 255, 65, 0.35)",
                        color: "#d9ffe0",
                        borderRadius: "3px",
                        textShadow: "0 0 4px rgba(0, 255, 65, 0.25)",
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
                        e.currentTarget.style.borderColor = "rgba(0, 255, 65, 0.35)";
                        e.currentTarget.style.color = "#d9ffe0";
                      }}
                    >
                      &gt; {prompt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input with spinning border */}
            <div className="relative p-[1.5px] overflow-hidden" style={{ borderRadius: "4px" }}>
              <div className="absolute inset-0 chat-input-border" style={{ borderRadius: "4px" }} />
              <div className="absolute inset-0 chat-input-glow" style={{ borderRadius: "4px" }} />
              <div
                className="relative"
                style={{
                  background: "rgba(4, 2, 8, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "4px",
                }}
              >
                {/* Terminal header */}
                <div
                  className="px-3 py-2 flex items-center gap-2"
                  style={{
                    background: "rgba(0, 255, 65, 0.05)",
                    borderBottom: "1px solid rgba(0, 255, 65, 0.18)",
                  }}
                >
                  <span className="term-dot term-dot-r" />
                  <span className="term-dot term-dot-y" />
                  <span className="term-dot term-dot-g" />
                  <span
                    className="text-[10px] font-mono flex-1 ml-1"
                    style={{ color: "#00ff41", opacity: 0.75, letterSpacing: "0.08em" }}
                  >
                    ./consultant.sh
                  </span>
                  <button
                    onClick={() => setOpen(false)}
                    className="transition-colors"
                    style={{ color: "rgba(0, 255, 65, 0.45)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff41")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0, 255, 65, 0.45)")}
                    aria-label="Close"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                {/* Input row */}
                <div className="flex items-end gap-2 px-3 py-2">
                  <span
                    className="font-mono text-xs pb-2 shrink-0"
                    style={{ color: "#00ff41", textShadow: "0 0 6px rgba(0, 255, 65, 0.5)" }}
                  >
                    &gt;
                  </span>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); adjustTextarea(); }}
                    onKeyDown={handleKeyDown}
                    placeholder="спросить консультанта..."
                    rows={1}
                    className="flex-1 px-1 py-2 bg-transparent text-xs focus:outline-none resize-none font-mono leading-relaxed"
                    style={{
                      maxHeight: 100,
                      color: "rgba(217, 255, 224, 0.9)",
                    }}
                  />
                  <button
                    onClick={send}
                    disabled={loading || !input.trim()}
                    className="shrink-0 w-8 h-8 flex items-center justify-center transition-all disabled:opacity-30"
                    style={{
                      background: "rgba(0, 255, 65, 0.1)",
                      border: "1px solid #00ff41",
                      color: "#00ff41",
                      borderRadius: "4px",
                      textShadow: "0 0 6px rgba(0, 255, 65, 0.6)",
                      boxShadow: "0 0 12px rgba(0, 255, 65, 0.25)",
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.background = "#00ff41";
                        e.currentTarget.style.color = "#040208";
                        e.currentTarget.style.boxShadow = "0 0 28px rgba(0, 255, 65, 0.6)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(0, 255, 65, 0.1)";
                      e.currentTarget.style.color = "#00ff41";
                      e.currentTarget.style.boxShadow = "0 0 12px rgba(0, 255, 65, 0.25)";
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
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
        {/* Pulse ring when closed */}
        {!open && (
          <motion.div
            className="absolute inset-0"
            style={{ border: "1px solid rgba(255, 176, 0, 0.5)", borderRadius: "4px" }}
            animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        {/* Blinking frame — subtle attention grabber while scrolling */}
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
    </div>
  );
}
