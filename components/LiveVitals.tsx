"use client";

import { useReducedMotion } from "framer-motion";

interface LiveVitalsProps {
  slug: string;
  agentName: string;
}

// Fixed-position pill in the top-right of every product page — shows
// "● {slug}" as a live-online marker and, on click, scrolls to the
// inline agent chat section (id="agent-chat").
export default function LiveVitals({ slug, agentName }: LiveVitalsProps) {
  const reduced = useReducedMotion() ?? false;

  const jumpToChat = () => {
    const el = document.getElementById("agent-chat");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="fixed z-40 font-mono select-none"
      style={{
        top: "calc(var(--chat-top-h, 34px) + 70px)",
        right: 14,
      }}
    >
      <button
        type="button"
        onClick={jumpToChat}
        className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] uppercase tracking-[0.2em]"
        style={{
          background: "rgba(2,10,4,0.82)",
          border: "1px solid rgba(0,255,65,0.35)",
          color: "rgba(0,255,65,0.85)",
          textShadow: "0 0 6px rgba(0,255,65,0.4)",
        }}
        aria-label={`jump to ${slug} chat`}
        title={`open chat with ${agentName}`}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: "#00ff41",
            boxShadow: "0 0 6px rgba(0,255,65,0.8)",
            animation: reduced ? undefined : "liveVitalsPulse 2s ease-in-out infinite",
          }}
        />
        {slug}
      </button>

      <style>{`
        @keyframes liveVitalsPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.35; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
