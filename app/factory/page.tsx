"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/lang-context";
import type { Lang } from "@/lib/i18n";

// Assembly-bay placeholder handle. Real TG pool wiring is out of scope for
// the demo — the number changes per reload to feel "unique instance".
function pickHandle(): string {
  const n = 1000 + Math.floor(Math.random() * 9000);
  return `borya_${n}`;
}

const BOOT_LINES: string[] = [
  "[00:00] Incoming payment confirmed → user #8471",
  "[00:01] Allocating compute node... eu-west-3/borya-pod-42 ✓",
  "[00:02] Loading base image: borya-v3.7.img (2.1 TB)",
  "[00:03] Spinning up cognitive core...",
  "[00:04] Training combat module: Bjj, Muay Thai, dirty tricks ✓",
  "[00:05] Injecting personality matrix: humor=84%, sarcasm=91%",
  "[00:06] Защищаем потоки данных: TLS 1.3, E2E ✓",
  "[00:07] Выделяем приватный сервер: 64 vCPU, 512 GB RAM",
  "[00:08] Running 4.2M inference ops... ████████░░ 78%",
  "[00:09] Обучаем логике принятия решений ✓",
  "[00:10] Не кормим два дня — чтобы был злее ⚠",
  "[00:11] Calibrating voice: low, raspy, slight Odessa accent",
  "[00:12] Final QA pass... ✓",
  "[00:13] ⟨READY⟩",
];

const COPY: Record<
  Lang,
  {
    header: string;
    subtitle: string;
    backHome: string;
    ready: string;
    readyTagline: string;
    meetBoris: string;
    firstMsg: string;
    replay: string;
    legend: string;
    caption: string;
    handlePrefix: string;
  }
> = {
  EN: {
    header: "FINEKOT · assembly bay",
    subtitle: "forging your Boris instance",
    backHome: "← back",
    ready: "READY",
    readyTagline: "your personal Boris is alive",
    meetBoris: "Meet Boris",
    firstMsg:
      '"Oh, I\'m alive! Hi. What should I call you?"',
    replay: "Replay assembly",
    legend: "Each Boris is a unique instance — not a copy.",
    caption: "demo · live assembly line",
    handlePrefix: "your handle",
  },
  RU: {
    header: "FINEKOT · сборочный цех",
    subtitle: "собираем вашего Бориса",
    backHome: "← назад",
    ready: "ГОТОВ",
    readyTagline: "ваш личный Борис ожил",
    meetBoris: "Встретить Бориса",
    firstMsg:
      "«О, я жив! Привет. Как к тебе обращаться?»",
    replay: "Повторить сборку",
    legend: "Каждый Борис — уникальный экземпляр, не копия.",
    caption: "демо · сборочная линия",
    handlePrefix: "ваш handle",
  },
  UA: {
    header: "FINEKOT · складальний цех",
    subtitle: "збираємо вашого Бориса",
    backHome: "← назад",
    ready: "ГОТОВИЙ",
    readyTagline: "ваш особистий Борис ожив",
    meetBoris: "Зустріти Бориса",
    firstMsg:
      "«О, я живий! Привіт. Як до тебе звертатись?»",
    replay: "Повторити збірку",
    legend: "Кожен Борис — унікальний екземпляр, не копія.",
    caption: "демо · складальна лінія",
    handlePrefix: "ваш handle",
  },
};

const LINE_DELAY_MS = 650;
const CHAR_DELAY_MS = 14;

type TypedLine = {
  full: string;
  visible: string;
  done: boolean;
};

