"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAgentChat } from "@/lib/agent-chat-context";
import AgentFace from "@/components/AgentFace";

export default function AgentDock() {
  const { agents, currentAgentId, select, dismiss } = useAgentChat();

  if (agents.length === 0) return null;

  return (
    <div
      className="fixed z-40 left-2 sm:left-3 flex flex-col gap-2 font-mono"
      style={{
        // Park above the chat bar. --chat-bar-h is set by ChatbotBar.
        bottom: "calc(var(--chat-bar-h, 72px) + 14px)",
        maxHeight:
          "calc(100dvh - var(--chat-top-h, 34px) - var(--chat-bar-h, 72px) - 48px)",
        overflowY: "auto",
      }}
    >
      <AnimatePresence initial={false}>
        {agents.map((agent) => {
          const active = currentAgentId === agent.id;
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -24, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="relative group"
            >
              <button
                type="button"
                onClick={() => select(active ? null : agent.id)}
                className="relative flex items-center justify-center rounded-xl transition-all"
                style={{
                  width: 52,
                  height: 52,
                  background: active
                    ? "rgba(0, 255, 65, 0.12)"
                    : "rgba(2, 10, 4, 0.82)",
                  border: `1px solid ${active ? "#00ff41" : "rgba(0, 255, 65, 0.35)"}`,
                  boxShadow: active
                    ? "0 0 18px rgba(0, 255, 65, 0.45), inset 0 0 14px rgba(0, 255, 65, 0.08)"
                    : "0 0 10px rgba(0, 255, 65, 0.12)",
                }}
                aria-label={`${agent.name} — ${active ? "active" : "open chat"}`}
              >
                <AgentFace
                  size={38}
                  eyeStyle={agent.faceConfig?.eyeStyle ?? "round"}
                  antennaColor={agent.faceConfig?.antennaColor}
                  extra={agent.faceConfig?.extra ?? "none"}
                />
                {agent.unread > 0 && (
                  <motion.span
                    key={agent.unread}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 340, damping: 18 }}
                    className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[10px] font-bold"
                    style={{
                      minWidth: 18,
                      height: 18,
                      padding: "0 5px",
                      background: "#ff4b6e",
                      color: "#fff",
                      boxShadow: "0 0 10px rgba(255, 75, 110, 0.7)",
                    }}
                  >
                    {agent.unread > 9 ? "9+" : agent.unread}
                  </motion.span>
                )}
              </button>

              {/* name label on hover/active */}
              <div
                className="pointer-events-none absolute left-[60px] top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.22em] transition-opacity"
                style={{
                  opacity: active ? 1 : 0,
                  color: "rgba(0, 255, 65, 0.85)",
                  textShadow: "0 0 6px rgba(0, 255, 65, 0.5)",
                  background: "rgba(2, 10, 4, 0.8)",
                  border: "1px solid rgba(0, 255, 65, 0.25)",
                  borderRadius: 4,
                  padding: "3px 8px",
                }}
              >
                {agent.name.toLowerCase()} · online
              </div>

              {/* dismiss (× on top-left, visible on hover) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(agent.id);
                }}
                className="absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: "rgba(2, 10, 4, 0.9)",
                  border: "1px solid rgba(0, 255, 65, 0.35)",
                  color: "rgba(217, 255, 224, 0.6)",
                }}
                aria-label={`close ${agent.name}`}
                title="Remove from dock"
              >
                ×
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
