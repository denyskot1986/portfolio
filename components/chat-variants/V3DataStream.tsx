"use client";

/**
 * V3 — "Data Stream"
 * Tree-style log with ├─ lines, faint matrix bg, single-line prompt.
 * Reads like a live tail of a chat server.
 */

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const demo = [
  { role: "sys", text: "stream opened. ready." },
  { role: "usr", text: "расскажи про David" },
  { role: "sys", text: "David — AI-директор для малого бизнеса. CRM, календарь, мессенджеры через MCP. $79/mo." },
  { role: "usr", text: "подробнее" },
  { role: "sys", text: "24/7 держит клиентов и задачи. инфо: /products/david" },
];

function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = (canvas.width = canvas.offsetWidth);
    const H = (canvas.height = canvas.offsetHeight);
    const cols = Math.floor(W / 14);
    const drops = Array(cols).fill(0);
    let raf = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(4, 2, 8, 0.08)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(0, 255, 65, 0.35)";
      ctx.font = "11px 'JetBrains Mono', monospace";
      for (let i = 0; i < cols; i++) {
        const ch = String.fromCharCode(0x30a0 + ((Math.random() * 96) | 0));
        ctx.fillText(ch, i * 14, drops[i] * 14);
        if (drops[i] * 14 > H && Math.random() > 0.97) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(() => setTimeout(draw, 90));
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.08 }} />;
}

export default function V3DataStream() {
  return (
    <div
      className="relative w-[360px] overflow-hidden font-mono"
      style={{
        background: "rgba(4, 2, 8, 0.92)",
        border: "1px solid rgba(0, 255, 65, 0.25)",
        borderRadius: "4px",
        boxShadow: "0 0 32px rgba(0, 255, 65, 0.15)",
      }}
    >
      <MatrixRain />

      <div className="relative">
        {/* Header */}
        <div
          className="px-3 py-2 flex items-center gap-2 text-[10px]"
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
            style={{ color: "#00ff41" }}
          >
            ●
          </motion.span>
        </div>

        {/* Tree log */}
        <div className="p-3 space-y-1 text-xs leading-relaxed" style={{ minHeight: 220 }}>
          {demo.map((m, i) => {
            const isLast = i === demo.length - 1;
            const isUsr = m.role === "usr";
            return (
              <div key={i} className="flex gap-2">
                <span
                  className="shrink-0"
                  style={{ color: "rgba(0, 255, 65, 0.5)", letterSpacing: "0" }}
                >
                  {isLast ? "└─" : "├─"}
                </span>
                <span
                  className="shrink-0 text-[10px] pt-0.5"
                  style={{
                    color: isUsr ? "#ffb000" : "#00ff41",
                    letterSpacing: "0.1em",
                    width: 28,
                  }}
                >
                  {isUsr ? "USR" : "SYS"}
                </span>
                <span style={{ color: "rgba(0, 255, 65, 0.4)", opacity: 0.7 }}>│</span>
                <span style={{ color: isUsr ? "rgba(255, 200, 120, 0.95)" : "rgba(217, 255, 224, 0.88)" }}>
                  {m.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Prompt */}
        <div
          className="px-3 py-2.5 flex items-center gap-2 text-sm"
          style={{
            background: "rgba(0, 255, 65, 0.04)",
            borderTop: "1px solid rgba(0, 255, 65, 0.22)",
          }}
        >
          <span style={{ color: "rgba(0, 255, 65, 0.7)", letterSpacing: "0" }}>└─</span>
          <span
            className="text-[10px]"
            style={{ color: "#ffb000", letterSpacing: "0.15em", textShadow: "0 0 6px rgba(255, 176, 0, 0.5)" }}
          >
            QUERY
          </span>
          <span style={{ color: "rgba(0, 255, 65, 0.5)" }}>│</span>
          <span className="flex-1 text-xs" style={{ color: "rgba(217, 255, 224, 0.5)" }}>
            type here
          </span>
          <motion.span
            className="text-xs"
            style={{ color: "#ffb000", textShadow: "0 0 6px rgba(255, 176, 0, 0.8)" }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          >
            ▊
          </motion.span>
        </div>
      </div>
    </div>
  );
}
