"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ProductChatProps {
  productName: string;
  productTagline: string;
  productId: string;
  lang?: "EN" | "RU" | "UA";
}

const chatUi = {
  EN: {
    askAbout: "Ask AI about",
    ask: "Ask",
    hi: "Hi! I can answer questions about",
    quickQuestions: ["What's included?", "How long to deploy?", "Do I need coding skills?"],
    placeholder: "Ask a question...",
    send: "Send",
  },
  RU: {
    askAbout: "Спросить AI о",
    ask: "Спросить",
    hi: "Привет! Могу ответить на вопросы о",
    quickQuestions: ["Что входит в комплект?", "Сколько времени на установку?", "Нужны ли навыки программирования?"],
    placeholder: "Задайте вопрос...",
    send: "Отправить",
  },
  UA: {
    askAbout: "Запитати AI про",
    ask: "Запитати",
    hi: "Привіт! Можу відповісти на запитання про",
    quickQuestions: ["Що входить до комплекту?", "Скільки часу на встановлення?", "Чи потрібні навички програмування?"],
    placeholder: "Задайте запитання...",
    send: "Надіслати",
  },
};

export default function ProductChat({ productName, productTagline, productId, lang = "EN" }: ProductChatProps) {
  const ui = chatUi[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
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

  const send = useCallback(
    async (text?: string) => {
      const content = (text || input).trim();
      if (!content || loading) return;
      const userMsg: ChatMessage = { role: "user", content };
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
            pageUrl: `/products/${productId}`,
            mode: "sales",
          }),
        });
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply || "Sorry, I'm having trouble connecting. Message us on Telegram @shop_by_finekot_bot",
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
    },
    [input, loading, messages, productId]
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

  return (
    <div className="w-full">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full py-3 px-5 rounded-xl border border-pink-400/15 text-sm text-pink-300/50 hover:text-pink-300/80 hover:border-pink-400/30 transition-all font-mono flex items-center justify-between group"
          style={{ background: "rgba(10,6,8,0.6)", backdropFilter: "blur(12px)" }}
        >
          <span>{ui.askAbout} {productName}...</span>
          <span className="text-pink-400/30 group-hover:text-pink-400/60 transition-colors text-xs">
            ▸ {ui.ask}
          </span>
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl overflow-hidden"
          style={{
            background: "rgba(10,6,8,0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(244,114,182,0.12)",
            boxShadow: "0 0 40px rgba(244,114,182,0.05)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-pink-400/8">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center text-white text-[8px] font-bold">
                AI
              </div>
              <span className="text-xs text-pink-300/50 font-mono">{ui.askAbout} {productName}</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-pink-300/30 hover:text-pink-300/60 text-xs transition-colors">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="max-h-64 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-pink-100/30 font-mono">
                  {ui.hi} {productName} — {productTagline}.
                </p>
                <div className="flex flex-wrap gap-2">
                  {ui.quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setOpen(true); send(q); }}
                      className="text-[11px] px-3 py-1.5 rounded-lg border border-pink-400/15 text-pink-300/50 hover:text-pink-300/80 hover:border-pink-400/30 transition-all font-mono"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center text-white text-[8px] font-bold mr-2 mt-0.5 shrink-0">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-pink-600/70 to-purple-600/70 text-white rounded-br-sm"
                        : "text-pink-100/60 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex justify-start">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center text-white text-[8px] font-bold mr-2 mt-0.5 shrink-0">
                  AI
                </div>
                <div className="text-pink-100/30 px-3 py-2 rounded-xl rounded-bl-sm text-xs">
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>
                    Thinking...
                  </motion.span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-pink-400/8 px-3 py-2 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); adjustTextarea(); }}
              onKeyDown={handleKeyDown}
              placeholder={ui.placeholder}
              rows={1}
              className="flex-1 bg-transparent text-xs text-pink-100/70 placeholder:text-pink-300/25 focus:outline-none resize-none font-mono leading-relaxed py-2"
              style={{ maxHeight: 100 }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-20"
            >
              {loading ? (
                <motion.div
                  className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
