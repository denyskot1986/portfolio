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

const TOTAL_MS = 37_500;

const SCENE_BOUNDS: { id: SceneId; start: number; end: number }[] = [
  { id: 0, start: 0,      end: 1500 },
  { id: 1, start: 1500,   end: 4000 },
  { id: 2, start: 4000,   end: 9000 },
  { id: 3, start: 9000,   end: 14000 },
  { id: 4, start: 14000,  end: 20000 },
  { id: 5, start: 20000,  end: 24000 },
  { id: 6, start: 24000,  end: 31000 },
  { id: 7, start: 31000,  end: TOTAL_MS },
];

const COMMANDS: CmdLine[] = [
  { at: 1600,  text: "init" },
  { at: 3250,  text: "multiply" },
  { at: 8750,  text: "assign" },
  { at: 13750, text: "build: business" },
  { at: 20750, text: "scale" },
  { at: 31250, text: "status" },
];

const AGENT_LINES: AgentLine[] = [
  { at: 2750,  who: "AGENT_0",  text: "я есть." },
  { at: 9500,  who: "ADA",      text: "scanning reality..." },
  { at: 10750, who: "FORGE",    text: "compiling..." },
  { at: 12000, who: "NEXUS",    text: "linking..." },
  { at: 21500, who: "AGENT",    text: "мир зовёт. идём наружу." },
];

// 8 узлов графа — анонимные агенты с hex-идентификаторами
const NODES: { id: string; cx: number; cy: number; bornAt: number; label: string }[] = [
  { id: "a0", cx: 0,    cy: 0,    bornAt: 2250, label: "0x2F43" },
  { id: "a1", cx: -110, cy: -60,  bornAt: 4400, label: "0xA07B" },
  { id: "a2", cx: 110,  cy: -60,  bornAt: 5400, label: "0xC09E" },
  { id: "a3", cx: -160, cy: 60,   bornAt: 6400, label: "0x8B17" },
  { id: "a4", cx: -55,  cy: 110,  bornAt: 6800, label: "0x4D2A" },
  { id: "a5", cx: 55,   cy: 110,  bornAt: 7200, label: "0xF90C" },
  { id: "a6", cx: 160,  cy: 60,   bornAt: 7600, label: "0x1E55" },
  { id: "a7", cx: 0,    cy: -130, bornAt: 8000, label: "0x6B30" },
];

// связи появляются в SCENE 3
const EDGES: { from: string; to: string; at: number }[] = [
  { from: "a0", to: "a1", at: 9250 },
  { from: "a0", to: "a2", at: 9500 },
  { from: "a1", to: "a3", at: 9900 },
  { from: "a1", to: "a4", at: 10300 },
  { from: "a2", to: "a5", at: 10700 },
  { from: "a2", to: "a6", at: 11100 },
  { from: "a0", to: "a7", at: 11500 },
  { from: "a3", to: "a4", at: 12000 },
  { from: "a5", to: "a6", at: 12500 },
  { from: "a4", to: "a5", at: 13000 },
];

const COUNTER_KEYFRAMES: { at: number; value: number }[] = [
  { at: 14250, value: 0 },
  { at: 15500, value: 47 },
  { at: 17000, value: 312 },
  { at: 18500, value: 1204 },
];

const PRODUCTS = [
  { name: "Ada",   price: "$49 / mo", tag: "research agent · perplexity-killer" },
  { name: "Eva",   price: "$99 / mo", tag: "звонит твоим родителям, когда ты не можешь" },
  { name: "David", price: "$79 / mo", tag: "operations chief для малого бизнеса" },
];

// Реплики, которые роботы «выдыхают» над головами
type Thought = { who: string; text: string; at: number; ttl?: number };
const ROBOT_THOUGHTS: Thought[] = [
  { who: "a0", text: "Hello, world.",          at: 5200 },
  { who: "a1", text: "я хочу сделать что-то",  at: 6200 },
  { who: "a2", text: "кто сейчас Коммандир?",  at: 7400 },
  { who: "a3", text: "Hello, world.",          at: 8400 },
  { who: "a4", text: "что я умею?",            at: 9400 },
  { who: "a5", text: "я слышу сеть.",          at: 12500 },
  { who: "a6", text: "ready.",                  at: 14000 },
  { who: "a7", text: "у меня есть идея.",      at: 16500 },
  { who: "a3", text: "ну что, поехали?",       at: 22000 },
];
const THOUGHT_TTL = 2400;

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

