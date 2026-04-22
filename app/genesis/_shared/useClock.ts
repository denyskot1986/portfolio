"use client";

import { useEffect, useRef, useState } from "react";

export function useReducedMotion() {
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

export function useAnimationClock(totalMs: number) {
  const reduced = useReducedMotion();
  const [t, setT] = useState(reduced ? totalMs : 0);
  const [key, setKey] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) {
      setT(totalMs);
      return;
    }
    startRef.current = null;
    setT(0);
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      if (elapsed >= totalMs) {
        setT(totalMs);
        return;
      }
      setT(elapsed);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [key, reduced, totalMs]);

  const replay = () => setKey((k) => k + 1);
  return { t, replay, reduced };
}
