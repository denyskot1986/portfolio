"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const QUESTION_BUDGET = 20;

type AnswerFormat = "single" | "multi" | "scale" | "text";

interface Question {
  questionNumber: number;
  question: string;
  format: AnswerFormat;
  options: string[];
  isLast?: boolean;
}

interface HistoryItem extends Question {
  answer: string | string[];
}

interface LifeContext {
  has_business: number;
  has_aging_parent: number;
  has_children_5_15: number;
  has_health_focus: number;
  has_meeting_overload: number;
  is_content_creator: number;
  is_research_heavy: number;
  has_task_chaos: number;
}

type AgentId =
  | "boris"
  | "eva"
  | "david"
  | "patrik"
  | "taras"
  | "ada"
  | "hanna"
  | "orban";

interface AgentRecommendation {
  agentId: AgentId;
  agentName: string;
  emoji: string;
  match: number;
  tier: "Basic" | "Pro" | "OneTime";
  monthlyCost: number;
  role: "primary" | "secondary" | "tertiary";
  whyNow: string;
  tasksCovered: string[];
  hoursSavedPerWeek: number;
  evidenceQuotes: string[];
}

interface AgentRecommendations {
  stack: AgentRecommendation[];
  startingMonthlyCost: number;
  totalMonthlyCost: number;
  totalHoursSavedPerWeek: number;
  fallback: { reason: string; nextStep: string } | null;
}

interface RoadmapPhase {
  phase: string;
  agent: string | null;
  action: string;
  successCriterion: string;
}

interface Profile {
  hollandCode: string;
  hollandDescription: string;
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  bigFiveNotes: Record<string, string>;
  lifeContext: LifeContext;
  strengths: { title: string; evidence: string }[];
  agentRecommendations: AgentRecommendations;
  agentStackRoadmap: RoadmapPhase[];
  developmentPlan: string[];
  summary: string;
}

type Stage = "intro" | "scanning" | "analyzing" | "result" | "error";

const TERM_GREEN = "#00ff41";
const TERM_AMBER = "#ffb000";
const TERM_DIM = "rgba(0,255,65,0.4)";
const TERM_BG = "#040208";
// Яркий читаемый зелёный для описаний (evidence / notes / bigFive notes)
const TERM_TEXT = "#a0ffb0";

// ---------- Typewriter ----------

function useTypewriter(text: string, speed = 18) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return out;
}

