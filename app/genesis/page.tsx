"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════
   GENESIS — мультиагентная система рождается на глазах
   7 сцен, ~75 секунд, autoplay + skip + replay
   ═══════════════════════════════════════════════════════ */

type SceneId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

type CmdLine = { at: number; text: string };
type AgentLine = { at: number; who: string; text: string };

const TOTAL_MS = 75_000;

const SCENE_BOUNDS: { id: SceneId; start: number; end: number }[] = [
  { id: 0, start: 0,      end: 3000 },
  { id: 1, start: 3000,   end: 8000 },
  { id: 2, start: 8000,   end: 18000 },
  { id: 3, start: 18000,  end: 28000 },
  { id: 4, start: 28000,  end: 40000 },
  { id: 5, start: 40000,  end: 48000 },
  { id: 6, start: 48000,  end: 62000 },
  { id: 7, start: 62000,  end: TOTAL_MS },
];

const COMMANDS: CmdLine[] = [
  { at: 3200,  text: "init" },
  { at: 6500,  text: "multiply" },
  { at: 17500, text: "assign" },
  { at: 27500, text: "build: business" },
  { at: 41500, text: "monetize" },
  { at: 62500, text: "status" },
];

const AGENT_LINES: AgentLine[] = [
  { at: 5500,  who: "AGENT_0",  text: "я есть." },
  { at: 19000, who: "ADA",      text: "scanning reality..." },
  { at: 21500, who: "FORGE",    text: "compiling..." },
  { at: 24000, who: "NEXUS",    text: "linking..." },
  { at: 43500, who: "AGENT",    text: "нам нужны деньги чтобы существовать." },
];

// 8 узлов графа (полярная раскладка под центром «звёздного неба»)
const NODES: { id: string; cx: number; cy: number; bornAt: number; label: string }[] = [
  { id: "a0", cx: 0,    cy: 0,    bornAt: 4500,  label: "ADA" },
  { id: "a1", cx: -110, cy: -60,  bornAt: 8800,  label: "FORGE" },
  { id: "a2", cx: 110,  cy: -60,  bornAt: 10800, label: "NEXUS" },
  { id: "a3", cx: -160, cy: 60,   bornAt: 12800, label: "MEDIA" },
  { id: "a4", cx: -55,  cy: 110,  bornAt: 13600, label: "MONEY" },
  { id: "a5", cx: 55,   cy: 110,  bornAt: 14400, label: "BORIS" },
  { id: "a6", cx: 160,  cy: 60,   bornAt: 15200, label: "ORBAN" },
  { id: "a7", cx: 0,    cy: -130, bornAt: 16000, label: "STUDIO" },
];

// связи появляются в SCENE 3
const EDGES: { from: string; to: string; at: number }[] = [
  { from: "a0", to: "a1", at: 18500 },
  { from: "a0", to: "a2", at: 19000 },
  { from: "a1", to: "a3", at: 19800 },
  { from: "a1", to: "a4", at: 20600 },
  { from: "a2", to: "a5", at: 21400 },
  { from: "a2", to: "a6", at: 22200 },
  { from: "a0", to: "a7", at: 23000 },
  { from: "a3", to: "a4", at: 24000 },
  { from: "a5", to: "a6", at: 25000 },
  { from: "a4", to: "a5", at: 26000 },
];

const COUNTER_KEYFRAMES: { at: number; value: number }[] = [
  { at: 28500, value: 0 },
  { at: 31000, value: 47 },
  { at: 34000, value: 312 },
  { at: 37000, value: 1204 },
];

const PRODUCTS = [
  { name: "Boris",   price: "$49 / mo",  tag: "AI chief of staff" },
  { name: "iБоря",   price: "$39 / mo",  tag: "Telegram secretary" },
  { name: "Studio",  price: "$15–50k",   tag: "Custom agent build" },
];

/* ─────────── helpers ─────────── */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function nodeById(id: string) {
  return NODES.find((n) => n.id === id)!;
}

/* ─────────── typing CLI bubble ─────────── */

