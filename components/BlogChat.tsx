"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface BlogChatProps {
  articleTitle: string;
  articleSlug: string;
  lang?: string;
}

export default function BlogChat({ articleTitle, articleSlug, lang = "EN" }: BlogChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const adjustTextarea = useCallback(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, []);

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          pageUrl: typeof window !== "undefined" ? window.location.pathname : "/",
          mode: "blog",
          articleTitle,
          articleSlug,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Connection issue. Try again or message @finekot on Telegram." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Try Telegram: @finekot" }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, articleTitle, articleSlug]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  return (
    <div className="w-full">
      {/* Messages area */}
      <AnimatePresence>
        {messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative mb-3 max-h-[55vh] overflow-y-auto rounded-2xl p-4 space-y-3"
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid var(--glass-border)",
            }}
          >
            {/* Close button — left */}
            <div className="sticky top-0 flex justify-start mb-2">
              <button
                onClick={() => setMessages([])}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-pink-300/40 hover:text-pink-200 hover:bg-pink-500/10 transition-colors text-[10px] font-mono"
                aria-label="Close chat"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                закрыть
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
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white text-[7px] font-bold mr-2 mt-0.5 shrink-0">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-pink-600/60 to-purple-600/60 text-white rounded-br-sm"
                      : "text-[var(--fg)] opacity-70 rounded-bl-sm"
                  }`}
                  style={msg.role === "assistant" ? {
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                  } : {}}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white text-[7px] font-bold mr-2 mt-0.5 shrink-0">
                  AI
                </div>
                <div
                  className="px-3.5 py-2 rounded-2xl rounded-bl-sm text-sm"
                  style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
                >
                  <motion.span
                    className="text-pink-300/40 font-mono text-xs"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    thinking...
                  </motion.span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input widget with spinning border */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative rounded-2xl p-[1.5px] overflow-hidden"
      >
        {/* Spinning conic gradient border */}
        <div className="absolute inset-0 rounded-2xl blog-chat-border" />
        {/* Glow layer */}
        <div className="absolute inset-0 rounded-2xl blog-chat-glow" />

        {/* Inner content */}
        <div
          className="relative rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {/* Header: FINEKOT.AI label */}
          <div className="px-4 pt-3 pb-1 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white text-[6px] font-bold shrink-0">
              AI
            </div>
            <span className="gradient-text text-[9px] font-mono uppercase tracking-[0.25em] font-semibold">
              Finekot.AI
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-pink-500/15 to-transparent" />
          </div>

          {/* Input row */}
          <div className="flex items-end gap-2 px-3 pb-3 pt-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextarea();
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                lang === "RU"
                  ? "Задайте уточняющий вопрос"
                  : lang === "UA"
                  ? "Задайте уточнююче питання"
                  : "Ask a follow-up question"
              }
              rows={1}
              className="flex-1 px-2 py-2 bg-transparent text-sm text-[var(--fg)] placeholder:text-pink-200/30 focus:outline-none resize-none font-mono leading-relaxed"
              style={{ maxHeight: 120 }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(244,114,182,0.4)]"
            >
              {loading ? (
                <motion.div
                  className="w-3.5 h-3.5 border-[1.5px] border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* FineChat branding */}
      {messages.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-[10px] text-pink-300/20 mt-2.5 font-mono tracking-widest"
        >
          FineChat by Finekot.AI
        </motion.p>
      )}
    </div>
  );
}