function useBootSequence(reducedMotion: boolean, runId: number) {
  const [lines, setLines] = useState<TypedLine[]>(() =>
    BOOT_LINES.map((l) => ({ full: l, visible: "", done: false }))
  );
  const [finished, setFinished] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setFinished(false);

    if (reducedMotion) {
      setLines(
        BOOT_LINES.map((l) => ({ full: l, visible: l, done: true }))
      );
      setFinished(true);
      return;
    }

    setLines(
      BOOT_LINES.map((l) => ({ full: l, visible: "", done: false }))
    );

    let cumulative = 400;
    BOOT_LINES.forEach((line, idx) => {
      for (let i = 1; i <= line.length; i++) {
        const t = setTimeout(() => {
          setLines((prev) => {
            const next = prev.slice();
            next[idx] = {
              full: line,
              visible: line.slice(0, i),
              done: i === line.length,
            };
            return next;
          });
        }, cumulative + i * CHAR_DELAY_MS);
        timers.current.push(t);
      }
      cumulative += line.length * CHAR_DELAY_MS + LINE_DELAY_MS;
    });

    const finishT = setTimeout(() => setFinished(true), cumulative + 300);
    timers.current.push(finishT);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [reducedMotion, runId]);

  return { lines, finished };
}

export default function FactoryPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = COPY[lang];
  const reducedMotion = useReducedMotion() ?? false;
  const [runId, setRunId] = useState(0);
  const handle = useMemo(() => pickHandle(), [runId]);
  const { lines, finished } = useBootSequence(reducedMotion, runId);
  const streamRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the stream as new characters appear.
  useEffect(() => {
    const el = streamRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines]);

  // Esc returns to home — useful for demos.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const restart = useCallback(() => setRunId((n) => n + 1), []);

  return (
    <div
      className="fixed inset-0 font-mono overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(0, 64, 24, 0.35) 0%, rgba(4, 2, 8, 1) 65%)",
        color: "#d9ffe0",
        paddingTop: "var(--chat-top-h, 0px)",
        paddingBottom: "var(--chat-bar-h, 72px)",
      }}
    >
      {/* CRT scanlines overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0, 255, 65, 0.18) 0px, rgba(0, 255, 65, 0.18) 1px, transparent 1px, transparent 3px)",
        }}
      />

      <div className="relative h-full w-full flex flex-col">
        {/* Top bar */}
        <div
          className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 text-[11px] uppercase tracking-[0.22em]"
          style={{
            borderBottom: "1px solid rgba(0, 255, 65, 0.25)",
            color: "rgba(0, 255, 65, 0.78)",
            background: "rgba(4, 2, 8, 0.6)",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{
                background: "#00ff41",
                boxShadow: "0 0 10px rgba(0, 255, 65, 0.9)",
              }}
            />
            <span>{t.header}</span>
          </div>
          <Link
            href="/"
            className="transition-colors"
            style={{ color: "rgba(255, 176, 0, 0.9)" }}
          >
            {t.backHome}
          </Link>
        </div>

        {/* Stream area */}
        <div className="flex-1 min-h-0 flex items-stretch justify-center px-3 sm:px-6 py-4 sm:py-6">
          <div
            className="w-full max-w-3xl flex flex-col"
            style={{
              background: "rgba(2, 10, 4, 0.82)",
              border: "1px solid rgba(0, 255, 65, 0.35)",
              borderRadius: "6px",
              boxShadow:
                "0 0 32px rgba(0, 255, 65, 0.18), inset 0 0 60px rgba(0, 255, 65, 0.05)",
            }}
          >
            <div
              className="shrink-0 flex items-center justify-between px-3 py-1.5 text-[10px] uppercase"
              style={{
                borderBottom: "1px solid rgba(0, 255, 65, 0.25)",
                color: "rgba(0, 255, 65, 0.7)",
                letterSpacing: "0.22em",
              }}
            >
              <span>{t.subtitle}</span>
              <span style={{ color: "rgba(255, 176, 0, 0.7)" }}>
                {t.caption}
              </span>
            </div>

            <div
              ref={streamRef}
              className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 text-[13px] sm:text-[14px] leading-[1.65]"
              style={{
                color: "#9cffb1",
                textShadow: "0 0 6px rgba(0, 255, 65, 0.35)",
              }}
            >
              {lines.map((line, idx) => {
                const isActive =
                  !line.done &&
                  line.visible.length > 0 &&
                  idx === lines.findIndex((l) => !l.done);
                if (line.visible.length === 0) return null;
                const isReady = line.full.includes("⟨READY⟩");
                return (
                  <div
                    key={idx}
                    style={{
                      color: isReady ? "#ffffff" : undefined,
                      textShadow: isReady
                        ? "0 0 12px rgba(0, 255, 120, 0.95)"
                        : undefined,
                      fontWeight: isReady ? 700 : 400,
                      letterSpacing: isReady ? "0.08em" : undefined,
                    }}
                  >
                    {line.visible}
                    {isActive && (
                      <span
                        className="inline-block align-[-2px] ml-[2px]"
                        style={{
                          width: "0.55em",
                          height: "1em",
                          background: "#00ff41",
                          boxShadow: "0 0 8px rgba(0, 255, 65, 0.8)",
                          animation: "factoryBlink 0.9s steps(1) infinite",
                        }}
                      />
                    )}
                  </div>
                );
              })}

              <AnimatePresence>
                {finished && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="mt-6 mb-2 px-4 py-5 text-center"
                    style={{
                      border: "1px solid rgba(0, 255, 65, 0.55)",
                      borderRadius: "4px",
                      background:
                        "linear-gradient(180deg, rgba(0, 255, 65, 0.08), rgba(0, 255, 65, 0.02))",
                      boxShadow: "0 0 28px rgba(0, 255, 65, 0.22)",
                    }}
                  >
                    <motion.div
                      animate={
                        reducedMotion
                          ? undefined
                          : { opacity: [0.85, 1, 0.85] }
                      }
                      transition={{ duration: 1.6, repeat: Infinity }}
                      className="text-2xl sm:text-3xl tracking-[0.35em]"
                      style={{
                        color: "#ffffff",
                        textShadow:
                          "0 0 18px rgba(0, 255, 120, 0.9), 0 0 32px rgba(0, 255, 120, 0.4)",
                      }}
                    >
                      ⟨ {t.ready} ⟩
                    </motion.div>
                    <div
                      className="mt-2 text-[11px] uppercase"
                      style={{
                        color: "rgba(0, 255, 65, 0.75)",
                        letterSpacing: "0.25em",
                      }}
                    >
                      {t.readyTagline}
                    </div>

                    <div
                      className="mt-4 text-[13px] italic"
                      style={{ color: "#fff1c9" }}
                    >
                      {t.firstMsg}
                    </div>

                    <div
                      className="mt-1 text-[11px]"
                      style={{ color: "rgba(217, 255, 224, 0.6)" }}
                    >
                      {t.handlePrefix}:{" "}
                      <span style={{ color: "#ffb000" }}>
                        t.me/{handle}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                      <a
                        href="https://t.me/shop_by_finekot_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 h-10 text-[12px] uppercase tracking-[0.2em] transition-all"
                        style={{
                          background: "#ffb000",
                          color: "#040208",
                          border: "1px solid #ffb000",
                          borderRadius: "4px",
                          fontWeight: 700,
                          boxShadow: "0 0 22px rgba(255, 176, 0, 0.5)",
                        }}
                      >
                        <span aria-hidden>✦</span>
                        <span>{t.meetBoris}</span>
                      </a>
                      <button
                        type="button"
                        onClick={restart}
                        className="inline-flex items-center gap-2 px-4 h-10 text-[12px] uppercase tracking-[0.2em] transition-all"
                        style={{
                          background: "rgba(0, 255, 65, 0.08)",
                          color: "#00ff41",
                          border: "1px solid rgba(0, 255, 65, 0.55)",
                          borderRadius: "4px",
                          fontWeight: 700,
                        }}
                      >
                        <span aria-hidden>↻</span>
                        <span>{t.replay}</span>
                      </button>
                    </div>

                    <div
                      className="mt-4 text-[10px] uppercase"
                      style={{
                        color: "rgba(217, 255, 224, 0.45)",
                        letterSpacing: "0.22em",
                      }}
                    >
                      {t.legend}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes factoryBlink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
