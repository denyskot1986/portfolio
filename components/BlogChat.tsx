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
}

export default function BlogChat({ articleTitle, articleSlug }: BlogChatProps) {
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
      <AnimatePresence>
        {messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 max-h-[60vh] overflow-y-auto rounded-2xl p-4 space-y-3"
            style={{
              background: "rgba(10, 6, 8, 0.6)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(244, 114, 182, 0.08)",
            }}
          >
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center text-white text-[8px] font-bold mr-2 mt-0.5 shrink-0">
                    T-3
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-pink-600/70 to-purple-600/70 text-white rounded-br-sm"
                      : "text-pink-100/60 rounded-bl-sm"
                  }`}
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
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center text-white text-[8px] font-bold mr-2 mt-0.5 shrink-0">
                  T-3
                </div>
                <div className="text-pink-100/30 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm">
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>
                    Thinking...
                  </motion.span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated glowing border container */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative rounded-2xl p-[2px] overflow-hidden"
      >
        {/* Spinning conic gradient border */}
        <div className="absolute inset-0 rounded-2xl blog-chat-border" />
        {/* Glow layer */}
        <div className="absolute inset-0 rounded-2xl blog-chat-glow" />

        {/* Inner content */}
        <div
          className="relative rounded-2xl"
          style={{
            background: "rgba(10, 6, 8, 0.95)",
          }}
        >
          {/* Header label */}
          <div className="px-4 pt-3 pb-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center text-white text-[7px] font-bold shrink-0">
                AI
              </div>
              <span className="text-[10px] text-pink-300/50 font-mono uppercase tracking-[0.2em]">
                Discuss this article with AI
              </span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-pink-500/20 to-transparent" />
            </div>
          </div>

          <div className="flex items-end gap-2 p-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextarea();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask T-3 about this article..."
              rows={1}
              className="flex-1 px-3 py-2.5 bg-transparent text-sm text-pink-100/80 placeholder:text-pink-300/40 focus:outline-none resize-none font-mono leading-relaxed"
              style={{ maxHeight: 120 }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 shadow-[0_0_20px_rgba(244,114,182,0.3)]"
            >
              {loading ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {messages.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-[11px] text-pink-300/40 mt-3 font-mono tracking-wide"
        >
          T-3 Brand Man — your article consultant
        </motion.p>
      )}
    </div>
  );
}
