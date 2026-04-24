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

type Copy = {
  header: string;
  subtitle: string;
  backHome: string;
  meetBoris: string;
  firstMsg: string;
  replay: string;
  legend: string;
  caption: string;
  handlePrefix: string;
  pitchHeader: string;
  pitchOneLiner: string;
  spec: Array<[string, string]>;
  pricing: string;
  fullSpec: string;
};

const COPY: Record<Lang, Copy> = {
  EN: {
    header: "Agent Forge — turnkey agent assembly",
    subtitle: "forging your Boris instance",
    backHome: "← back",
    meetBoris: "Meet Boris",
    firstMsg: "\"Oh, I'm alive! My name is Boris. And you are?\"",
    replay: "Replay assembly",
    legend: "Each Boris is a unique instance — not a copy.",
    caption: "demo · live assembly line",
    handlePrefix: "your handle",
    pitchHeader: "// who is Boris",
    pitchOneLiner:
      "A second brain that lives in your Telegram. Not a plugin, not a chatbot — an AI chief of staff that remembers everything and actually pulls your own tools.",
    spec: [
      ["role", "personal AI chief of staff"],
      ["memory", "persistent · unlimited · yours"],
      ["tools", "gmail · calendar · notion · shopify · web"],
      ["channel", "Telegram · voice + text"],
      ["uptime", "24/7 · your timezone"],
      ["privacy", "your data stays in your instance"],
    ],
    pricing: "$149 / month · cancel anytime · no setup fee",
    fullSpec: "full spec & checkout →",
  },
  RU: {
    header: "Агент Forge — сборка агентов под ключ",
    subtitle: "собираем вашего Бориса",
    backHome: "← назад",
    meetBoris: "Встретить Бориса",
    firstMsg: "«О, я жив! Меня зовут Борис. А ты кто?»",
    replay: "Повторить сборку",
    legend: "Каждый Борис — уникальный экземпляр, не копия.",
    caption: "демо · сборочная линия",
    handlePrefix: "ваш handle",
    pitchHeader: "// кто такой Борис",
    pitchOneLiner:
      "Второй мозг, живущий у тебя в Telegram. Не плагин, не чат-бот — AI шеф-штаб, который помнит всё и сам дёргает твои рабочие инструменты.",
    spec: [
      ["роль", "персональный AI шеф-штаб"],
      ["память", "persistent · без лимита · твоя"],
      ["tools", "gmail · calendar · notion · shopify · web"],
      ["канал", "Telegram · голос + текст"],
      ["uptime", "24/7 · твой часовой пояс"],
      ["privacy", "данные живут в твоём инстансе"],
    ],
    pricing: "$149 / месяц · отмена в один клик · без setup fee",
    fullSpec: "полная спецификация и оплата →",
  },
  UA: {
    header: "Агент Forge — складання агентів під ключ",
    subtitle: "збираємо вашого Бориса",
    backHome: "← назад",
    meetBoris: "Зустріти Бориса",
    firstMsg: "«О, я живий! Мене звати Борис. А ти хто?»",
    replay: "Повторити збірку",
    legend: "Кожен Борис — унікальний екземпляр, не копія.",
    caption: "демо · складальна лінія",
    handlePrefix: "ваш handle",
    pitchHeader: "// хто такий Борис",
    pitchOneLiner:
      "Другий мозок, що живе у тебе в Telegram. Не плагін, не чат-бот — AI шеф-штаб, який пам'ятає все і сам смикає твої робочі інструменти.",
    spec: [
      ["роль", "персональний AI шеф-штаб"],
      ["пам'ять", "persistent · без ліміту · твоя"],
      ["tools", "gmail · calendar · notion · shopify · web"],
      ["канал", "Telegram · голос + текст"],
      ["uptime", "24/7 · твій часовий пояс"],
      ["privacy", "дані живуть у твоєму інстансі"],
    ],
    pricing: "$149 / місяць · відписка в один клік · без setup fee",
    fullSpec: "повна специфікація та оплата →",
  },
};

