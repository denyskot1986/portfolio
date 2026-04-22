"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import { CRTBackground } from "./_shared/CRTBackground";
import { useAnimationClock } from "./_shared/useClock";

/* ═══════════════════════════════════════════════════════
   VARIANT B — CONSTELLATION (MESH) · 9s
   60+ агентов рождаются волнами → связываются в mesh →
   камера отдаляется → весь механизм в кадре → wordmark
   ═══════════════════════════════════════════════════════ */

const TOTAL_MS = 9000;

/* --- nodes: concentric rings, 1 + 6 + 14 + 20 + 26 = 67 --- */
type Node = { i: number; x: number; y: number; ring: number; bornAt: number };

const RINGS: { radius: number; count: number; phase: number; delay: number }[] = [
  { radius: 0,   count: 1,  phase: 0,    delay: 120 },
  { radius: 80,  count: 6,  phase: 0,    delay: 320 },
  { radius: 170, count: 14, phase: 0.3,  delay: 800 },
  { radius: 280, count: 20, phase: 0.15, delay: 1500 },
  { radius: 400, count: 26, phase: 0.1,  delay: 2400 },
];

function makeNodes(): Node[] {
  const out: Node[] = [];
  let idx = 0;
  for (let r = 0; r < RINGS.length; r++) {
    const { radius, count, phase, delay } = RINGS[r];
    for (let k = 0; k < count; k++) {
      const angle =
        count === 1 ? 0 : (k / count) * Math.PI * 2 + phase;
      // small jitter so it feels organic, not CAD
      const jitter = radius === 0 ? 0 : ((idx * 73) % 17) - 8;
      const jr = radius + jitter;
      const x = Math.cos(angle) * jr;
      const y = Math.sin(angle) * jr;
      // staggered within ring
      const within = (k / Math.max(1, count)) * 600;
      out.push({
        i: idx,
        x,
        y,
        ring: r,
        bornAt: delay + within + ((idx * 37) % 80),
      });
      idx++;
    }
  }
  return out;
}

const NODES = makeNodes();

/* --- edges: 3 passes guarantee every robot is in the network
     pass 1: backbone — every non-root has ≥1 link to nearest inner-ring robot
     pass 2: same-ring neighbors for denser weave
     pass 3: explicit radial bridges across rings (3 per gap) --- */
type Edge = { a: number; b: number; at: number };

function makeEdges(): Edge[] {
  const out: Edge[] = [];
  const seen = new Set<string>();
  const key = (a: number, b: number) =>
    `${Math.min(a, b)}-${Math.max(a, b)}`;
  const push = (a: number, b: number, at: number) => {
    const k = key(a, b);
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ a, b, at });
  };

  // pass 1: backbone to ring-1
  for (const n of NODES) {
    if (n.ring === 0) continue;
    const inner = NODES.filter((m) => m.ring === n.ring - 1);
    inner.sort(
      (a, b) =>
        (a.x - n.x) ** 2 +
        (a.y - n.y) ** 2 -
        ((b.x - n.x) ** 2 + (b.y - n.y) ** 2)
    );
    if (inner[0]) {
      push(n.i, inner[0].i, Math.max(n.bornAt, inner[0].bornAt) + 120);
    }
    // second connection for outer rings — alternate node, nearest in same ring
    if (n.ring >= 2) {
      const sameRing = NODES.filter((m) => m.ring === n.ring && m.i !== n.i);
      sameRing.sort(
        (a, b) =>
          (a.x - n.x) ** 2 +
          (a.y - n.y) ** 2 -
          ((b.x - n.x) ** 2 + (b.y - n.y) ** 2)
      );
      if (sameRing[0] && n.i % 2 === 0) {
        push(n.i, sameRing[0].i, Math.max(n.bornAt, sameRing[0].bornAt) + 200);
      }
    }
  }

  // pass 2: explicit radial bridges — 3 per gap across 3 gaps = 9 long lines
  const GAPS: Array<[number, number]> = [
    [0, 2],
    [1, 3],
    [2, 4],
  ];
  for (const [r1, r2] of GAPS) {
    const inner = NODES.filter((n) => n.ring === r1);
    const outer = NODES.filter((n) => n.ring === r2);
    for (let k = 0; k < 3; k++) {
      const a = inner[Math.floor((k / 3) * inner.length) % Math.max(1, inner.length)];
      const b = outer[Math.floor(((k + 0.3) / 3) * outer.length) % Math.max(1, outer.length)];
      if (!a || !b) continue;
      push(a.i, b.i, Math.max(a.bornAt, b.bornAt) + 320);
    }
  }

  return out;
}

const EDGES = makeEdges();

/* --- dynamic edges: short-lived flickers that rewire the mesh in real time.
     deterministic schedule (SSR-safe) --- */
type DynEdge = { a: number; b: number; showAt: number; hideAt: number };

