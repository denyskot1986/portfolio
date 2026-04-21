"use client";

/**
 * V2 — "HUD / Tactical Overlay"
 * No box — four corner brackets, translucent body, big typography,
 * amber scanning stripe on top. Targeting-reticle vibe.
 */

import { motion } from "framer-motion";

const demo = [
  { role: "sys", text: "сканирую запрос…" },
  { role: "usr", text: "расскажи про David" },
  { role: "sys", text: "David · AI-операционный директор. держит клиентов, задачи и финансы малого бизнеса 24/7 через MCP. $239/mo." },
];

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base = "absolute w-5 h-5 pointer-events-none";
  const style: React.CSSProperties = { borderColor: "#00ff41", boxShadow: "0 0 8px rgba(0, 255, 65, 0.6)" };
  const edges: Record<string, string> = {
    tl: "top-0 left-0 border-t-2 border-l-2",
    tr: "top-0 right-0 border-t-2 border-r-2",
    bl: "bottom-0 left-0 border-b-2 border-l-2",
    br: "bottom-0 right-0 border-b-2 border-r-2",
  };
  return <div className={`${base} ${edges[pos]}`} style={style} />;
}

export default function V2HudTactical() {
  return (
    <div className="relative w-[360px] p-4 font-mono" style={{ background: "rgba(4, 2, 8, 0.78)", backdropFilter: "blur(6px)" }}>
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      {/* Amber header stripe */}
      <div className="relative mb-4 overflow-hidden" style={{ height: 20, borderBottom: "1px solid rgba(255, 176, 0, 0.25)" }}>
        <div className="flex items-center justify-between h-full text-[10px]" style={{ color: "#ffb000", letterSpacing: "0.22em" }}>
          <span style={{ textShadow: "0 0 6px rgba(255, 176, 0, 0.6)" }}>▲ CONSULTANT.HUD</span>
          <span className="flex items-center gap-1.5">
            <motion.span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#ffb000", boxShadow: "0 0 6px #ffb000" }}
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            ONLINE
          </span>
        </div>
        <motion.div
          className="absolute bottom-0 h-px"
          style={{
            width: 60,
            background: "linear-gradient(90deg, transparent, #ffb000, transparent)",
            boxShadow: "0 0 8px #ffb000",
          }}
          animate={{ x: [-60, 360] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Messages */}
      <div className="space-y-3 mb-4" style={{ minHeight: 200 }}>
        {demo.map((m, i) => {
          const isUsr = m.role === "usr";
          const color = isUsr ? "#ffb000" : "#00ff41";
          const rgba = isUsr ? "rgba(255, 176, 0," : "rgba(0, 255, 65,";
          return (
            <div key={i} className="flex gap-3" style={isUsr ? { flexDirection: "row-reverse" } : {}}>
              <div
                className="shrink-0 w-1 rounded-full"
                style={{ background: color, boxShadow: `0 0 8px ${rgba} 0.7)` }}
              />
              <div className="flex-1" style={isUsr ? { textAlign: "right" } : {}}>
                <div
                  className="text-[9px] mb-1 uppercase"
                  style={{ color, letterSpacing: "0.25em", opacity: 0.7 }}
                >
                  {isUsr ? "◀ operator" : "system ▶"}
                </div>
                <div
                  className="text-xs leading-relaxed"
                  style={{ color: isUsr ? "rgba(255, 200, 120, 0.95)" : "rgba(217, 255, 224, 0.9)" }}
                >
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input — underline only */}
      <div className="relative">
        <div className="flex items-center gap-3 pb-2">
          <span
            className="text-xs shrink-0"
            style={{ color: "#00ff41", textShadow: "0 0 6px rgba(0, 255, 65, 0.7)", letterSpacing: "0.15em" }}
          >
            &gt;&gt;
          </span>
          <span className="flex-1 text-sm" style={{ color: "rgba(217, 255, 224, 0.45)" }}>
            enter query
          </span>
          <motion.div
            className="w-6 h-6 flex items-center justify-center"
            style={{ border: "1px solid #00ff41", borderRadius: "2px", color: "#00ff41" }}
            whileHover={{ background: "#00ff41", color: "#040208" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </motion.div>
        </div>
        <motion.div
          className="h-px"
          style={{
            background: "linear-gradient(90deg, transparent, #00ff41 20%, #00ff41 80%, transparent)",
            boxShadow: "0 0 6px rgba(0, 255, 65, 0.6)",
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