// ---------- Sub-components ----------

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, (current / total) * 100);
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: TERM_DIM,
          letterSpacing: "0.15em",
          marginBottom: 6,
        }}
      >
        <span>// SCAN PROGRESS</span>
        <span>
          {String(current).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "rgba(0,255,65,0.08)",
          border: `1px solid ${TERM_DIM}`,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${TERM_GREEN}, ${TERM_AMBER})`,
            boxShadow: `0 0 12px ${TERM_GREEN}`,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

function Cursor() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 14,
        background: TERM_GREEN,
        marginLeft: 4,
        verticalAlign: "middle",
        animation: "blink 1s step-end infinite",
      }}
    />
  );
}

// ---------- Question renderer ----------

function QuestionView({
  question,
  onAnswer,
  isThinking,
}: {
  question: Question;
  onAnswer: (answer: string | string[]) => void;
  isThinking: boolean;
}) {
  const [single, setSingle] = useState<string | null>(null);
  const [multi, setMulti] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    setSingle(null);
    setMulti([]);
    setText("");
    setScale(null);
  }, [question.questionNumber]);

  const typed = useTypewriter(question.question, 14);
  const fullyTyped = typed.length === question.question.length;

  const submit = () => {
    if (question.format === "single" && single) onAnswer(single);
    else if (question.format === "multi" && multi.length > 0) onAnswer(multi);
    else if (question.format === "scale" && scale !== null) onAnswer(String(scale));
    else if (question.format === "text" && text.trim().length > 0) onAnswer(text.trim());
  };

  const canSubmit =
    (question.format === "single" && single !== null) ||
    (question.format === "multi" && multi.length > 0) ||
    (question.format === "scale" && scale !== null) ||
    (question.format === "text" && text.trim().length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Question prompt */}
      <div>
        <div
          style={{
            fontSize: 11,
            color: TERM_AMBER,
            letterSpacing: "0.2em",
            marginBottom: 10,
          }}
        >
          // ВОПРОС {question.questionNumber}/{QUESTION_BUDGET}
        </div>
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.55,
            color: TERM_GREEN,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            minHeight: 48,
          }}
        >
          {typed}
          {!fullyTyped && <Cursor />}
        </div>
      </div>

      {/* Answer area — reveals after typing finishes */}
      <div
        style={{
          opacity: fullyTyped ? 1 : 0,
          transition: "opacity 0.3s",
          pointerEvents: fullyTyped ? "auto" : "none",
        }}
      >
        {question.format === "single" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSingle(opt)}
                className="opt-btn"
                data-active={single === opt}
              >
                <span style={{ opacity: 0.5, marginRight: 10 }}>
                  [{String.fromCharCode(65 + idx)}]
                </span>
                {opt}
              </button>
            ))}
          </div>
        )}

        {question.format === "multi" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 11, color: TERM_DIM, marginBottom: 4 }}>
              // ВЫБЕРИТЕ ВСЕ ПОДХОДЯЩИЕ
            </div>
            {question.options.map((opt, idx) => {
              const checked = multi.includes(opt);
              return (
                <button
                  key={idx}
                  onClick={() =>
                    setMulti((prev) =>
                      checked ? prev.filter((o) => o !== opt) : [...prev, opt]
                    )
                  }
                  className="opt-btn"
                  data-active={checked}
                >
                  <span style={{ opacity: 0.7, marginRight: 10 }}>
                    [{checked ? "x" : " "}]
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {question.format === "scale" && (
          <div>
            <div style={{ fontSize: 11, color: TERM_DIM, marginBottom: 12 }}>
              // ШКАЛА 1—5 (1 = совсем нет, 5 = полностью согласен)
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setScale(n)}
                  className="scale-btn"
                  data-active={scale === n}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {question.format === "text" && (
          <div>
            <div style={{ fontSize: 11, color: TERM_DIM, marginBottom: 8 }}>
              // СВОБОДНЫЙ ВВОД
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="> введите ответ..."
              className="term-textarea"
            />
          </div>
        )}

        {/* Submit */}
        <div style={{ marginTop: 20 }}>
          <button
            onClick={submit}
            disabled={!canSubmit || isThinking}
            className="term-submit"
          >
            {isThinking
              ? "// АНАЛИЗ ОТВЕТА..."
              : question.isLast
              ? "$ ЗАВЕРШИТЬ СКАН →"
              : "$ ПРОДОЛЖИТЬ →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Result view ----------

function BigFiveBar({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: TERM_GREEN,
          letterSpacing: "0.1em",
          marginBottom: 4,
        }}
      >
        <span>{label.toUpperCase()}</span>
        <span style={{ color: TERM_AMBER }}>{value}/100</span>
      </div>
      <div
        style={{
          height: 8,
          background: "rgba(0,255,65,0.08)",
          border: `1px solid ${TERM_DIM}`,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: `linear-gradient(90deg, ${TERM_GREEN}, ${TERM_AMBER})`,
            boxShadow: `0 0 8px ${TERM_GREEN}`,
          }}
        />
      </div>
      {note && (
        <div style={{ fontSize: 12, color: TERM_TEXT, marginTop: 6, lineHeight: 1.55 }}>
          {note}
        </div>
      )}
    </div>
  );
}

function TelegramDelivery({ profile }: { profile: Profile }) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [token, setToken] = useState<string>("");
  const [botUrl, setBotUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discover/stash", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profile }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setErrorMsg(data.error || "Не удалось подготовить код");
          setState("error");
          return;
        }
        setToken(data.token);
        setBotUrl(data.botUrl);
        setState("ready");
      } catch (e) {
        if (cancelled) return;
        setErrorMsg(e instanceof Error ? e.message : "Сетевая ошибка");
        setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  const copy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — юзер возьмёт глазами
    }
  };

  return (
    <section>
      <h2 className="section-h">// ОТПРАВИТЬ В TELEGRAM</h2>

      {state === "loading" && (
        <div style={{ fontSize: 12, color: TERM_DIM, letterSpacing: "0.1em" }}>
          // генерация кода синхронизации...
        </div>
      )}

      {state === "error" && (
        <div
          style={{
            fontSize: 12,
            color: "#ff8888",
            border: "1px solid rgba(255,68,68,0.3)",
            background: "rgba(255,68,68,0.05)",
            padding: "10px 12px",
            lineHeight: 1.5,
          }}
        >
          // {errorMsg.toUpperCase()}
          <br />
          // доставка в TG временно недоступна. Попробуй позже.
        </div>
      )}

      {state === "ready" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12, color: TERM_DIM, lineHeight: 1.6 }}>
            // жми кнопку — бот пришлёт результат сообщениями в Telegram.
            <br />
            // если бот попросит код — скопируй его ниже. Код одноразовый, хранится 24 часа.
          </div>

          <a
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="term-submit"
            style={{ textDecoration: "none", textAlign: "center", display: "block" }}
          >
            ✈ ЗАБРАТЬ РЕЗУЛЬТАТЫ У БОТА В ТЕЛЕГРАМ →
          </a>

          <div
            style={{
              border: `1px solid ${TERM_AMBER}`,
              background: "rgba(255,176,0,0.06)",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <code
              style={{
                fontSize: 18,
                letterSpacing: "0.15em",
                color: TERM_AMBER,
                fontFamily: "inherit",
                fontWeight: 700,
                wordBreak: "break-all",
              }}
            >
              {token}
            </code>
            <button onClick={copy} className="term-submit" style={{ width: "auto", padding: "8px 14px", fontSize: 12 }}>
              {copied ? "✓ СКОПИРОВАНО" : "📋 КОПИРОВАТЬ"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

const ROLE_LABEL: Record<AgentRecommendation["role"], string> = {
  primary: "PRIMARY",
  secondary: "SECONDARY",
  tertiary: "TERTIARY",
};

function AgentCard({ rec }: { rec: AgentRecommendation }) {
  const priceLabel =
    rec.tier === "OneTime"
      ? `$${rec.monthlyCost} one-time`
      : `$${rec.monthlyCost}/мес · ${rec.tier}`;
  return (
    <a
      href={`/products/${rec.agentId}`}
      className="agent-card"
      style={{
        display: "flex",
        gap: 16,
        border: `1px solid ${TERM_DIM}`,
        borderLeft: `3px solid ${TERM_AMBER}`,
        padding: "16px 18px",
        background: "rgba(0,255,65,0.03)",
        textDecoration: "none",
        color: "inherit",
        borderRadius: 4,
      }}
    >
      <div
        style={{
          fontSize: 40,
          lineHeight: 1,
          minWidth: 52,
          textAlign: "center",
          paddingTop: 2,
        }}
        aria-hidden
      >
        {rec.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 10,
            color: TERM_AMBER,
            letterSpacing: "0.22em",
            marginBottom: 4,
            fontWeight: 700,
          }}
        >
          [{ROLE_LABEL[rec.role]}]
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: TERM_GREEN,
              letterSpacing: "0.03em",
            }}
          >
            {rec.agentName}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: TERM_AMBER,
              whiteSpace: "nowrap",
            }}
          >
            {rec.match}%
          </div>
        </div>
        <div
          style={{
            fontSize: 13,
            color: TERM_TEXT,
            lineHeight: 1.55,
            marginBottom: 12,
          }}
        >
          {rec.whyNow}
        </div>
        {rec.tasksCovered.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                fontSize: 10,
                color: TERM_DIM,
                letterSpacing: "0.2em",
                marginBottom: 6,
              }}
            >
              // ЧТО ЗАБЕРЁТ У ТЕБЯ
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {rec.tasksCovered.map((t, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 13,
                    color: "#d0e0d0",
                    lineHeight: 1.5,
                    paddingLeft: 14,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      color: TERM_GREEN,
                    }}
                  >
                    –
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div
          style={{
            fontSize: 11,
            color: TERM_DIM,
            letterSpacing: "0.05em",
            borderTop: `1px dashed ${TERM_DIM}`,
            paddingTop: 8,
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: TERM_AMBER }}>{priceLabel}</span>
          <span>сэкономит ~{rec.hoursSavedPerWeek}ч/нед</span>
        </div>
      </div>
    </a>
  );
}

function AgentStackSection({ recs }: { recs: AgentRecommendations }) {
  if (recs.stack.length === 0 && recs.fallback) {
    return (
      <section>
        <h2 className="section-h">// ТВОЯ СВЯЗКА АГЕНТОВ</h2>
        <div
          style={{
            border: `1px solid ${TERM_AMBER}`,
            borderLeft: `3px solid ${TERM_AMBER}`,
            padding: "16px 18px",
            background: "rgba(255,176,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: TERM_AMBER,
              letterSpacing: "0.2em",
              fontWeight: 700,
            }}
          >
            // НЕДОСТАТОЧНО СИГНАЛА
          </div>
          <div style={{ fontSize: 13, color: "#f0e8d0", lineHeight: 1.6 }}>
            {recs.fallback.reason}
          </div>
          <div style={{ fontSize: 13, color: TERM_TEXT, lineHeight: 1.6 }}>
            {recs.fallback.nextStep}
          </div>
          <a
            href="/"
            className="term-submit"
            style={{
              textDecoration: "none",
              textAlign: "center",
              display: "block",
            }}
          >
            $ НАПИСАТЬ ADA НА ГЛАВНОЙ →
          </a>
        </div>
      </section>
    );
  }

  if (recs.stack.length === 0) return null;

  return (
    <section>
      <h2 className="section-h">// ТВОЯ СВЯЗКА АГЕНТОВ ({recs.stack.length})</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginBottom: 16,
          border: `1px solid ${TERM_DIM}`,
          padding: "12px 14px",
          background: "rgba(0,255,65,0.03)",
          borderRadius: 4,
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: TERM_DIM, letterSpacing: "0.15em" }}>
            // СТАРТ
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: TERM_AMBER }}>
            ${recs.startingMonthlyCost}/мес
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: TERM_DIM, letterSpacing: "0.15em" }}>
            // ВСЯ СВЯЗКА
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: TERM_GREEN }}>
            ${recs.totalMonthlyCost}/мес
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: TERM_DIM, letterSpacing: "0.15em" }}>
            // ОСВОБОДИТ
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: TERM_GREEN }}>
            ~{recs.totalHoursSavedPerWeek}ч/нед
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {recs.stack.map((rec) => (
          <AgentCard key={rec.agentId} rec={rec} />
        ))}
      </div>
      <div
        style={{
          fontSize: 11,
          color: TERM_DIM,
          marginTop: 10,
          lineHeight: 1.5,
        }}
      >
        // начинай с PRIMARY. Остальные — по плану внедрения ниже.
      </div>
    </section>
  );
}

function RoadmapSection({ phases }: { phases: RoadmapPhase[] }) {
  if (phases.length === 0) return null;
  return (
    <section>
      <h2 className="section-h">// ПЛАН ВНЕДРЕНИЯ — 3 МЕСЯЦА</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {phases.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 16,
              padding: "14px 0",
              borderBottom:
                i === phases.length - 1 ? "none" : `1px dashed ${TERM_DIM}`,
            }}
          >
            <div
              style={{
                minWidth: 96,
                fontSize: 11,
                color: TERM_AMBER,
                letterSpacing: "0.15em",
                fontWeight: 700,
                paddingTop: 2,
              }}
            >
              {p.phase.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              {p.agent && (
                <div
                  style={{
                    fontSize: 13,
                    color: TERM_GREEN,
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  → {p.agent}
                </div>
              )}
              <div
                style={{
                  fontSize: 13,
                  color: "#d0e0d0",
                  lineHeight: 1.55,
                  marginBottom: 6,
                }}
              >
                {p.action}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: TERM_TEXT,
                  lineHeight: 1.5,
                  fontStyle: "italic",
                }}
              >
                ✓ {p.successCriterion}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResultView({ profile, onRestart }: { profile: Profile; onRestart: () => void }) {
  const recs = profile.agentRecommendations;
  const hasStack = recs?.stack?.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      {/* Header */}
      <div>
        <div
          style={{
            fontSize: 11,
            color: TERM_AMBER,
            letterSpacing: "0.3em",
            marginBottom: 8,
          }}
        >
          // СКАНИРОВАНИЕ ЗАВЕРШЕНО
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: TERM_GREEN,
            letterSpacing: "0.1em",
            textShadow: `0 0 24px ${TERM_GREEN}`,
            marginBottom: 12,
          }}
        >
          {profile.hollandCode}
        </div>
        <div style={{ fontSize: 14, color: "#d0e0d0", lineHeight: 1.6 }}>
          {profile.hollandDescription}
        </div>
      </div>

      {/* HERO: твоя связка агентов */}
      {recs && <AgentStackSection recs={recs} />}

      {/* Roadmap */}
      {hasStack && profile.agentStackRoadmap?.length > 0 && (
        <RoadmapSection phases={profile.agentStackRoadmap} />
      )}

      {/* Big Five */}
      <section>
        <h2 className="section-h">// BIG FIVE — ПРОФИЛЬ ЛИЧНОСТИ</h2>
        <BigFiveBar label="Openness" value={profile.bigFive.openness} note={profile.bigFiveNotes?.openness} />
        <BigFiveBar label="Conscientiousness" value={profile.bigFive.conscientiousness} note={profile.bigFiveNotes?.conscientiousness} />
        <BigFiveBar label="Extraversion" value={profile.bigFive.extraversion} note={profile.bigFiveNotes?.extraversion} />
        <BigFiveBar label="Agreeableness" value={profile.bigFive.agreeableness} note={profile.bigFiveNotes?.agreeableness} />
        <BigFiveBar label="Neuroticism" value={profile.bigFive.neuroticism} note={profile.bigFiveNotes?.neuroticism} />
      </section>

      {/* Strengths */}
      <section>
        <h2 className="section-h">// КЛЮЧЕВЫЕ СИЛЬНЫЕ СТОРОНЫ</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {profile.strengths.map((s, i) => (
            <div
              key={i}
              style={{
                border: `1px solid ${TERM_DIM}`,
                borderLeft: `3px solid ${TERM_AMBER}`,
                padding: "14px 16px",
                background: "rgba(0,255,65,0.03)",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: TERM_AMBER,
                  marginBottom: 6,
                  letterSpacing: "0.05em",
                }}
              >
                {String(i + 1).padStart(2, "0")}. {s.title}
              </div>
              <div style={{ fontSize: 13, color: TERM_TEXT, lineHeight: 1.55 }}>
                {s.evidence}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plan */}
      <section>
        <h2 className="section-h">// ПЛАН РАЗВИТИЯ — 3-6 МЕСЯЦЕВ</h2>
        <ol
          style={{
            paddingLeft: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {profile.developmentPlan.map((step, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: 12,
                fontSize: 13,
                color: "#d0e0d0",
                lineHeight: 1.55,
              }}
            >
              <span style={{ color: TERM_AMBER, fontWeight: 700, minWidth: 28 }}>
                {String(i + 1).padStart(2, "0")}.
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Summary */}
      <section>
        <h2 className="section-h">// ИТОГ</h2>
        <div
          style={{
            border: `1px solid ${TERM_AMBER}`,
            padding: "16px 18px",
            background: "rgba(255,176,0,0.04)",
            fontSize: 14,
            color: "#f0e8d0",
            lineHeight: 1.65,
          }}
        >
          {profile.summary}
        </div>
      </section>

      {/* Telegram delivery */}
      <TelegramDelivery profile={profile} />

      {/* Actions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          paddingTop: 12,
        }}
      >
        <button onClick={onRestart} className="term-submit">
          $ ПРОЙТИ ЗАНОВО ↻
        </button>
      </div>

      {/* Privacy */}
      <div
        style={{
          fontSize: 11,
          color: TERM_DIM,
          textAlign: "center",
          paddingTop: 16,
          borderTop: `1px solid ${TERM_DIM}`,
          lineHeight: 1.6,
        }}
      >
        // Мы не сохраняем ваши ответы. Всё происходит в памяти браузера.
        <br />
        // После закрытия вкладки данные стираются.
      </div>
    </div>
  );
}

// ---------- Main page ----------

export default function DiscoverPage() {
  const [stage, setStage] = useState<Stage>("intro");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isThinking, setIsThinking] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const fetchNext = useCallback(
    async (currentHistory: HistoryItem[]) => {
      setIsThinking(true);
      try {
        const res = await fetch("/api/discover", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "next",
            history: currentHistory,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ошибка сервера");
        setCurrentQuestion(data.question);
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "Неизвестная ошибка");
        setStage("error");
      } finally {
        setIsThinking(false);
      }
    },
    []
  );

  const fetchAnalysis = useCallback(
    async (finalHistory: HistoryItem[]) => {
      setStage("analyzing");
      try {
        const res = await fetch("/api/discover", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "analyze",
            history: finalHistory,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ошибка анализа");
        setProfile(data.profile);
        setStage("result");
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "Неизвестная ошибка");
        setStage("error");
      }
    },
    []
  );

  const start = () => {
    setHistory([]);
    setCurrentQuestion(null);
    setProfile(null);
    setErrorMsg("");
    setStage("scanning");
    fetchNext([]);
  };

  const handleAnswer = (answer: string | string[]) => {
    if (!currentQuestion) return;
    const newItem: HistoryItem = { ...currentQuestion, answer };
    const newHistory = [...history, newItem];
    setHistory(newHistory);
    setCurrentQuestion(null);

    if (newHistory.length >= QUESTION_BUDGET) {
      fetchAnalysis(newHistory);
    } else {
      fetchNext(newHistory);
    }

    // scroll to top of card on mobile
    setTimeout(() => {
      stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(0, 64, 24, 0.35) 0%, rgba(4, 2, 8, 1) 65%)",
        color: TERM_GREEN,
        fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
        paddingTop: "var(--chat-top-h, 0px)",
        paddingBottom: "calc(var(--chat-bar-h, 72px) + 20px)",
      }}
    >
      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .opt-btn {
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          background: rgba(0, 255, 65, 0.03);
          border: 1px solid ${TERM_DIM};
          color: ${TERM_GREEN};
          font-family: inherit;
          font-size: 14px;
          line-height: 1.5;
          cursor: pointer;
          transition: all 0.15s;
          border-radius: 4px;
        }
        .opt-btn:hover {
          background: rgba(0, 255, 65, 0.08);
          border-color: ${TERM_GREEN};
          box-shadow: 0 0 12px rgba(0, 255, 65, 0.2);
        }
        .opt-btn[data-active="true"] {
          background: rgba(255, 176, 0, 0.1);
          border-color: ${TERM_AMBER};
          color: ${TERM_AMBER};
          box-shadow: 0 0 16px rgba(255, 176, 0, 0.25);
        }
        .scale-btn {
          flex: 1;
          min-width: 56px;
          padding: 14px 0;
          background: rgba(0, 255, 65, 0.03);
          border: 1px solid ${TERM_DIM};
          color: ${TERM_GREEN};
          font-family: inherit;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          border-radius: 4px;
        }
        .scale-btn:hover {
          background: rgba(0, 255, 65, 0.08);
          border-color: ${TERM_GREEN};
        }
        .scale-btn[data-active="true"] {
          background: ${TERM_AMBER};
          color: ${TERM_BG};
          border-color: ${TERM_AMBER};
          box-shadow: 0 0 20px rgba(255, 176, 0, 0.45);
        }
        .term-textarea {
          width: 100%;
          background: rgba(0, 255, 65, 0.03);
          border: 1px solid ${TERM_DIM};
          color: ${TERM_GREEN};
          font-family: inherit;
          font-size: 14px;
          padding: 12px 14px;
          border-radius: 4px;
          resize: vertical;
          min-height: 100px;
        }
        .term-textarea:focus {
          outline: none;
          border-color: ${TERM_AMBER};
          box-shadow: 0 0 0 2px rgba(255, 176, 0, 0.15);
        }
        .term-submit {
          width: 100%;
          padding: 14px 24px;
          background: transparent;
          border: 1px solid ${TERM_AMBER};
          color: ${TERM_AMBER};
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 4px;
        }
        .term-submit:hover:not(:disabled) {
          background: ${TERM_AMBER};
          color: ${TERM_BG};
          box-shadow: 0 0 24px rgba(255, 176, 0, 0.4);
        }
        .term-submit:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .section-h {
          font-size: 12px;
          color: ${TERM_AMBER};
          letter-spacing: 0.2em;
          margin-bottom: 14px;
          font-weight: 600;
        }
        .term-home-link:hover {
          color: ${TERM_AMBER} !important;
          text-shadow: 0 0 10px rgba(255, 176, 0, 0.5);
        }
        .agent-card {
          transition: all 0.15s;
        }
        .agent-card:hover {
          background: rgba(0, 255, 65, 0.06) !important;
          border-color: ${TERM_GREEN} !important;
          box-shadow: 0 0 18px rgba(255, 176, 0, 0.25);
        }
      `}</style>

      {/* CRT scanlines overlay — matches /factory */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0, 255, 65, 0.18) 0px, rgba(0, 255, 65, 0.18) 1px, transparent 1px, transparent 3px)",
          opacity: 0.18,
          mixBlendMode: "overlay",
          pointerEvents: "none",
          zIndex: 100,
        }}
      />

      {/* Top bar — mirrors /factory */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.22em",
          borderBottom: "1px solid rgba(0, 255, 65, 0.25)",
          color: "rgba(0, 255, 65, 0.78)",
          background: "rgba(4, 2, 8, 0.6)",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#00ff41",
              boxShadow: "0 0 10px rgba(0, 255, 65, 0.9)",
            }}
          />
          <span>AGENT: ADA · personality scan</span>
        </div>
        <a
          href="/"
          className="term-home-link"
          style={{
            color: "rgba(255, 176, 0, 0.9)",
            textDecoration: "none",
          }}
        >
          ← назад
        </a>
      </div>

      <div
        ref={stageRef}
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 16px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Panel — mirrors /factory card */}
        <div
          style={{
            background: "rgba(2, 10, 4, 0.82)",
            border: "1px solid rgba(0, 255, 65, 0.35)",
            borderRadius: 6,
            boxShadow:
              "0 0 32px rgba(0, 255, 65, 0.18), inset 0 0 60px rgba(0, 255, 65, 0.05)",
            padding: "20px 18px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 10,
              marginBottom: 22,
              borderBottom: "1px solid rgba(0, 255, 65, 0.25)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              color: "rgba(0, 255, 65, 0.7)",
            }}
          >
            <span>ada agent · live</span>
            <span style={{ color: "rgba(255, 176, 0, 0.7)" }}>
              demo · personality.scan
            </span>
          </div>

        {/* Stage routing */}
        {stage === "intro" && (
          <IntroView onStart={start} />
        )}

        {stage === "scanning" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <ProgressBar
              current={currentQuestion?.questionNumber ?? history.length + 1}
              total={QUESTION_BUDGET}
            />
            {currentQuestion ? (
              <QuestionView
                question={currentQuestion}
                onAnswer={handleAnswer}
                isThinking={isThinking}
              />
            ) : (
              <ThinkingView />
            )}
          </div>
        )}

        {stage === "analyzing" && <AnalyzingView />}

        {stage === "result" && profile && (
          <ResultView profile={profile} onRestart={() => setStage("intro")} />
        )}

        {stage === "error" && (
          <ErrorView message={errorMsg} onRetry={start} />
        )}
        </div>
      </div>
    </div>
  );
}

