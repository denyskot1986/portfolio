"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/lang-context";
import type { Lang } from "@/lib/i18n";

// Assembly-bay placeholder handle. Real TG pool wiring is out of scope for
// the demo — the number changes per reload to feel "unique instance".
function pickHandle(): string {
  const n = 1000 + Math.floor(Math.random() * 9000);
  return `borya_${n}`;
}

const BOOT_LINES: string[] = [
  "[00:00] POST /webhook/stripe · payment_intent.succeeded · user_id=8471",
  "[00:01] $ kubectl apply -f borya-pod.yaml · gpu=A100 · vram=80GB",
  "[00:02] vLLM runtime · llama-3.3-70b · personality.yaml → humor=0.84",
  "[00:03] tool_registry=[gmail, calendar, notion, shopify] · voice=ElevenLabs v3 ✓",
  "[00:04] bot.set_webhook('/tg/borya_3553') → HTTP 200 · borya online ✓",
];

const COPY: Record<
  Lang,
  {
    header: string;
    subtitle: string;
    backHome: string;
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
    meetBoris: "Meet Boris",
    firstMsg: "\"Oh, I'm alive! My name is Boris. And you are?\"",
    replay: "Replay assembly",
    legend: "Each Boris is a unique instance — not a copy.",
    caption: "demo · live assembly line",
    handlePrefix: "your handle",
  },
  RU: {
    header: "FINEKOT · сборочный цех",
    subtitle: "собираем вашего Бориса",
    backHome: "← назад",
    meetBoris: "Встретить Бориса",
    firstMsg: "«О, я жив! Меня зовут Борис. А ты кто?»",
    replay: "Повторить сборку",
    legend: "Каждый Борис — уникальный экземпляр, не копия.",
    caption: "демо · сборочная линия",
    handlePrefix: "ваш handle",
  },
  UA: {
    header: "FINEKOT · складальний цех",
    subtitle: "збираємо вашого Бориса",
    backHome: "← назад",
    meetBoris: "Зустріти Бориса",
    firstMsg: "«О, я живий! Мене звати Борис. А ти хто?»",
    replay: "Повторити збірку",
    legend: "Кожен Борис — унікальний екземпляр, не копія.",
    caption: "демо · складальна лінія",
    handlePrefix: "ваш handle",
  },
};

const LINE_DELAY_MS = 180;
const CHAR_DELAY_MS = 5;

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

    let cumulative = 150;
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

  // Typewriter for the first-message greeting — starts once the boot
  // sequence finishes, mirrors the per-character pacing of the log.
  const [greeting, setGreeting] = useState("");
  const [greetingDone, setGreetingDone] = useState(false);
  useEffect(() => {
    setGreeting("");
    setGreetingDone(false);
    if (!finished) return;
    if (reducedMotion) {
      setGreeting(t.firstMsg);
      setGreetingDone(true);
      return;
    }
    const full = t.firstMsg;
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    const startAfter = 350;
    for (let i = 1; i <= full.length; i++) {
      timers.push(
        setTimeout(() => {
          setGreeting(full.slice(0, i));
          if (i === full.length) setGreetingDone(true);
        }, startAfter + i * 36)
      );
    }
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [finished, reducedMotion, t.firstMsg, runId]);

  // Auto-scroll the stream as new characters appear.
  useEffect(() => {
    const el = streamRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines, greeting, finished]);

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

              {finished && (
                <div className="mt-5 mb-2">
                  <div
                    className="text-[14px] sm:text-[15px] italic leading-relaxed"
                    style={{
                      color: "#fff1c9",
                      textShadow: "0 0 6px rgba(255, 220, 130, 0.28)",
                    }}
                  >
                    {greeting}
                    {!greetingDone && (
                      <span
                        className="inline-block align-[-2px] ml-[2px]"
                        style={{
                          width: "0.55em",
                          height: "1em",
                          background: "#fff1c9",
                          boxShadow:
                            "0 0 8px rgba(255, 220, 130, 0.7)",
                          animation: "factoryBlink 0.9s steps(1) infinite",
                        }}
                      />
                    )}
                  </div>

                  {greetingDone && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <div
                        className="mt-3 text-[11px]"
                        style={{ color: "rgba(217, 255, 224, 0.6)" }}
                      >
                        {t.handlePrefix}:{" "}
                        <span style={{ color: "#ffb000" }}>
                          t.me/{handle}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2.5">
                        <Link
                          href="/products/boris"
                          className="inline-flex items-center gap-2 px-4 h-10 text-[12px] uppercase tracking-[0.2em] transition-all"
                          style={{
                            background: "rgba(0, 255, 65, 0.08)",
                            color: "#00ff41",
                            border: "1px solid rgba(0, 255, 65, 0.55)",
                            borderRadius: "4px",
                            fontWeight: 700,
                            textShadow: "0 0 6px rgba(0, 255, 65, 0.5)",
                          }}
                        >
                          <span aria-hidden>✦</span>
                          <span>{t.meetBoris}</span>
                        </Link>
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
                            textShadow: "0 0 6px rgba(0, 255, 65, 0.5)",
                          }}
                        >
                          <span aria-hidden>↻</span>
                          <span>{t.replay}</span>
                        </button>
                      </div>

                      <div
                        className="mt-4 text-[10px] uppercase"
                        style={{
                          color: "rgba(217, 255, 224, 0.4)",
                          letterSpacing: "0.22em",
                        }}
                      >
                        {t.legend}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
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