const LINE_DELAY_MS = 90;
const CHAR_DELAY_MS = 3;

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
      setLines(BOOT_LINES.map((l) => ({ full: l, visible: l, done: true })));
      setFinished(true);
      return;
    }

    setLines(BOOT_LINES.map((l) => ({ full: l, visible: "", done: false })));

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

// Boot lines are "[00:02] rest-of-line" — we colour the timestamp in accent2
// (orange) and the body in accent (green) to match the site palette.
function BootLine({ line, isActive }: { line: TypedLine; isActive: boolean }) {
  const match = line.visible.match(/^(\[\d{2}:\d{2}\])(\s*)(.*)$/);
  const caret = isActive ? (
    <span
      className="inline-block align-[-2px] ml-[2px]"
      style={{
        width: "0.55em",
        height: "1em",
        background: "var(--accent)",
        boxShadow: "0 0 8px rgba(var(--accent-rgb), 0.8)",
        animation: "factoryBlink 0.9s steps(1) infinite",
      }}
    />
  ) : null;

  if (!match) {
    return (
      <div style={{ color: "var(--accent)" }}>
        {line.visible}
        {caret}
      </div>
    );
  }
  const [, ts, sp, rest] = match;
  return (
    <div style={{ color: "var(--accent)" }}>
      <span style={{ color: "var(--accent2)" }}>{ts}</span>
      <span>{sp}</span>
      <span>{rest}</span>
      {caret}
    </div>
  );
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

  // Pitch block types line-by-line after the greeting lands.
  const pitchRawLines = useMemo<string[]>(() => {
    const out: string[] = [];
    out.push(t.pitchHeader);
    out.push(t.pitchOneLiner);
    out.push("$ boris.spec");
    for (const [, v] of t.spec) out.push(v);
    out.push("$ pricing");
    out.push(t.pricing);
    out.push(t.fullSpec);
    return out;
  }, [t]);

  const [pitchVisible, setPitchVisible] = useState<string[]>([]);
  const [pitchDone, setPitchDone] = useState(false);

  useEffect(() => {
    setPitchVisible(pitchRawLines.map(() => ""));
    setPitchDone(false);
    if (!greetingDone) return;
    if (reducedMotion) {
      setPitchVisible(pitchRawLines.slice());
      setPitchDone(true);
      return;
    }
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    const CHAR = 3;
    const GAP = 70;
    let cumulative = 250;
    pitchRawLines.forEach((line, idx) => {
      for (let i = 1; i <= line.length; i++) {
        timers.push(
          setTimeout(() => {
            setPitchVisible((prev) => {
              const next = prev.slice();
              next[idx] = line.slice(0, i);
              return next;
            });
          }, cumulative + i * CHAR)
        );
      }
      cumulative += line.length * CHAR + GAP;
    });
    timers.push(setTimeout(() => setPitchDone(true), cumulative + 150));
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [greetingDone, reducedMotion, pitchRawLines, runId]);

  const pitchActiveIdx = pitchVisible.findIndex(
    (v, i) => v.length > 0 && v.length < pitchRawLines[i].length
  );

  // Auto-scroll the stream as new characters appear.
  useEffect(() => {
    const el = streamRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines, greeting, finished, pitchVisible]);

  // Esc returns to home — useful for demos.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const restart = useCallback(() => setRunId((n) => n + 1), []);

  const caret = (
    <span
      className="inline-block align-[-2px] ml-[2px]"
      style={{
        width: "0.55em",
        height: "1em",
        background: "var(--accent)",
        boxShadow: "0 0 8px rgba(var(--accent-rgb), 0.8)",
        animation: "factoryBlink 0.9s steps(1) infinite",
      }}
    />
  );

  return (
    <div
      className="fixed inset-0 font-mono overflow-hidden"
      style={{
        background: "var(--bg)",
        color: "var(--fg)",
        paddingTop: "var(--chat-top-h, 0px)",
        paddingBottom: "var(--chat-bar-h, 72px)",
      }}
    >
      <div className="relative h-full w-full flex flex-col">
        {/* Top bar — same tokens as the rest of the site */}
        <div
          className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 text-[11px] uppercase tracking-[0.22em]"
          style={{
            borderBottom: "1px solid var(--glass-border)",
            color: "var(--accent)",
            background: "rgba(var(--accent-rgb), 0.03)",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 10px rgba(var(--accent-rgb), 0.9)",
              }}
            />
            <span>{t.header}</span>
          </div>
          <Link
            href="/"
            className="transition-colors"
            style={{ color: "var(--accent2)" }}
          >
            {t.backHome}
          </Link>
        </div>

        {/* Stream area wrapped in the site terminal-card */}
        <div className="flex-1 min-h-0 flex items-stretch justify-center px-3 sm:px-6 py-4 sm:py-6">
          <div
            className="w-full max-w-3xl flex flex-col rounded-lg overflow-hidden"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              boxShadow:
                "0 0 28px rgba(var(--accent-rgb), 0.14), inset 0 0 32px rgba(var(--accent-rgb), 0.02)",
            }}
          >
            {/* Terminal header with site-standard dots (red/orange/green squares) */}
            <div className="terminal-card-header shrink-0">
              <span className="term-dot term-dot-r" />
              <span className="term-dot term-dot-y" />
              <span className="term-dot term-dot-g" />
              <span className="term-filename">forge/assembly.log</span>
              <span
                className="term-tag term-tag-live ml-auto"
                style={{ textTransform: "uppercase" }}
              >
                {t.caption}
              </span>
            </div>

            <div
              ref={streamRef}
              className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 text-[13px] sm:text-[14px] leading-[1.65]"
            >
              {/* Subtitle tucked inside the stream, accent2 for the label */}
              <div
                className="text-[10px] uppercase mb-3"
                style={{
                  color: "var(--accent2)",
                  letterSpacing: "0.22em",
                  opacity: 0.85,
                }}
              >
                // {t.subtitle}
              </div>

              {lines.map((line, idx) => {
                if (line.visible.length === 0) return null;
                const isActive =
                  !line.done &&
                  idx === lines.findIndex((l) => !l.done);
                return <BootLine key={idx} line={line} isActive={isActive} />;
              })}

              {finished && (
                <div className="mt-5 mb-2">
                  {/* Boris greeting — white, the "he's alive" moment */}
                  <div
                    className="text-[14px] sm:text-[15px] italic leading-relaxed"
                    style={{
                      color: "#ffffff",
                      textShadow:
                        "0 0 10px rgba(var(--accent-rgb), 0.35)",
                    }}
                  >
                    {greeting}
                    {!greetingDone && (
                      <span
                        className="inline-block align-[-2px] ml-[2px]"
                        style={{
                          width: "0.55em",
                          height: "1em",
                          background: "#ffffff",
                          boxShadow:
                            "0 0 8px rgba(255, 255, 255, 0.55)",
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
                        style={{ color: "var(--muted)" }}
                      >
                        {t.handlePrefix}:{" "}
                        <span style={{ color: "var(--accent2)" }}>
                          t.me/{handle}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2.5">
                        <Link
                          href="/products/boris"
                          className="btn-terminal"
                          style={{
                            fontSize: 12,
                            padding: "10px 20px",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                          }}
                        >
                          <span aria-hidden>✦</span>
                          <span>{t.meetBoris}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={restart}
                          className="btn-terminal"
                          style={{
                            fontSize: 12,
                            padding: "10px 20px",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "var(--accent2)",
                            borderColor: "var(--accent2)",
                            textShadow:
                              "0 0 6px rgba(var(--accent2-rgb), 0.6)",
                            boxShadow:
                              "inset 0 0 14px rgba(var(--accent2-rgb), 0.05), 0 0 12px rgba(var(--accent2-rgb), 0.15)",
                          }}
                        >
                          <span aria-hidden>↻</span>
                          <span>{t.replay}</span>
                        </button>
                      </div>

                      <div
                        className="mt-6 pt-5"
                        style={{
                          borderTop:
                            "1px dashed rgba(var(--accent-rgb), 0.22)",
                        }}
                      >
                        {(() => {
                          const SPEC_OFFSET = 3;
                          const specCount = t.spec.length;
                          const pricingHeaderIdx = SPEC_OFFSET + specCount;
                          const pricingIdx = pricingHeaderIdx + 1;
                          const ctaIdx = pricingIdx + 1;
                          return (
                            <>
                              {pitchVisible[0] && (
                                <div
                                  className="text-[10px] uppercase"
                                  style={{
                                    color: "var(--accent2)",
                                    letterSpacing: "0.22em",
                                  }}
                                >
                                  {pitchVisible[0]}
                                  {pitchActiveIdx === 0 && caret}
                                </div>
                              )}

                              {pitchVisible[1] && (
                                <div
                                  className="mt-2 text-[13px] sm:text-[14px] leading-relaxed"
                                  style={{ color: "#ffffff", opacity: 0.92 }}
                                >
                                  {pitchVisible[1]}
                                  {pitchActiveIdx === 1 && caret}
                                </div>
                              )}

                              {pitchVisible[2] && (
                                <div
                                  className="mt-4 text-[12px]"
                                  style={{
                                    color: "var(--accent)",
                                    textShadow:
                                      "0 0 6px rgba(var(--accent-rgb), 0.35)",
                                  }}
                                >
                                  {pitchVisible[2]}
                                  {pitchActiveIdx === 2 && caret}
                                </div>
                              )}

                              {(() => {
                                const anyRow = t.spec.some(
                                  (_, idx) =>
                                    !!pitchVisible[SPEC_OFFSET + idx]
                                );
                                if (!anyRow) return null;
                                return (
                                  <div
                                    className="mt-2 text-[12px] leading-[1.75]"
                                    style={{ color: "var(--fg)" }}
                                  >
                                    {t.spec.map(([k], idx) => {
                                      const i = SPEC_OFFSET + idx;
                                      const v = pitchVisible[i];
                                      if (!v) return null;
                                      return (
                                        <div
                                          key={k}
                                          className="flex flex-wrap gap-x-3"
                                        >
                                          <span
                                            style={{
                                              color: "var(--accent2)",
                                              minWidth: "8ch",
                                              display: "inline-block",
                                              opacity: 0.85,
                                            }}
                                          >
                                            {k}
                                          </span>
                                          <span
                                            className="flex-1"
                                            style={{ color: "#ffffff", opacity: 0.88 }}
                                          >
                                            {v}
                                            {pitchActiveIdx === i && caret}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}

                              {pitchVisible[pricingHeaderIdx] && (
                                <div
                                  className="mt-4 text-[12px]"
                                  style={{
                                    color: "var(--accent)",
                                    textShadow:
                                      "0 0 6px rgba(var(--accent-rgb), 0.35)",
                                  }}
                                >
                                  {pitchVisible[pricingHeaderIdx]}
                                  {pitchActiveIdx === pricingHeaderIdx &&
                                    caret}
                                </div>
                              )}

                              {pitchVisible[pricingIdx] && (
                                <div
                                  className="mt-1 text-[13px]"
                                  style={{ color: "var(--accent2)" }}
                                >
                                  {pitchVisible[pricingIdx]}
                                  {pitchActiveIdx === pricingIdx && caret}
                                </div>
                              )}

                              {pitchVisible[ctaIdx] && (
                                <Link
                                  href="/products/boris"
                                  className="mt-4 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] transition-all"
                                  style={{
                                    padding: "8px 14px",
                                    background: "rgba(var(--accent2-rgb), 0.06)",
                                    border:
                                      "1px solid rgba(var(--accent2-rgb), 0.5)",
                                    borderRadius: 4,
                                    color: "var(--accent2)",
                                    fontWeight: 700,
                                    textShadow:
                                      "0 0 6px rgba(var(--accent2-rgb), 0.5)",
                                    boxShadow:
                                      "0 0 10px rgba(var(--accent2-rgb), 0.15)",
                                  }}
                                >
                                  <span>
                                    {pitchVisible[ctaIdx]}
                                    {pitchActiveIdx === ctaIdx && caret}
                                  </span>
                                </Link>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      <div
                        className="mt-5 text-[10px] uppercase"
                        style={{
                          color: "var(--muted)",
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