// ---------- Stage views ----------

function IntroView({ onStart }: { onStart: () => void }) {
  const lines = [
    "> boot: Ada agent · research unit",
    "> loading: holland_codes.dll [ok]",
    "> loading: big_five_ocean.dll [ok]",
    "> loading: finekot_agent_match.dll [ok]",
    "> ready.",
    "",
    "DISCOVER — ПОДБОР ТВОЕЙ СВЯЗКИ АГЕНТОВ",
    "",
    "Я — Ada, AI-агент Finekot Systems. Задам 20 адаптивных",
    "вопросов. Соберу личностный профиль по валидированным",
    "моделям (Holland Codes + Big Five) и на их основе подберу",
    "связку агентов Finekot, которая сделает тебя эффективнее.",
    "",
    "На выходе:",
    "  — твой Holland-код и Big Five профиль",
    "  — 1–3 рекомендованных агента с honest-матчем",
    "  — какие задачи агенты заберут у тебя (с цитатами из твоих ответов)",
    "  — 3-месячный план внедрения связки",
    "",
    "Длительность: ~10 минут.",
    "Данные не сохраняются. Всё в памяти браузера.",
  ];

  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= lines.length) return;
    const id = setTimeout(() => setShown((s) => s + 1), 80);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  return (
    <div>
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.7,
          color: TERM_GREEN,
          minHeight: 360,
          whiteSpace: "pre-wrap",
        }}
      >
        {lines.slice(0, shown).map((l, i) => (
          <div
            key={i}
            style={{
              color: l.startsWith(">") ? TERM_DIM : l.includes("DISCOVER") ? TERM_AMBER : TERM_GREEN,
              fontWeight: l.includes("DISCOVER") ? 700 : 400,
              fontSize: l.includes("DISCOVER") ? 22 : 13,
              letterSpacing: l.includes("DISCOVER") ? "0.1em" : "normal",
              padding: l.includes("DISCOVER") ? "8px 0" : 0,
            }}
          >
            {l || "\u00a0"}
          </div>
        ))}
        {shown < lines.length && <Cursor />}
      </div>

      {shown >= lines.length && (
        <div style={{ marginTop: 32 }}>
          <button onClick={onStart} className="term-submit">
            $ НАЧАТЬ СКАНИРОВАНИЕ →
          </button>
        </div>
      )}
    </div>
  );
}

