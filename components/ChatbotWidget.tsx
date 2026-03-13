"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatbotWidget() {
  const pathname = usePathname();
  const isBlogPost = pathname?.startsWith("/blog/") && pathname !== "/blog";
  const [open, setOpen] = useState(false);
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
      el.style.height = Math.min(el.scrollHeight, 100) + "px";
    }
  }, []);

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    if (inputRef.current) inputRef.current.style.height = "auto";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          pageUrl: typeof window !== "undefined" ? window.location.pathname : "/",
          mode: "sales",
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Connection issue. Try @shop_by_finekot_bot",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Try Telegram: @shop_by_finekot_bot" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  if (isBlogPost) return null;

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
                  className="mb-3 overflow-y-auto rounded-2xl p-3 space-y-3"
                  style={{
                    maxHeight: "45vh",
                    background: "rgba(10, 6, 8, 0.92)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(244, 114, 182, 0.12)",
                    boxShadow: "0 0 40px rgba(244,114,182,0.08)",
                  }}
                >
                  <div className="sticky top-0 flex justify-end">
                    <button
                      onClick={() => setMessages([])}
                      className="text-pink-300/40 hover:text-pink-300/70 transition-colors text-[10px] font-mono px-1"
                    >
                      очистить
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
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white text-[6px] font-bold mr-2 mt-0.5 shrink-0">
                          AI
                        </div>
                      )}
                      <div
                        className={`max-w-[82%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-pink-600/60 to-purple-600/60 text-white rounded-br-sm"
                            : "text-pink-100/70 rounded-bl-sm"
                        }`}
                        style={
                          msg.role === "assistant"
                            ? { background: "rgba(244,114,182,0.06)", border: "1px solid rgba(244,114,182,0.1)" }
                            : {}
                        }
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white text-[6px] font-bold mr-2 mt-0.5 shrink-0">
                        AI
                      </div>
                      <div
                        className="px-3 py-2 rounded-2xl rounded-bl-sm"
                        style={{ background: "rgba(244,114,182,0.06)", border: "1px solid rgba(244,114,182,0.1)" }}
                      >
                        <motion.span
                          className="text-pink-300/40 font-mono text-[10px]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        >
                          thinking...
                        </motion.span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input — spinning border like BlogChat */}
            <div className="relative rounded-2xl p-[1.5px] overflow-hidden">
              <div className="absolute inset-0 rounded-2xl blog-chat-border" />
              <div className="absolute inset-0 rounded-2xl blog-chat-glow" />
              <div
                className="relative rounded-2xl"
                style={{ background: "rgba(10, 6, 8, 0.95)", backdropFilter: "blur(20px)" }}
              >
                {/* Header */}
                <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white text-[6px] font-bold shrink-0">
                    AI
                  </div>
                  <span className="gradient-text text-[9px] font-mono uppercase tracking-[0.25em] font-semibold">
                    Finekot Shop
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-pink-500/15 to-transparent" />
                  <button
                    onClick={() => setOpen(false)}
                    className="text-pink-300/30 hover:text-pink-300/60 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                {/* Input */}
                <div className="flex items-end gap-2 px-3 pb-3 pt-1">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); adjustTextarea(); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Спросите о наших продуктах..."
                    rows={1}
                    className="flex-1 px-2 py-2 bg-transparent text-xs text-pink-100/70 placeholder:text-pink-300/25 focus:outline-none resize-none font-mono leading-relaxed"
                    style={{ maxHeight: 100 }}
                  />
                  <button
                    onClick={send}
                    disabled={loading || !input.trim()}
                    className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(244,114,182,0.3)]"
                  >
                    {loading ? (
                      <motion.div
                        className="w-3 h-3 border border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
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
        className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(244,114,182,0.25)]"
        style={{
          background: "linear-gradient(135deg, #db2777, #9333ea)",
        }}
        whileHover={{ scale: 1.05 }}
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
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </motion.svg>
          )}
        </AnimatePresence>
        {/* Pulse ring when closed */}
        {!open && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ border: "1px solid rgba(244,114,182,0.5)" }}
            animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.button>
    </div>
  );
}
