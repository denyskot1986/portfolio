"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  from: "bot" | "user";
  text: string;
}

interface DemoChatProps {
  productName: string;
  messages: ChatMessage[];
  tryLink: string;
  tryLabel?: string;
}

export default function DemoChat({ productName, messages, tryLink, tryLabel = "Try it in Telegram" }: DemoChatProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [started, setStarted] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!started || visibleCount >= messages.length) return;
    const delay = messages[visibleCount]?.from === "bot" ? 1200 : 800;
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), delay);
    return () => clearTimeout(timer);
  }, [started, visibleCount, messages]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [visibleCount]);

  const handleStart = () => {
    setStarted(true);
    setVisibleCount(1);
  };

  const handleReplay = () => {
    setVisibleCount(0);
    setStarted(false);
  };

  const finished = visibleCount >= messages.length;

  return (
    <div className="glass rounded-xl overflow-hidden max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-pink-500/10 bg-pink-500/[0.03]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center">
          <span className="text-[10px] font-mono text-pink-300/70">&gt;_</span>
        </div>
        <div>
          <p className="text-xs font-bold text-pink-100/60">{productName}</p>
          <p className="text-[10px] text-pink-400/30 font-mono">demo &middot; interactive preview</p>
        </div>
        <div className="ml-auto flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
          <span className="text-[10px] text-emerald-400/40 font-mono">online</span>
        </div>
      </div>

      {/* Chat area */}
      <div ref={chatRef} className="p-4 space-y-3 min-h-[220px] max-h-[320px] overflow-y-auto">
        {!started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-[200px] gap-4"
          >
            <p className="text-xs text-pink-100/25 text-center font-mono">See how {productName} handles a real conversation</p>
            <button
              onClick={handleStart}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-pink-600/80 to-purple-600/80 text-white text-sm font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-[0_0_20px_rgba(244,114,182,0.15)]"
            >
              &#9654; Play Demo
            </button>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.from === "user"
                    ? "bg-gradient-to-r from-pink-600/20 to-purple-600/20 text-pink-100/60 border border-pink-500/15"
                    : "bg-pink-500/[0.05] text-pink-100/50 border border-pink-500/10"
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {started && !finished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-pink-500/[0.05] border border-pink-500/10 rounded-xl px-4 py-2.5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400/30 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400/30 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400/30 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-pink-500/10 flex items-center gap-2">
        {finished ? (
          <div className="flex w-full gap-2">
            <button
              onClick={handleReplay}
              className="px-4 py-2 rounded-lg border border-pink-500/15 text-[11px] text-pink-100/40 hover:text-pink-100/60 hover:border-pink-500/30 transition-all font-mono"
            >
              &#8635; Replay
            </button>
            <a
              href={tryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white text-[11px] font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(244,114,182,0.15)]"
            >
              {tryLabel} &rarr;
            </a>
          </div>
        ) : started ? (
          <div className="w-full flex items-center gap-2 opacity-40">
            <div className="flex-1 h-8 rounded-lg border border-pink-500/10 bg-pink-500/[0.02] flex items-center px-3">
              <span className="text-[10px] text-pink-100/20 font-mono">watching demo...</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
