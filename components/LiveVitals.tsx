"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface LiveVitalsProps {
  slug: string;
  agentName: string;
}

// Tiny deterministic PRNG so SSR and first client render agree — we only need
// stable baseline numbers, not cryptographic quality.
function hash32(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fmtUptime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600) % 100;
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function LiveVitals({ slug, agentName }: LiveVitalsProps) {
  const reduced = useReducedMotion() ?? false;

  // Baseline seeded on slug only — SSR and client render must agree, so we
  // can't mix in Date.now() or new Date() here.
  const baseline = useMemo(() => {
    const seed = hash32(slug);
    const rnd = mulberry32(seed);
    return {
      uptime: 3600 + Math.floor(rnd() * 18 * 3600), // 1..19h
      tasks: 400 + Math.floor(rnd() * 1800),
    };
  }, [slug]);

  const [uptime, setUptime] = useState(baseline.uptime);
  const [tasks, setTasks] = useState(baseline.tasks);
  const [lastSignal, setLastSignal] = useState(4);
  const [rate, setRate] = useState(3);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (reduced) return;
    const uptimeT = setInterval(() => setUptime((u) => u + 1), 1000);
    const tasksT = setInterval(() => {
      // small tick — 2-6 tasks per step
      const delta = 2 + Math.floor(Math.random() * 5);
      setTasks((v) => v + delta);
      setRate(1 + Math.floor(Math.random() * 5));
    }, 2800);
    const signalT = setInterval(() => {
      setLastSignal(Math.max(1, Math.floor(Math.random() * 9)));
    }, 1500);
    return () => {
      clearInterval(uptimeT);
      clearInterval(tasksT);
      clearInterval(signalT);
    };
  }, [reduced]);

  // Hide on narrow viewports through collapse; still accessible with a tap
  const onClick = () => setCollapsed((c) => !c);

  return (
    <div
      className="fixed z-40 font-mono select-none"
      style={{
        top: "calc(var(--chat-top-h, 34px) + 70px)",
        right: 14,
      }}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={onClick}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] uppercase tracking-[0.2em]"
          style={{
            background: "rgba(2,10,4,0.82)",
            border: "1px solid rgba(0,255,65,0.35)",
            color: "rgba(0,255,65,0.85)",
            textShadow: "0 0 6px rgba(0,255,65,0.4)",
          }}
          aria-label="expand live vitals"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "#00ff41", boxShadow: "0 0 6px rgba(0,255,65,0.8)", animation: reduced ? undefined : "liveVitalsPulse 2s ease-in-out infinite" }} />
          {slug}
        </button>
      ) : (
        <div
          onClick={onClick}
          role="button"
          tabIndex={0}
          className="px-3 py-2 rounded text-[10.5px] leading-[1.5] cursor-pointer"
          style={{
            background: "rgba(2,10,4,0.82)",
            border: "1px solid rgba(0,255,65,0.32)",
            color: "rgba(217,255,224,0.85)",
            minWidth: 170,
            boxShadow: "0 0 14px rgba(0,255,65,0.08), inset 0 0 24px rgba(0,255,65,0.04)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-1" style={{ color: "rgba(0,255,65,0.9)", textShadow: "0 0 6px rgba(0,255,65,0.5)" }}>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{
                background: "#00ff41",
                boxShadow: "0 0 6px rgba(0,255,65,0.8)",
                animation: reduced ? undefined : "liveVitalsPulse 2s ease-in-out infinite",
              }}
            />
            <span className="uppercase tracking-[0.18em]">
              {slug} · online
            </span>
          </div>

          <Row k="uptime" v={fmtUptime(uptime)} />
          <Row k="tasks" v={`${tasks.toLocaleString("en-US")} +${rate}/min`} />
          <Row k="signal" v={`${lastSignal}s ago`} />

          <div className="mt-1 text-[9px] uppercase tracking-[0.22em]" style={{ color: "rgba(217,255,224,0.35)" }}>
            {agentName.toLowerCase()} vitals
          </div>
        </div>
      )}

      <style>{`
        @keyframes liveVitalsPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.35; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span style={{ color: "rgba(0,255,65,0.55)" }}>{k}</span>
      <span className="tabular-nums">{v}</span>
    </div>
  );
}