function ThinkingView() {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 400);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      style={{
        fontSize: 13,
        color: TERM_AMBER,
        letterSpacing: "0.1em",
        padding: "20px 0",
      }}
    >
      // ГЕНЕРАЦИЯ СЛЕДУЮЩЕГО ВОПРОСА{dots}
    </div>
  );
}

function AnalyzingView() {
  const lines = [
    "> закрытие потока вопросов...",
    "> обработка истории диалога...",
    "> сопоставление с RIASEC...",
    "> сопоставление с OCEAN...",
    "> расчёт life-context сигналов...",
    "> матчинг агентов Finekot по rubric...",
    "> проверка честности: ≥65, budget, overlap...",
    "> построение roadmap внедрения...",
    "> финализация профиля...",
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= lines.length) return;
    const id = setTimeout(() => setShown((s) => s + 1), 600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);
  return (
    <div style={{ minHeight: 400, paddingTop: 40 }}>
      <div
        style={{
          fontSize: 12,
          color: TERM_AMBER,
          letterSpacing: "0.2em",
          marginBottom: 24,
        }}
      >
        // АНАЛИЗ В ПРОЦЕССЕ
      </div>
      <div style={{ fontSize: 13, color: TERM_GREEN, lineHeight: 1.9 }}>
        {lines.slice(0, shown).map((l, i) => (
          <div key={i}>{l}</div>
        ))}
        <span>
          {shown < lines.length ? "" : "> "}
          <Cursor />
        </span>
      </div>
    </div>
  );
}

function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ paddingTop: 40 }}>
      <div
        style={{
          fontSize: 14,
          color: "#ff4444",
          letterSpacing: "0.2em",
          marginBottom: 16,
        }}
      >
        // ОШИБКА СКАНЕРА
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#ff8888",
          lineHeight: 1.6,
          padding: 16,
          border: "1px solid rgba(255,68,68,0.3)",
          background: "rgba(255,68,68,0.05)",
          marginBottom: 24,
        }}
      >
        {message}
      </div>
      <button onClick={onRetry} className="term-submit">
        $ ПЕРЕЗАПУСК →
      </button>
    </div>
  );
}
