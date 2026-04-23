"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { productsData } from "@/lib/products-data";
import {
  clearUnread,
  maybeTickUnread,
  readUnread,
  readVisited,
  subscribeProgression,
} from "@/lib/agent-progression";

// Dock-accent — мягкий синий, hardcoded. Не завязываем на theme-palette
// чтобы dock был однозначно «своим» цветом независимо от выбранной темы
// и визуально контрастировал с зелёным чата и оранжевым CMD.
const BLUE_RGB = "82, 183, 255";
const BLUE = `rgb(${BLUE_RGB})`;
const BLUE_SOFT = `rgba(${BLUE_RGB}, 0.75)`;

// Только подписочные агенты — они те, с кем можно «поговорить лично»;
// system template/Custom Studio в доке не показываем.
const DOCK_AGENTS = productsData.filter(
  (p) => p.available && p.pricing.subscription
);

const DOCK_SLUGS = DOCK_AGENTS.map((p) => p.id);

// Монограмма агента — <X/> — в стиле тайлов на карточках продуктов.
// Берём первую букву имени (латиница).
function monogram(name: string): string {
  const first = name.trim().charAt(0).toUpperCase();
  return first || "?";
}

interface TileProps {
  agent: (typeof productsData)[number];
  visited: boolean;
  unread: number;
  onPick: () => void;
}

