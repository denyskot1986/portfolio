"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

interface ProductBootProps {
  slug: string;
  agentName: string;
  greeting: string;
  bootLines?: string[];
}

const LINE_DELAY_MS = 80;
const CHAR_DELAY_MS = 3;

function defaultBootLines(slug: string, name: string): string[] {
  const s = slug.toLowerCase();
  return [
    `[00:00] spawning instance · id=${s} · gpu=A100 · vram=80GB`,
    `[00:01] loading ${s}.personality.yaml ✓`,
    `[00:02] connecting memory store · persistent ✓`,
    `[00:03] registering tools: [exa, tavily, crawl, deep-researcher] ✓`,
    `[00:04] ${name.toLowerCase()} online.`,
  ];
}

type TypedLine = { full: string; visible: string; done: boolean };

export default function ProductBoot({ slug, agentName, greeting, bootLines }: ProductBootProps) {
  const reduced = useReducedMotion() ?? false;
  const lines = useMemo(
    () => bootLines && bootLines.length ? bootLines : defaultBootLines(slug, agentName),
    [bootLines, slug, agentName]
  );

  // Default to false so SSR and first client render agree — then flip on after
  // hydration if this session hasn't seen the boot yet.
  const [visible, setVisible] = useState(false);
  const [runId, setRunId] = useState(0);
  const [typed, setTyped] = useState<TypedLine[]>(() => lines.map((l) => ({ full: l, visible: "", done: false })));
  const [logDone, setLogDone] = useState(false);
  const [greetingTxt, setGreetingTxt] = useState("");
  const [greetingDone, setGreetingDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(`products_boot_seen:${slug}`);
      if (!seen) setVisible(true);
    } catch {
      // sessionStorage blocked — skip boot entirely
    }
  }, [slug]);

  useEffect(() => {
    if (!visible) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTyped(lines.map((l) => ({ full: l, visible: "", done: false })));
    setLogDone(false);
    setGreetingTxt("");
    setGreetingDone(false);

    if (reduced) {
      setTyped(lines.map((l) => ({ full: l, visible: l, done: true })));
      setLogDone(true);
      setGreetingTxt(greeting);
      setGreetingDone(true);
      return;
    }

    let cumulative = 120;
    lines.forEach((line, idx) => {
      for (let i = 1; i <= line.length; i++) {
        const t = setTimeout(() => {
          setTyped((prev) => {
            const next = prev.slice();
            next[idx] = { full: line, visible: line.slice(0, i), done: i === line.length };
            return next;
          });
        }, cumulative + i * CHAR_DELAY_MS);
        timers.current.push(t);
      }
      cumulative += line.length * CHAR_DELAY_MS + LINE_DELAY_MS;
    });
    const finishLog = setTimeout(() => setLogDone(true), cumulative + 200);
    timers.current.push(finishLog);

    // greeting starts ~250ms after log done
    const greetStart = cumulative + 450;
    for (let i = 1; i <= greeting.length; i++) {
      const t = setTimeout(() => {
        setGreetingTxt(greeting.slice(0, i));
        if (i === greeting.length) setGreetingDone(true);
      }, greetStart + i * 32);
      timers.current.push(t);
    }

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [visible, runId, lines, reduced, greeting]);

  // Fade out ~1.6s after greeting lands, mark seen
  useEffect(() => {
    if (!greetingDone) return;
    const t = setTimeout(() => {
      try { sessionStorage.setItem(`products_boot_seen:${slug}`, "1"); } catch {}
      setVisible(false);
    }, 1600);
    return () => clearTimeout(t);
  }, [greetingDone, slug]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="boot-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[100] font-mono flex items-center justify-center px-4"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(0,64,24,0.45) 0%, rgba(4,2,8,0.98) 70%)",
          color: "#d9ffe0",
        }}
      >
        {/* CRT scanlines */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.18] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,255,65,0.18) 0px, rgba(0,255,65,0.18) 1px, transparent 1px, transparent 3px)",
          }}
        />

        <div
          className="relative w-full max-w-2xl"
          style={{
            background: "rgba(2,10,4,0.88)",
            border: "1px solid rgba(0,255,65,0.35)",
            borderRadius: 6,
            boxShadow: "0 0 32px rgba(0,255,65,0.18), inset 0 0 60px rgba(0,255,65,0.05)",
          }}
        >
          <div
            className="flex items-center justify-between px-3 py-1.5 text-[10px] uppercase"
            style={{
              borderBottom: "1px solid rgba(0,255,65,0.25)",
              color: "rgba(0,255,65,0.7)",
              letterSpacing: "0.22em",
            }}
          >
            <span>spawning {agentName.toLowerCase()} instance</span>
            <span style={{ color: "rgba(255,176,0,0.7)" }}>cold boot</span>
          </div>

          <div
            className="px-4 sm:px-5 py-4 text-[12.5px] sm:text-[13.5px] leading-[1.65] max-h-[65vh] overflow-y-auto"
            style={{ color: "#9cffb1", textShadow: "0 0 6px rgba(0,255,65,0.35)" }}
          >
            {typed.map((line, idx) => {
              const isActive = !line.done && line.visible.length > 0 && idx === typed.findIndex((l) => !l.done);
              if (line.visible.length === 0) return null;
              return (
                <div key={idx}>
                  {line.visible}
                  {isActive && <BlinkCaret />}
                </div>
              );
            })}

            {logDone && (
              <div className="mt-4 italic" style={{ color: "#fff1c9", textShadow: "0 0 6px rgba(255,220,130,0.28)" }}>
                {greetingTxt}
                {!greetingDone && <BlinkCaret light />}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setRunId((n) => n + 1)}
            className="absolute top-2 right-3 text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "rgba(0,255,65,0.5)" }}
            aria-label="replay boot"
          >
            ↻ replay
          </button>
        </div>

        <style>{`
          @keyframes productBootBlink { 50% { opacity: 0; } }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}

function BlinkCaret({ light }: { light?: boolean }) {
  return (
    <span
      className="inline-block align-[-2px] ml-[2px]"
      style={{
        width: "0.55em",
        height: "1em",
        background: light ? "#fff1c9" : "#00ff41",
        boxShadow: light ? "0 0 8px rgba(255,220,130,0.7)" : "0 0 8px rgba(0,255,65,0.8)",
        animation: "productBootBlink 0.9s steps(1) infinite",
      }}
    />
  );
}