function makeDynEdges(): DynEdge[] {
  const out: DynEdge[] = [];
  // hash-based PRNG, deterministic
  const rand = (i: number) => {
    const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  let cursor = 2800;
  let idx = 1;
  while (cursor < 6500) {
    const a = Math.floor(rand(idx * 3.1) * NODES.length);
    let b = Math.floor(rand(idx * 3.7 + 1.1) * NODES.length);
    if (b === a) b = (b + 3) % NODES.length;
    // avoid trivial dupes with static edges — if it matches, offset b
    const k = `${Math.min(a, b)}-${Math.max(a, b)}`;
    const dupMap = new Set(EDGES.map((e) => `${Math.min(e.a, e.b)}-${Math.max(e.a, e.b)}`));
    const aa = dupMap.has(k) ? (a + 5) % NODES.length : a;
    const bb = dupMap.has(k) ? (b + 11) % NODES.length : b;
    const dur = 500 + Math.floor(rand(idx * 2.3 + 5.1) * 800);
    out.push({ a: aa, b: bb === aa ? (bb + 1) % NODES.length : bb, showAt: cursor, hideAt: cursor + dur });
    cursor += 90 + Math.floor(rand(idx * 1.7 + 9.1) * 220);
    idx++;
  }
  return out;
}

const DYN_EDGES = makeDynEdges();

/* --- phase timings --- */
const T_ZOOM_OUT_START = 1400;
const T_ZOOM_OUT_END = 5400; // camera fully out, full mesh visible
const T_PULSE = 6000;
const T_CONTRACT = 6700;
const T_WORDMARK = 7400;
const T_TAGLINE = 7900;

/* --- terminal log lines: technical, fast --- */
type LogLine = { at: number; text: string; kind?: "info" | "ok" | "warn" };

function hex(i: number) {
  return (
    "0x" +
    ((i * 2654435761) >>> 0)
      .toString(16)
      .padStart(8, "0")
      .slice(0, 4)
      .toUpperCase()
  );
}

function makeLog(): LogLine[] {
  const lines: LogLine[] = [];
  lines.push({ at: 50, text: "boot: skynet-mesh v3.0", kind: "info" });
  lines.push({ at: 180, text: "rng seeded · peers=0 · awaiting genesis", kind: "info" });
  lines.push({ at: 320, text: "spawn node::" + hex(0) + " (root)", kind: "ok" });
  // per-node spawn + handshake lines
  for (const n of NODES) {
    if (n.ring === 0) continue;
    lines.push({
      at: n.bornAt + 20,
      text: `spawn node::${hex(n.i)} ring=${n.ring}`,
      kind: "ok",
    });
  }
  // per-edge link lines (sample every 2nd to keep log readable)
  EDGES.forEach((e, k) => {
    if (k % 2 !== 0) return;
    const rtt = 6 + ((k * 13) % 24);
    lines.push({
      at: e.at + 15,
      text: `link ${hex(e.a)}↔${hex(e.b)} rtt=${rtt}ms`,
      kind: "info",
    });
  });
  // milestones
  lines.push({ at: 2200, text: "cluster::research online (peers=6)", kind: "ok" });
  lines.push({ at: 3200, text: "consensus::quorum reached", kind: "ok" });
  lines.push({ at: 4100, text: "scale::out wave=3 throughput=1.2k/s", kind: "info" });
  lines.push({ at: 5000, text: "mesh::stable nodes=67 edges=" + EDGES.length, kind: "ok" });
  lines.push({ at: 5800, text: "revenue::autonomous", kind: "warn" });
  lines.push({ at: 6400, text: "system ready.", kind: "warn" });
  lines.sort((a, b) => a.at - b.at);
  return lines;
}

const LOG = makeLog();

/* ────────────── terminal log component ────────────── */

function TerminalLog({ t }: { t: number }) {
  const visible = useMemo(() => LOG.filter((l) => t >= l.at), [t]);
  // show only last 8 lines (scroll effect)
  const tail = visible.slice(-8);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [tail.length]);

  return (
    <div className="rounded-md border border-[var(--accent)]/30 bg-black/80 shadow-[0_0_24px_rgba(0,255,65,0.08)] backdrop-blur-sm overflow-hidden w-[min(720px,94vw)] mx-auto">
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[var(--accent)]/20 bg-black/70">
        <span className="w-2 h-2 rounded-full bg-[#ff5f56]/70" />
        <span className="w-2 h-2 rounded-full bg-[var(--accent2)]/70" />
        <span className="w-2 h-2 rounded-full bg-[var(--accent)]/70" />
        <span className="ml-3 text-[9px] sm:text-[10px] opacity-60 tracking-widest">
          /proc/skynet/genesis.log
        </span>
        <span className="ml-auto text-[9px] sm:text-[10px] opacity-50 tabular-nums">
          t+{(t / 1000).toFixed(2)}s
        </span>
      </div>
      <div
        ref={scrollRef}
        className="px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] leading-[1.5] h-[130px] sm:h-[150px] overflow-hidden font-mono"
      >
        <AnimatePresence initial={false}>
          {tail.map((l) => (
            <motion.div
              key={l.at}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="flex gap-2 whitespace-nowrap"
            >
              <span className="opacity-40 tabular-nums">
                [{String(l.at).padStart(4, "0")}]
              </span>
              <span
                className={
                  l.kind === "ok"
                    ? "text-[var(--accent)]"
                    : l.kind === "warn"
                    ? "text-[var(--accent2)]"
                    : "text-[var(--fg)]/80"
                }
              >
                {l.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ────────────── camera scale curve ────────────── */

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function cameraScale(t: number) {
  if (t < T_ZOOM_OUT_START) return 2.8;
  if (t >= T_ZOOM_OUT_END) return 1.0;
  const p = (t - T_ZOOM_OUT_START) / (T_ZOOM_OUT_END - T_ZOOM_OUT_START);
  return 2.8 - easeInOut(p) * 1.8;
}

/* ────────────── page ────────────── */

export default function ConstellationPage() {
  const { t, replay } = useAnimationClock(TOTAL_MS);

  const pulse = t >= T_PULSE && t < T_PULSE + 700;
  const contracting = t >= T_CONTRACT;
  const wordmarkShown = t >= T_WORDMARK;
  const taglineShown = t >= T_TAGLINE;

  const scale = useMemo(() => {
    if (contracting) return 0.05;
    return cameraScale(t);
  }, [t, contracting]);

  return (
    <main
      className="fixed inset-0 text-[var(--accent)] font-mono overflow-hidden select-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 55%, rgba(0, 64, 24, 0.35) 0%, rgba(4, 2, 8, 1) 65%)",
      }}
    >
      <CRTBackground />

      <style jsx global>{`
        @keyframes mesh-flow {
          to {
            stroke-dashoffset: -14;
          }
        }
        .mesh-flow line {
          animation: mesh-flow 0.9s linear infinite;
        }
      `}</style>

      <div className="absolute top-4 left-4 z-30 text-[10px] sm:text-xs opacity-60 tracking-widest">
        GENESIS · {String(Math.min(9, Math.floor(t / 1000))).padStart(2, "0")}s / 09s
      </div>
      <div className="absolute top-4 right-4 z-30 flex gap-4 text-[10px] sm:text-xs">
        <Link
          href="/"
          className="opacity-70 hover:opacity-100 hover:text-[var(--accent2)] transition tracking-widest"
        >
          ← /
        </Link>
        <button
          onClick={replay}
          className="opacity-70 hover:opacity-100 hover:text-[var(--accent2)] transition tracking-widest"
        >
          replay ↺
        </button>
      </div>

      {/* TOP — terminal log */}
      <div className="absolute left-0 right-0 top-12 sm:top-14 z-20 px-3 sm:px-6">
        <TerminalLog t={t} />
      </div>

      {/* CENTER — mesh */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {!wordmarkShown ? (
            <motion.div
              key="mesh"
              className="relative"
              style={{ transform: `translateY(12%)` }}
            >
              <motion.svg
                viewBox="-520 -520 1040 1040"
                className="w-[min(96vw,720px)] h-[min(96vw,720px)]"
                aria-hidden
                animate={{
                  scale: scale,
                  opacity: contracting ? 0 : 1,
                  filter: pulse
                    ? "drop-shadow(0 0 14px rgba(0,255,65,0.6))"
                    : "drop-shadow(0 0 0 rgba(0,255,65,0))",
                }}
                transition={{
                  scale: { duration: contracting ? 0.7 : 0.15, ease: "easeOut" },
                  opacity: { duration: 0.6 },
                  filter: { duration: 0.3 },
                }}
                style={{ transformOrigin: "center" }}
              >
                {/* static edges (backbone + same-ring + radial bridges) */}
                <g
                  stroke="currentColor"
                  strokeLinecap="round"
                  fill="none"
                >
                  {EDGES.map((e, idx) => {
                    if (t < e.at) return null;
                    const A = NODES[e.a];
                    const B = NODES[e.b];
                    const age = t - e.at;
                    const opacity = Math.min(
                      pulse ? 0.9 : 0.35,
                      0.05 + age / 400
                    );
                    return (
                      <motion.line
                        key={`e-${idx}`}
                        x1={A.x}
                        y1={A.y}
                        x2={B.x}
                        y2={B.y}
                        strokeWidth={pulse ? 1.1 : 0.7}
                        strokeOpacity={opacity}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                      />
                    );
                  })}
                </g>

                {/* dynamic edges — bright flickers that rewire live */}
                <g
                  className="mesh-flow"
                  stroke="currentColor"
                  strokeLinecap="round"
                  fill="none"
                  style={{ color: "var(--accent2)" }}
                >
                  {DYN_EDGES.map((e, idx) => {
                    if (t < e.showAt || t >= e.hideAt) return null;
                    const A = NODES[e.a];
                    const B = NODES[e.b];
                    if (!A || !B) return null;
                    return (
                      <motion.line
                        key={`dyn-${idx}`}
                        x1={A.x}
                        y1={A.y}
                        x2={B.x}
                        y2={B.y}
                        strokeWidth={0.9}
                        strokeOpacity={0.85}
                        strokeDasharray="4 3"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      />
                    );
                  })}
                </g>

                {/* nodes — robot heads */}
                <g>
                  {NODES.map((n) => {
                    if (t < n.bornAt) return null;
                    // ring 0 biggest, outer rings smaller
                    const r =
                      n.ring === 0
                        ? 14
                        : n.ring === 1
                        ? 11
                        : n.ring === 2
                        ? 9
                        : n.ring === 3
                        ? 7.5
                        : 6;
                    const isRoot = n.ring === 0;
                    return (
                      <motion.g
                        key={n.i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: pulse ? [1, 1.35, 1] : 1,
                          opacity: 1,
                        }}
                        transition={{
                          scale: { duration: pulse ? 0.6 : 0.35, ease: "backOut" },
                          opacity: { duration: 0.25 },
                        }}
                        style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                      >
                        {/* halo for root */}
                        {isRoot && (
                          <circle
                            cx={n.x}
                            cy={n.y}
                            r={r + 7}
                            fill="none"
                            stroke="currentColor"
                            strokeOpacity={0.3}
                          />
                        )}
                        {/* антенна */}
                        <line
                          x1={n.x}
                          y1={n.y - r}
                          x2={n.x}
                          y2={n.y - r - r * 0.45}
                          stroke="currentColor"
                          strokeWidth={r * 0.09}
                          strokeOpacity={0.8}
                        />
                        <circle
                          cx={n.x}
                          cy={n.y - r - r * 0.55}
                          r={r * 0.15}
                          fill="currentColor"
                          opacity={0.9}
                        />
                        {/* голова — квадратик с антенной */}
                        <rect
                          x={n.x - r}
                          y={n.y - r}
                          width={r * 2}
                          height={r * 2}
                          rx={r * 0.35}
                          fill="rgba(4,2,8,0.95)"
                          stroke="currentColor"
                          strokeWidth={r * 0.11}
                          strokeOpacity={0.9}
                        />
                        {/* глаза */}
                        <circle
                          cx={n.x - r * 0.36}
                          cy={n.y - r * 0.08}
                          r={r * 0.18}
                          fill="currentColor"
                        />
                        <circle
                          cx={n.x + r * 0.36}
                          cy={n.y - r * 0.08}
                          r={r * 0.18}
                          fill="currentColor"
                        />
                        {/* рот */}
                        <line
                          x1={n.x - r * 0.42}
                          y1={n.y + r * 0.45}
                          x2={n.x + r * 0.42}
                          y2={n.y + r * 0.45}
                          stroke="currentColor"
                          strokeWidth={r * 0.11}
                          strokeLinecap="round"
                          strokeOpacity={0.85}
                        />
                      </motion.g>
                    );
                  })}
                </g>
              </motion.svg>
            </motion.div>
          ) : (
            <motion.div
              key="wordmark"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "backOut" }}
              className="flex flex-col items-center px-6 text-center"
            >
              <Link
                href="/about"
                className="pointer-events-auto group no-underline"
                aria-label="О Finekot Systems"
              >
                <div className="text-4xl sm:text-6xl tracking-tight text-[var(--fg)] flex items-baseline justify-center flex-wrap transition group-hover:opacity-90">
                  <span className="group-hover:text-[var(--accent)] transition-colors">
                    Finekot
                  </span>
                  <span className="ml-2 sm:ml-3 text-[var(--accent)] group-hover:brightness-125 transition">
                    Systems
                  </span>
                  <motion.span
                    className="inline-block w-[0.08em] h-[0.85em] ml-2 bg-[var(--accent)]"
                    animate={taglineShown ? { opacity: 0 } : { opacity: [1, 0, 1] }}
                    transition={
                      taglineShown
                        ? { duration: 0.4 }
                        : { duration: 1, repeat: Infinity }
                    }
                  />
                </div>
              </Link>
              <AnimatePresence>
                {taglineShown && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-5 text-xs sm:text-sm opacity-75 tracking-[0.3em] uppercase"
                  >
                    AI engineering &amp; symbiosis
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 text-[10px] sm:text-xs opacity-50 tracking-[0.4em]">
        GENESIS · MESH
      </div>
    </main>
  );
}