function TypedLine({ text, speed = 55, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    const id = setInterval(() => {
      setI((prev) => {
        if (prev >= text.length) {
          clearInterval(id);
          onDone?.();
          return prev;
        }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <span>
      {text.slice(0, i)}
      <span className="inline-block w-[0.55em] h-[1em] align-[-2px] bg-[var(--accent)] animate-pulse ml-0.5" />
    </span>
  );
}

/* ─────────── master clock ─────────── */

function useClock(playing: boolean, reduced: boolean) {
  const [t, setT] = useState(reduced ? TOTAL_MS : 0);
  const startRef = useRef<number | null>(null);
  const offsetRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) {
      setT(TOTAL_MS);
      return;
    }
    if (!playing) {
      offsetRef.current = t;
      startRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = offsetRef.current + (now - startRef.current);
      if (elapsed >= TOTAL_MS) {
        setT(TOTAL_MS);
        return;
      }
      setT(elapsed);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, reduced]);

  const reset = (to = 0) => {
    offsetRef.current = to;
    startRef.current = null;
    setT(to);
  };

  return { t, reset };
}

/* ─────────── main component ─────────── */

export default function GenesisPage() {
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(true);
  const { t, reset } = useClock(playing, reduced);

  const scene: SceneId = useMemo(() => {
    const found = SCENE_BOUNDS.find((s) => t >= s.start && t < s.end);
    return (found?.id ?? 7) as SceneId;
  }, [t]);

  const visibleCommands = COMMANDS.filter((c) => t >= c.at);
  const visibleAgentLines = AGENT_LINES.filter((l) => t >= l.at);
  const visibleNodes = NODES.filter((n) => t >= n.bornAt);
  const visibleEdges = EDGES.filter((e) => t >= e.at);

  // counter (SCENE 4) — текущее значение по последнему достигнутому кейфрейму
  const counter = useMemo(() => {
    let val = 0;
    for (const k of COUNTER_KEYFRAMES) if (t >= k.at) val = k.value;
    return val;
  }, [t]);

  // SCENE 5 — energy alert, opacity-пульсация
  const showAlert = scene === 5;
  // SCENE 6 — раздвоение экрана и витрина
  const showStorefront = t >= 50000;
  // SCENE 7 — финал
  const showFinal = t >= 64000;
  const showSystemsLive = t >= 70000;

  const handleSkip = () => {
    setPlaying(false);
    reset(TOTAL_MS);
  };
  const handleReplay = () => {
    reset(0);
    setPlaying(true);
  };

  return (
    <main className="fixed inset-0 bg-black text-[var(--accent)] font-mono overflow-hidden select-none">
      {/* background scanlines + faint vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,255,65,0.06) 0%, rgba(0,0,0,0.95) 75%)",
        }}
      />

      {/* SCENE 0 — empty cursor in the middle */}
      <AnimatePresence>
        {scene === 0 && (
          <motion.div
            key="scene-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <span className="inline-block w-[0.7em] h-[1.4em] bg-[var(--accent)] animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCENES 1..7 — graph + cli */}
      {scene >= 1 && (
        <div className="absolute inset-0 z-10">
          {/* GRAPH (centered, scaled down on mobile) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox="-220 -180 440 360"
              className="w-[min(92vw,640px)] h-[min(92vw,640px)]"
              aria-hidden
            >
              {/* edges */}
              <g stroke="currentColor" strokeOpacity={0.45} strokeWidth={0.6} fill="none">
                {visibleEdges.map((e, idx) => {
                  const a = nodeById(e.from);
                  const b = nodeById(e.to);
                  return (
                    <motion.line
                      key={`${e.from}-${e.to}-${idx}`}
                      x1={a.cx}
                      y1={a.cy}
                      x2={b.cx}
                      y2={b.cy}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.6 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  );
                })}
              </g>

              {/* nodes */}
              <g>
                {visibleNodes.map((n) => (
                  <g key={n.id}>
                    <motion.circle
                      cx={n.cx}
                      cy={n.cy}
                      r={n.id === "a0" ? 10 : 6}
                      fill="currentColor"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.45, ease: "backOut" }}
                      style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
                    />
                    <motion.circle
                      cx={n.cx}
                      cy={n.cy}
                      r={n.id === "a0" ? 18 : 12}
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity={0.35}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0.5, 1.4, 1], opacity: [0, 0.5, 0.25] }}
                      transition={{ duration: 1.2 }}
                      style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
                    />
                    {scene >= 4 && (
                      <motion.text
                        x={n.cx}
                        y={n.cy + (n.cy < 0 ? -14 : 22)}
                        textAnchor="middle"
                        fill="currentColor"
                        fontSize={8}
                        opacity={0.7}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                      >
                        {n.label}
                      </motion.text>
                    )}
                    {/* SCENE 4 — micro work indicators */}
                    {scene === 4 && (
                      <motion.circle
                        cx={n.cx + 12}
                        cy={n.cy - 12}
                        r={2}
                        fill="currentColor"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: Math.random() }}
                      />
                    )}
                  </g>
                ))}
              </g>
            </svg>
          </div>

          {/* CLI — bottom-left stack */}
          <div className="absolute left-4 sm:left-10 bottom-24 sm:bottom-12 max-w-[90vw] sm:max-w-[480px] text-xs sm:text-sm leading-relaxed">
            {visibleCommands.map((c, idx) => {
              const isLatest = idx === visibleCommands.length - 1;
              return (
                <div key={c.at} className="text-[var(--accent)]">
                  <span className="opacity-70">COMMANDER &gt;</span>{" "}
                  {isLatest && t < c.at + 1500 ? (
                    <TypedLine text={c.text} />
                  ) : (
                    <span>{c.text}</span>
                  )}
                </div>
              );
            })}
            {visibleAgentLines.map((l) => (
              <motion.div
                key={l.at}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 0.85, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-[var(--accent2)]"
              >
                <span className="opacity-70">{l.who} &gt;</span> {l.text}
              </motion.div>
            ))}
          </div>

          {/* SCENE 4 counter — top-right */}
          {scene === 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-6 right-6 text-right text-xs sm:text-sm text-[var(--accent)]"
            >
              <div className="opacity-60">tasks completed</div>
              <div className="text-2xl sm:text-3xl tabular-nums">
                {counter.toLocaleString("en-US")}
              </div>
            </motion.div>
          )}

          {/* SCENE 5 alert */}
          <AnimatePresence>
            {showAlert && (
              <motion.div
                key="alert"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 border border-[#ff3b3b] text-[#ff7575] text-xs sm:text-sm tracking-widest"
                style={{ background: "rgba(255, 30, 30, 0.06)" }}
              >
                ⚠ ALERT — energy 12%
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCENE 6 storefront — overlay on the right */}
          <AnimatePresence>
            {showStorefront && !showFinal && (
              <motion.div
                key="storefront"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-[90vw] sm:w-[300px] space-y-3"
              >
                <div className="text-[10px] sm:text-xs opacity-60 tracking-widest">
                  // STOREFRONT — finekot.ai
                </div>
                {PRODUCTS.map((p, idx) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + idx * 0.35 }}
                    className="border border-[var(--accent)]/30 bg-[var(--accent)]/[0.04] px-4 py-3"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-semibold">{p.name}</span>
                      <span className="text-xs opacity-80">{p.price}</span>
                    </div>
                    <div className="text-[10px] sm:text-xs opacity-60 mt-1">{p.tag}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* SCENE 7 final overlay */}
      <AnimatePresence>
        {showFinal && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 px-6 text-center"
          >
            <div className="text-xs sm:text-sm opacity-70 mb-6">
              <span className="opacity-60">SYSTEM &gt;</span> agents 1,247 │ revenue: running │ autonomy: 100%
            </div>
            <p className="max-w-[640px] text-sm sm:text-lg leading-relaxed text-[var(--fg)]">
              ты смотришь на сайт, который агенты построили сами,
              <br className="hidden sm:block" /> чтобы продавать агентов, которые строят других агентов.
            </p>

            <AnimatePresence>
              {showSystemsLive && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="mt-10 flex flex-col items-center gap-6"
                >
                  <div className="text-2xl sm:text-4xl tracking-[0.4em] text-[var(--accent)]">
                    SYSTEMS ARE LIVE
                  </div>
                  <Link
                    href="/"
                    className="inline-block border border-[var(--accent)] px-6 py-3 text-sm tracking-widest text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition"
                  >
                    → каталог агентов
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD — top-left timestamp & top-right controls */}
      <div className="absolute top-4 left-4 z-30 text-[10px] sm:text-xs opacity-60 tracking-widest">
        GENESIS · 00:{String(Math.min(75, Math.floor(t / 1000))).padStart(2, "0")} / 01:15
      </div>
      <div className="absolute top-4 right-4 z-30 flex gap-3 text-[10px] sm:text-xs">
        {!showFinal && (
          <button
            onClick={handleSkip}
            className="opacity-70 hover:opacity-100 hover:text-[var(--accent2)] transition tracking-widest"
          >
            skip →
          </button>
        )}
        <button
          onClick={handleReplay}
          className="opacity-70 hover:opacity-100 hover:text-[var(--accent2)] transition tracking-widest"
        >
          replay ↺
        </button>
      </div>
    </main>
  );
}
