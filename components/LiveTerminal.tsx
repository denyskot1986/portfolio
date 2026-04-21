"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface LiveTerminalProps {
  slug: string;
  agentName: string;
  cycle?: string[];
  title?: string;
}

const CHAR_DELAY_MS = 4;
const LINE_GAP_MS = 90;

function defaultCycle(slug: string, name: string): string[] {
  const first = name.toLowerCase();
  return [
    `$ ${first}.run --task "handle incoming request"`,
    "[14:23:41] query received · decomposing",
    "[14:23:41] context window prepared",
    "[14:23:42] tools.available = 6 · selecting …",
    "[14:23:44] tools.exec(search, read, synthesize)",
    "[14:23:46] synthesizing result…",
    "[14:23:48] done. confidence: high.",
    `          → delivered to Commander`,
  ];
}

export default function LiveTerminal({ slug, agentName, cycle, title }: LiveTerminalProps) {
  const reduced = useReducedMotion() ?? false;
  const lines = useMemo(
    () => (cycle && cycle.length ? cycle : defaultCycle(slug, agentName)),
    [cycle, slug, agentName]
  );

  const [visible, setVisible] = useState(false);
  const [runId, setRunId] = useState(0);
  const [typed, setTyped] = useState<string[]>(lines.map(() => ""));
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Start on scroll-into-view once
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (reduced) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "-40px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTyped(lines.map(() => ""));
    setDone(false);
    if (!visible) return;

    if (reduced) {
      setTyped(lines.slice());
      setDone(true);
      return;
    }

    let cumulative = 200;
    lines.forEach((line, idx) => {
      for (let i = 1; i <= line.length; i++) {
        const t = setTimeout(() => {
          setTyped((prev) => {
            const next = prev.slice();
            next[idx] = line.slice(0, i);
            return next;
          });
        }, cumulative + i * CHAR_DELAY_MS);
        timers.current.push(t);
      }
      cumulative += line.length * CHAR_DELAY_MS + LINE_GAP_MS;
    });
    const finish = setTimeout(() => setDone(true), cumulative + 400);
    timers.current.push(finish);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [visible, runId, lines, reduced]);

  useEffect(() => {
    const el = streamRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [typed]);

  const activeIdx = typed.findIndex((v, i) => v.length > 0 && v.length < lines[i].length);

  return (
    <div
      ref={rootRef}
      className="w-full"
      style={{
        background: "rgba(2,10,4,0.82)",
        border: "1px solid rgba(0,255,65,0.32)",
        borderRadius: 8,
        boxShadow: "0 0 22px rgba(0,255,65,0.10), inset 0 0 40px rgba(0,255,65,0.04)",
      }}
    >
      {/* header: mac dots + filename + live tag + replay */}
      <div
        className="flex items-center justify-between px-3 py-2 text-[10px] uppercase tracking-[0.22em]"
        style={{ borderBottom: "1px solid rgba(0,255,65,0.25)", color: "rgba(0,255,65,0.7)" }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#ff5f57" }} />
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#febc2e" }} />
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#28c840" }} />
          <span className="ml-2" style={{ color: "rgba(0,255,65,0.55)" }}>
            {title ?? `${slug}.run.log`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" style={{ color: "#ffb000" }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "#ffb000", boxShadow: "0 0 6px rgba(255,176,0,0.7)" }} />
            live
          </span>
          <button
            type="button"
            onClick={() => setRunId((n) => n + 1)}
            className="text-[10px] uppercase tracking-[0.22em] transition-colors"
            style={{ color: "rgba(0,255,65,0.55)" }}
          >
            ↻ replay
          </button>
        </div>
      </div>

      <div
        ref={streamRef}
        className="px-4 sm:px-5 py-4 text-[12.5px] sm:text-[13.5px] leading-[1.65] max-h-[320px] overflow-y-auto font-mono"
        style={{ color: "#9cffb1", textShadow: "0 0 6px rgba(0,255,65,0.32)" }}
      >
        {typed.map((v, idx) => {
          if (!v) return null;
          const isActive = idx === activeIdx;
          const isPrompt = lines[idx].trimStart().startsWith("$");
          return (
            <div key={idx} style={{ color: isPrompt ? "#ffd88a" : undefined }}>
              {v}
              {isActive && (
                <span
                  className="inline-block align-[-2px] ml-[2px]"
                  style={{
                    width: "0.55em",
                    height: "1em",
                    background: "#00ff41",
                    boxShadow: "0 0 8px rgba(0,255,65,0.8)",
                    animation: "liveTerminalBlink 0.9s steps(1) infinite",
                  }}
                />
              )}
            </div>
          );
        })}
        {done && (
          <div className="mt-3 text-[10px] uppercase tracking-[0.22em]" style={{ color: "rgba(0,255,65,0.45)" }}>
            cycle complete · press replay to run again
          </div>
        )}
      </div>

      <style>{`
        @keyframes liveTerminalBlink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
