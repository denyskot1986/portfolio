"use client";

/**
 * V1 — "System Window"
 * Full terminal-app chrome: title bar, status footer with model/tokens,
 * no chat bubbles — just prefixed log lines. Density like an IRC client.
 */

import { motion } from "framer-motion";

const demo = [
  { role: "sys", text: "consultant online. how can i help?" },
  { role: "usr", text: "расскажи про David" },
  { role: "sys", text: "David — AI-операционный директор для малого бизнеса. держит клиентов, задачи и финансы 24/7. $79/mo. подробности: /products/david" },
  { role: "usr", text: "а Patrik?" },
];

export default function V1SystemWindow() {
  return (
    <div
      className="w-[360px] font-mono text-xs"
      style={{
        background: "rgba(4, 2, 8, 0.95)",
        border: "1px solid rgba(0, 255, 65, 0.35)",
        borderRadius: "4px",
        boxShadow: "0 0 32px rgba(0, 255, 65, 0.2), inset 0 0 40px rgba(0, 255, 65, 0.02)",
      }}
    >
      {/* Title bar */}
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{
          background: "rgba(0, 255, 65, 0.06)",
          borderBottom: "1px solid rgba(0, 255, 65, 0.22)",
        }}
      >
        <span className="term-dot term-dot-r" />
        <span className="term-dot term-dot-y" />
        <span className="term-dot term-dot-g" />
        <span className="flex-1 text-center text-[10px]" style={{ color: "#00ff41", opacity: 0.8, letterSpacing: "0.14em" }}>
          CONSULTANT · PID 1337
        </span>
        <span className="text-[10px]" style={{ color: "rgba(0, 255, 65, 0.5)" }}>×</span>
      </div>

      {/* Session info */}
      <div
        className="px-3 py-1.5 flex items-center gap-3 text-[10px]"
        style={{
          background: "rgba(0, 255, 65, 0.03)",
          borderBottom: "1px dashed rgba(0, 255, 65, 0.15)",
          color: "rgba(217, 255, 224, 0.55)",
        }}
      >
        <span>session <span style={{ color: "#ffb000" }}>#A1F3</span></span>
        <span style={{ opacity: 0.35 }}>│</span>
        <span>uptime <span style={{ color: "#00ff41" }}>00:42</span></span>
        <span style={{ opacity: 0.35 }}>│</span>
        <span>model <span style={{ color: "#ffb000" }}>sonnet-4.6</span></span>
      </div>

      {/* Transcript */}
      <div className="p-3 space-y-1.5" style={{ minHeight: 220 }}>
        {demo.map((m, i) => (
          <div key={i} className="leading-relaxed flex gap-2">
            <span
              className="shrink-0 text-[10px] pt-0.5"
              style={{
                color: m.role === "usr" ? "#ffb000" : "#00ff41",
                textShadow: `0 0 6px ${m.role === "usr" ? "rgba(255, 176, 0, 0.6)" : "rgba(0, 255, 65, 0.6)"}`,
                letterSpacing: "0.06em",
              }}
            >
              [{m.role.toUpperCase()}]
            </span>
            <span style={{ color: m.role === "usr" ? "rgba(255, 200, 120, 0.95)" : "rgba(217, 255, 224, 0.85)" }}>
              {m.text}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{
          borderTop: "1px solid rgba(0, 255, 65, 0.22)",
          background: "rgba(0, 255, 65, 0.04)",
        }}
      >
        <span style={{ color: "#00ff41", textShadow: "0 0 6px rgba(0, 255, 65, 0.6)" }}>user@finekot:~$</span>
        <span className="flex-1" style={{ color: "rgba(217, 255, 224, 0.5)" }}>спросить консультанта</span>
        <motion.span
          style={{ color: "#00ff41", textShadow: "0 0 6px rgba(0, 255, 65, 0.8)" }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          █
        </motion.span>
      </div>

      {/* Status bar */}
      <div
        className="px-3 py-1.5 flex items-center justify-between text-[9px]"
        style={{
          background: "rgba(0, 255, 65, 0.05)",
          borderTop: "1px solid rgba(0, 255, 65, 0.18)",
          color: "rgba(0, 255, 65, 0.7)",
          letterSpacing: "0.08em",
        }}
      >
        <span className="flex items-center gap-1.5">
          <motion.span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#00ff41", boxShadow: "0 0 6px #00ff41" }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          READY
        </span>
        <span style={{ color: "#ffb000" }}>tokens 128/4096</span>
        <span style={{ opacity: 0.6 }}>↑↓ scroll · ⏎ send</span>
      </div>
    </div>
  );
}