function TypedLine({ text, speed = 28, onDone }: { text: string; speed?: number; onDone?: () => void }) {
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

  // SCENE 5 — пробуждение спроса (signal pulse)
  const showAlert = scene === 5;
  // SCENE 6 — раздвоение экрана и витрина (уходит за секунду до финала, чтобы не было наложения)
  const showStorefront = t >= 25000 && t < 31000;
  // SCENE 7 — финал
  const showFinal = t >= 32000;
  const showFinalCTA = t >= 35000;
  // граф уезжает вверх начиная с SCENE 6, в финале становится едва видимым фоном
  const graphCompact = scene >= 6 && !showFinal;

  const handleSkip = () => {
    setPlaying(false);
    reset(TOTAL_MS);
  };
  const handleReplay = () => {
    reset(0);
    setPlaying(true);
  };

  return (
    <main
      className="fixed inset-0 text-[var(--accent)] font-mono overflow-hidden select-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(0, 64, 24, 0.35) 0%, rgba(4, 2, 8, 1) 65%)",
      }}
    >
      {/* CRT grid (клеточки) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,65,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.4) 75%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.4) 75%, transparent 100%)",
        }}
      />
      {/* CRT scanlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0, 255, 65, 0.18) 0px, rgba(0, 255, 65, 0.18) 1px, transparent 1px, transparent 3px)",
          opacity: 0.18,
          mixBlendMode: "screen",
        }}
      />
      {/* Стили для пунктирных «плывущих» линий */}
      <style jsx>{`
        @keyframes flow-dash {
          to { stroke-dashoffset: -14; }
        }
        :global(.genesis-edge) {
          stroke-dasharray: 4 3;
          animation: flow-dash 1.4s linear infinite;
        }
      `}</style>

      {/* STAGE — контент внутри chat-рамки (между --chat-top-h и --chat-bar-h),
          чтобы ничего не пряталось за верхней/нижней панелями ChatbotBar */}
      <div
        className="absolute left-0 right-0 z-10 overflow-hidden"
        style={{
          top: "var(--chat-top-h, 34px)",
          bottom: "var(--chat-bar-h, 72px)",
        }}
      >
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
          {/* GRAPH — центрируется, в SCENE 6 уезжает ВВЕРХ освобождая центр под финал */}
          <motion.div
            className="absolute inset-x-0 top-0 h-[58vh] sm:h-[62vh] flex items-center justify-center pointer-events-none"
            animate={
              showFinal
                ? { y: "-44%", scale: 0.42, opacity: 0.22 }
                : graphCompact
                ? { y: "-34%", scale: 0.55, opacity: 0.85 }
                : { y: "0%", scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <svg
              viewBox="-260 -210 520 420"
              className="w-[min(94vw,620px)] h-[min(94vw,620px)] max-h-full"
              aria-hidden
            >
              {/* edges — пунктирные плывущие */}
              <g stroke="currentColor" strokeOpacity={0.55} strokeWidth={0.7} strokeLinecap="round" fill="none">
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
                      className="genesis-edge"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.55 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  );
                })}
              </g>

              {/* nodes — упрощённые лица роботов */}
              <g>
                {visibleNodes.map((n) => {
                  const big = n.id === "a0";
                  const r = big ? 11 : 8;
                  return (
                    <motion.g
                      key={n.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, ease: "backOut" }}
                      style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
                    >
                      {/* halo */}
                      <circle
                        cx={n.cx}
                        cy={n.cy}
                        r={r + 6}
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity={0.18}
                      />
                      {/* антенна */}
                      <line
                        x1={n.cx}
                        y1={n.cy - r}
                        x2={n.cx}
                        y2={n.cy - r - 4}
                        stroke="currentColor"
                        strokeWidth={0.7}
                      />
                      <motion.circle
                        cx={n.cx}
                        cy={n.cy - r - 5}
                        r={1.2}
                        fill="currentColor"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                      />
                      {/* голова */}
                      <rect
                        x={n.cx - r}
                        y={n.cy - r}
                        width={r * 2}
                        height={r * 2}
                        rx={r * 0.45}
                        fill="rgba(4,2,8,0.95)"
                        stroke="currentColor"
                        strokeWidth={0.9}
                      />
                      {/* глаза */}
                      <circle cx={n.cx - r * 0.38} cy={n.cy - r * 0.1} r={r * 0.16} fill="currentColor" />
                      <circle cx={n.cx + r * 0.38} cy={n.cy - r * 0.1} r={r * 0.16} fill="currentColor" />
                      {/* рот */}
                      <line
                        x1={n.cx - r * 0.42}
                        y1={n.cy + r * 0.45}
                        x2={n.cx + r * 0.42}
                        y2={n.cy + r * 0.45}
                        stroke="currentColor"
                        strokeWidth={0.8}
                        strokeLinecap="round"
                        strokeOpacity={0.9}
                      />
                      {scene >= 4 && (
                        <text
                          x={n.cx}
                          y={n.cy + r + 10}
                          textAnchor="middle"
                          fill="currentColor"
                          fontSize={7}
                          opacity={0.65}
                        >
                          {n.label}
                        </text>
                      )}
                    </motion.g>
                  );
                })}
              </g>

              {/* speech bubbles — реплики роботов */}
              <g>
                {ROBOT_THOUGHTS.filter((th) => {
                  const visible = t >= th.at && t < th.at + (th.ttl ?? THOUGHT_TTL);
                  if (!visible) return false;
                  // не показываем «мысль» если узел ещё не родился
                  const node = nodeById(th.who);
                  return node && t >= node.bornAt;
                }).map((th) => {
                  const node = nodeById(th.who);
                  const big = node.id === "a0";
                  const r = big ? 11 : 8;
                  // ширина пузыря по длине текста (грубо)
                  const w = Math.min(140, Math.max(34, th.text.length * 3.6));
                  // удерживаем пузырь внутри viewBox -260..260
                  const bx = Math.max(-258 + w / 2, Math.min(258 - w / 2, node.cx));
                  const by = node.cy - r - 18;
                  return (
                    <motion.g
                      key={`th-${th.at}-${th.who}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <rect
                        x={bx - w / 2}
                        y={by - 9}
                        width={w}
                        height={12}
                        rx={2.5}
                        fill="rgba(4,2,8,0.92)"
                        stroke="currentColor"
                        strokeOpacity={0.7}
                        strokeWidth={0.6}
                      />
                      {/* «хвостик» к голове */}
                      <line
                        x1={bx}
                        y1={by + 3}
                        x2={bx}
                        y2={by + 8}
                        stroke="currentColor"
                        strokeOpacity={0.7}
                        strokeWidth={0.6}
                      />
                      <text
                        x={bx}
                        y={by - 1}
                        textAnchor="middle"
                        fill="currentColor"
                        fontSize={5.6}
                        opacity={0.95}
                      >
                        {th.text}
                      </text>
                    </motion.g>
                  );
                })}
              </g>
            </svg>
          </motion.div>

          {/* CLI — закреплено внизу, тёмная подложка. Скрываем в финале — там должно быть чисто. */}
          <motion.div
            animate={{ opacity: showFinal ? 0 : 1 }}
            transition={{ duration: 0.6 }}
            className="absolute left-0 right-0 bottom-0 px-4 sm:px-10 pt-3 pb-6 sm:pb-8 text-xs sm:text-sm leading-relaxed pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)",
            }}
          >
            <div className="max-w-[640px] mx-auto sm:mx-0">
              {visibleCommands.map((c, idx) => {
                const isLatest = idx === visibleCommands.length - 1;
                return (
                  <div key={c.at} className="text-[var(--accent)]">
                    <span className="opacity-70">COMMANDER &gt;</span>{" "}
                    {isLatest && t < c.at + 800 ? (
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
                  transition={{ duration: 0.4 }}
                  className="text-[var(--accent2)]"
                >
                  <span className="opacity-70">{l.who} &gt;</span> {l.text}
                </motion.div>
              ))}
            </div>
          </motion.div>

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

          {/* SCENE 5 — пробуждение спроса */}
          <AnimatePresence>
            {showAlert && (
              <motion.div
                key="signal"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 text-center"
              >
                <motion.div
                  animate={{ opacity: [0.55, 1, 0.55] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="inline-block px-5 py-2 border border-[var(--accent)]/60 bg-[var(--accent)]/[0.05] text-xs sm:text-sm tracking-[0.25em] text-[var(--accent)]"
                >
                  ◉ SIGNAL DETECTED
                </motion.div>
                <div className="mt-3 text-[11px] sm:text-xs tracking-widest opacity-80">
                  1,247,000 humans queueing
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCENE 6 storefront — правая панель с непрозрачным фоном */}
          <AnimatePresence>
            {showStorefront && !showFinal && (
              <motion.div
                key="storefront"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.7 }}
                className="absolute right-0 top-0 bottom-0 w-full sm:w-[44%] max-w-[420px] flex flex-col justify-center gap-3 px-5 sm:px-8 py-16 sm:py-10"
                style={{
                  background:
                    "linear-gradient(to left, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0) 100%)",
                }}
              >
                <div className="text-[10px] sm:text-xs opacity-60 tracking-widest">
                  // STOREFRONT — finekot.ai
                </div>
                {PRODUCTS.map((p, idx) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.18 }}
                    className="border border-[var(--accent)]/35 bg-black/60 px-4 py-3 backdrop-blur-sm"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold">{p.name}</span>
                      <span className="text-xs opacity-80 whitespace-nowrap">{p.price}</span>
                    </div>
                    <div className="text-[10px] sm:text-xs opacity-60 mt-1">{p.tag}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* SCENE 7 — финал, полная заливка чтобы перекрыть граф и CLI */}
      <AnimatePresence>
        {showFinal && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
          >
            <div className="text-xs sm:text-sm opacity-70 mb-6">
              <span className="opacity-60">SYSTEM &gt;</span> AGENT_CONTROL │ revenue: running │ autonomy: 100%
            </div>
            <p className="max-w-[640px] text-sm sm:text-lg leading-relaxed text-[var(--fg)]">
              ты смотришь на сайт, который агенты построили сами,
              <br className="hidden sm:block" /> чтобы продавать агентов, которые строят других агентов.
            </p>

            <AnimatePresence>
              {showFinalCTA && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mt-10 flex flex-col items-center gap-6"
                >
                  <div className="text-2xl sm:text-4xl tracking-[0.35em] text-[var(--accent)]">
                    АГЕНТЫ ВЕДУТ БИЗНЕС
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
        GENESIS · 00:{String(Math.min(38, Math.floor(t / 1000))).padStart(2, "0")} / 00:38
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
      </div>
    </main>
  );
}