function AgentTile({ agent, visited, unread, onPick }: TileProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/products/${agent.id}`}
      onClick={onPick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group flex flex-col items-center gap-2 p-2 rounded-md focus:outline-none"
      aria-label={`Open ${agent.name}${unread ? ` (${unread} unread)` : ""}`}
    >
      <div
        className="relative flex items-center justify-center font-mono font-bold"
        style={{
          width: 64,
          height: 64,
          borderRadius: 10,
          background: visited
            ? "rgba(var(--accent-rgb), 0.1)"
            : "rgba(10, 14, 10, 0.6)",
          border: `1px solid ${
            visited
              ? "rgba(var(--accent-rgb), 0.7)"
              : "rgba(var(--accent-rgb), 0.18)"
          }`,
          boxShadow: visited
            ? "0 0 18px rgba(var(--accent-rgb), 0.35), inset 0 0 20px rgba(var(--accent-rgb), 0.06)"
            : "inset 0 0 14px rgba(0,0,0,0.4)",
          color: visited ? "var(--accent)" : "rgba(var(--accent-rgb), 0.35)",
          textShadow: visited
            ? "0 0 10px rgba(var(--accent-rgb), 0.8)"
            : "none",
          transition: "all 0.22s ease",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
          filter: visited ? undefined : "saturate(0.6)",
        }}
      >
        <span style={{ color: "var(--accent2)", fontSize: 14 }}>&lt;</span>
        <span style={{ fontSize: 22, margin: "0 1px" }}>{monogram(agent.name)}</span>
        <span style={{ color: "var(--accent2)", fontSize: 14 }}>/&gt;</span>

        {/* Locked-замок для непосещённых — маленький «заблокирован» маркер */}
        {!visited && (
          <span
            aria-hidden
            className="absolute bottom-1 right-1 text-[9px] uppercase tracking-widest"
            style={{
              color: "rgba(var(--accent-rgb), 0.4)",
              letterSpacing: "0.2em",
            }}
          >
            ·
          </span>
        )}

        {/* Unread badge — оранжевая точка с числом поверх правого верха */}
        {unread > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 font-mono font-bold flex items-center justify-center"
            style={{
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              borderRadius: 9,
              background: "var(--accent2)",
              color: "#1a0f03",
              fontSize: 11,
              lineHeight: 1,
              boxShadow: "0 0 10px rgba(var(--accent2-rgb), 0.65)",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </div>
      <span
        className="text-[10px] uppercase tracking-widest"
        style={{
          color: visited ? "var(--accent)" : "rgba(var(--accent-rgb), 0.45)",
          textShadow: visited ? "0 0 6px rgba(var(--accent-rgb), 0.5)" : "none",
        }}
      >
        {agent.name}
      </span>
    </Link>
  );
}

interface AgentDockProps {
  /** Render trigger inline (e.g. inside ChatbotBar) — if false, renders a fixed corner button. */
  asInlineButton?: boolean;
}

export default function AgentDock({ asInlineButton = false }: AgentDockProps) {
  const reduced = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [unread, setUnread] = useState<Record<string, number>>({});
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Hydration-safe refresh from storage.
  useEffect(() => {
    setVisited(readVisited());
    setUnread(readUnread());
    return subscribeProgression(() => {
      setVisited(readVisited());
      setUnread(readUnread());
    });
  }, []);

  // Idle-tick — раз в 60с проверяем, не пора ли кинуть +1 unread случайному
  // уже посещённому агенту. Задержка внутри maybeTickUnread сама рандомит.
  useEffect(() => {
    const t = setInterval(() => maybeTickUnread(DOCK_SLUGS), 60_000);
    return () => clearInterval(t);
  }, []);

  // Close on outside click / ESC.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        popoverRef.current?.contains(t) ||
        triggerRef.current?.contains(t)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Координация с CMD и другими поповерами — если кто-то открылся,
  // закрываемся сами.
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ source?: string }>;
      if (ce.detail?.source && ce.detail.source !== "dock") setOpen(false);
    };
    window.addEventListener("fk:popover:open", handler as EventListener);
    return () =>
      window.removeEventListener("fk:popover:open", handler as EventListener);
  }, []);

  // При открытии шлём широковещательное событие — CMD услышит и закроется.
  useEffect(() => {
    if (!open) return;
    window.dispatchEvent(
      new CustomEvent("fk:popover:open", { detail: { source: "dock" } })
    );
  }, [open]);

  const totalUnreadCount = useMemo(
    () => Object.values(unread).reduce((a, b) => a + b, 0),
    [unread]
  );
  const unlockedCount = visited.size;

  const handlePick = useCallback((slug: string) => {
    clearUnread(slug);
    setOpen(false);
  }, []);

  const triggerClasses = asInlineButton
    ? "shrink-0 px-3 sm:px-4 h-11 flex items-center justify-center gap-2 transition-all relative"
    : "fixed bottom-5 right-5 z-[500] px-4 h-11 flex items-center justify-center gap-2 transition-all";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={triggerClasses}
        style={{
          background: open ? BLUE : `rgba(${BLUE_RGB}, 0.12)`,
          border: `1px solid ${BLUE}`,
          color: open ? "#040208" : BLUE,
          borderRadius: 4,
          letterSpacing: "0.22em",
          fontSize: "11px",
          fontWeight: 700,
          textShadow: open
            ? "none"
            : `0 0 10px rgba(${BLUE_RGB}, 0.95), 0 0 4px rgba(${BLUE_RGB}, 0.8)`,
          boxShadow: open
            ? `0 0 24px rgba(${BLUE_RGB}, 0.55)`
            : `0 0 18px rgba(${BLUE_RGB}, 0.35), inset 0 0 10px rgba(${BLUE_RGB}, 0.08)`,
          fontFamily: "inherit",
        }}
        aria-label={`Agents (${unlockedCount}/${DOCK_AGENTS.length} unlocked${
          totalUnreadCount ? `, ${totalUnreadCount} unread` : ""
        })`}
        aria-expanded={open}
      >
        <span className="font-mono">AGENTS</span>
        <span
          className="font-mono text-[10px] opacity-70"
          aria-hidden
        >
          {unlockedCount}/{DOCK_AGENTS.length}
        </span>
        {totalUnreadCount > 0 && !open && (
          <span
            className="absolute -top-1.5 -right-1.5 font-mono font-bold flex items-center justify-center"
            style={{
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              borderRadius: 9,
              background: "var(--accent2)",
              color: "#1a0f03",
              fontSize: 11,
              lineHeight: 1,
              boxShadow: "0 0 10px rgba(var(--accent2-rgb), 0.7)",
            }}
          >
            {totalUnreadCount > 9 ? "9+" : totalUnreadCount}
          </span>
        )}
      </button>
      {/* eslint workaround: всплывающий поповер — ниже */}

      <AnimatePresence>
        {open && (
          <motion.div
            ref={popoverRef}
            initial={reduced ? false : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed z-[600] font-mono"
            style={{
              right: 20,
              bottom: asInlineButton ? 72 : 64,
              width: "min(420px, calc(100vw - 40px))",
              background: "var(--chrome-bg)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: `1px solid ${BLUE_SOFT}`,
              borderRadius: 8,
              boxShadow: `0 0 36px rgba(${BLUE_RGB}, 0.38), 0 0 10px rgba(${BLUE_RGB}, 0.28), inset 0 0 56px rgba(${BLUE_RGB}, 0.06)`,
              overflow: "hidden",
            }}
          >
            <div
              className="flex items-center justify-between px-3 py-2 text-[10px] uppercase"
              style={{
                borderBottom: `1px solid rgba(${BLUE_RGB}, 0.35)`,
                background: `rgba(${BLUE_RGB}, 0.06)`,
                letterSpacing: "0.22em",
                color: BLUE,
                textShadow: `0 0 6px rgba(${BLUE_RGB}, 0.55)`,
              }}
            >
              <span>// agent dock</span>
              <span style={{ color: `rgba(${BLUE_RGB}, 0.7)` }}>
                {unlockedCount}/{DOCK_AGENTS.length} unlocked
              </span>
            </div>

            <div className="p-3 grid grid-cols-4 gap-1">
              {DOCK_AGENTS.map((agent) => (
                <AgentTile
                  key={agent.id}
                  agent={agent}
                  visited={visited.has(agent.id)}
                  unread={unread[agent.id] || 0}
                  onPick={() => handlePick(agent.id)}
                />
              ))}
              {/* 8-й слот — кнопка «открыть чат с David» (host сайта).
                  Визуально в стиле тайла, но в DOCK accent-color (синем),
                  с иконкой chat-bubble. Клик диспатчит fk:chat:open,
                  ChatbotBar слушает и setLogOpen(true). */}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("fk:chat:open"));
                  }
                }}
                className="relative group flex flex-col items-center gap-2 p-2 rounded-md focus:outline-none"
                aria-label="Open chat with David (site host)"
              >
                <div
                  className="relative flex items-center justify-center font-mono font-bold"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 10,
                    background: `rgba(${BLUE_RGB}, 0.12)`,
                    border: `1px solid ${BLUE_SOFT}`,
                    boxShadow: `0 0 18px rgba(${BLUE_RGB}, 0.35), inset 0 0 20px rgba(${BLUE_RGB}, 0.06)`,
                    color: BLUE,
                    textShadow: `0 0 10px rgba(${BLUE_RGB}, 0.8)`,
                    transition: "transform 0.22s ease",
                  }}
                >
                  {/* Chat-bubble glyph в ASCII-стиле, чтобы не выбиваться
                      из терминала */}
                  <span style={{ fontSize: 22, letterSpacing: "-0.05em" }}>
                    ▸_
                  </span>
                </div>
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{
                    color: BLUE,
                    textShadow: `0 0 6px rgba(${BLUE_RGB}, 0.5)`,
                  }}
                >
                  DAVID · host
                </span>
              </button>
            </div>

            <div
              className="px-3 py-1.5 text-[9px] uppercase tracking-widest"
              style={{
                borderTop: `1px solid rgba(${BLUE_RGB}, 0.2)`,
                background: `rgba(${BLUE_RGB}, 0.04)`,
                color: `rgba(${BLUE_RGB}, 0.55)`,
                letterSpacing: "0.2em",
              }}
            >
              {unlockedCount === 0
                ? "> зайди на карточку агента — он разблокируется"
                : unlockedCount < DOCK_AGENTS.length
                ? `> ещё ${DOCK_AGENTS.length - unlockedCount} не разблокировано`
                : "> все агенты разблокированы"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Экспорт для коллекции slug'ов если понадобится (например, для tick в других местах).
export { DOCK_SLUGS };
