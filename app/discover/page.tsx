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
  strengths: { title: string; evidence: string }[];
  professions: { title: string; match: number; note: string }[];
  developmentPlan: string[];
  summary: string;
}

type Stage = "gate" | "intro" | "scanning" | "analyzing" | "result" | "error";

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
            fontSize: 18,
            lineHeight: 1.55,
            color: TERM_GREEN,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            minHeight: 60,
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

function profileToMarkdown(p: Profile): string {
  const bf = p.bigFive;
  const bfn = p.bigFiveNotes || {};
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10);

  const lines: string[] = [];
  lines.push(`# DISCOVER — Сканирование личности`);
  lines.push(``);
  lines.push(`_Сгенерировано SKYNET · ${stamp}_`);
  lines.push(``);
  lines.push(`## Профиль`);
  lines.push(``);
  lines.push(`**Holland-код:** \`${p.hollandCode}\``);
  lines.push(``);
  lines.push(p.hollandDescription);
  lines.push(``);
  lines.push(`## Big Five (OCEAN)`);
  lines.push(``);
  lines.push(`| Шкала | Значение | Комментарий |`);
  lines.push(`|---|---|---|`);
  lines.push(`| Openness | ${bf.openness}/100 | ${bfn.openness || "—"} |`);
  lines.push(`| Conscientiousness | ${bf.conscientiousness}/100 | ${bfn.conscientiousness || "—"} |`);
  lines.push(`| Extraversion | ${bf.extraversion}/100 | ${bfn.extraversion || "—"} |`);
  lines.push(`| Agreeableness | ${bf.agreeableness}/100 | ${bfn.agreeableness || "—"} |`);
  lines.push(`| Neuroticism | ${bf.neuroticism}/100 | ${bfn.neuroticism || "—"} |`);
  lines.push(``);
  lines.push(`## Ключевые сильные стороны`);
  lines.push(``);
  p.strengths.forEach((s, i) => {
    lines.push(`### ${String(i + 1).padStart(2, "0")}. ${s.title}`);
    lines.push(``);
    lines.push(s.evidence);
    lines.push(``);
  });
  lines.push(`## Рекомендованные направления`);
  lines.push(``);
  p.professions.forEach((pr) => {
    lines.push(`- **${pr.match}% — ${pr.title}** — ${pr.note}`);
  });
  lines.push(``);
  lines.push(`## План развития (3–6 месяцев)`);
  lines.push(``);
  p.developmentPlan.forEach((step, i) => {
    lines.push(`${i + 1}. ${step}`);
  });
  lines.push(``);
  lines.push(`## Итог`);
  lines.push(``);
  lines.push(p.summary);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`_Методики: Holland Codes (RIASEC) + Big Five (OCEAN). Сгенерировано на finekot.ai/discover._`);
  lines.push(``);
  return lines.join("\n");
}

function downloadProfileMarkdown(profile: Profile) {
  const md = profileToMarkdown(profile);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `finekot-discover-${profile.hollandCode || "profile"}-${stamp}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ResultView({ profile, onRestart }: { profile: Profile; onRestart: () => void }) {
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

      {/* Professions */}
      <section>
        <h2 className="section-h">
          // РЕКОМЕНДОВАННЫЕ НАПРАВЛЕНИЯ ({profile.professions.length})
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {profile.professions.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: "10px 12px",
                border: `1px solid ${TERM_DIM}`,
                background: "rgba(0,255,65,0.02)",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: TERM_AMBER,
                  fontWeight: 700,
                  minWidth: 48,
                  paddingTop: 2,
                }}
              >
                {p.match}%
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: TERM_GREEN, fontWeight: 600 }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 12, color: TERM_TEXT, marginTop: 2, lineHeight: 1.5 }}>
                  {p.note}
                </div>
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

      {/* Actions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          paddingTop: 12,
        }}
      >
        <button
          onClick={() => downloadProfileMarkdown(profile)}
          className="term-submit"
        >
          $ СКАЧАТЬ ОТЧЁТ (.md) ↓
        </button>
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
  const [stage, setStage] = useState<Stage>("gate");
  const [password, setPassword] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isThinking, setIsThinking] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // Restore password from sessionStorage so user doesn't re-enter on refresh.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem("discover_pwd");
    if (saved) {
      setPassword(saved);
      setStage("intro");
    }
  }, []);

  const fetchNext = useCallback(
    async (currentHistory: HistoryItem[], pwd: string) => {
      setIsThinking(true);
      try {
        const res = await fetch("/api/discover", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "next",
            history: currentHistory,
            password: pwd,
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
    async (finalHistory: HistoryItem[], pwd: string) => {
      setStage("analyzing");
      try {
        const res = await fetch("/api/discover", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "analyze",
            history: finalHistory,
            password: pwd,
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

  const verifyPassword = useCallback(async (pwd: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "auth", history: [], password: pwd }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const start = () => {
    setHistory([]);
    setCurrentQuestion(null);
    setProfile(null);
    setErrorMsg("");
    setStage("scanning");
    fetchNext([], password);
  };

  const handleAnswer = (answer: string | string[]) => {
    if (!currentQuestion) return;
    const newItem: HistoryItem = { ...currentQuestion, answer };
    const newHistory = [...history, newItem];
    setHistory(newHistory);
    setCurrentQuestion(null);

    if (newHistory.length >= QUESTION_BUDGET) {
      fetchAnalysis(newHistory, password);
    } else {
      fetchNext(newHistory, password);
    }

    // scroll to top of card on mobile
    setTimeout(() => {
      stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleGateSubmit = async (pwd: string) => {
    const ok = await verifyPassword(pwd);
    if (!ok) {
      throw new Error("Неверный пароль");
    }
    setPassword(pwd);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("discover_pwd", pwd);
    }
    setStage("intro");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: TERM_BG,
        color: TERM_GREEN,
        fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
        padding: "24px 16px 60px",
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
      `}</style>

      {/* CRT scanlines overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
          pointerEvents: "none",
          zIndex: 100,
        }}
      />

      <div
        ref={stageRef}
        style={{
          maxWidth: 720,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 12,
            borderBottom: `1px solid ${TERM_DIM}`,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: TERM_GREEN,
              letterSpacing: "0.2em",
            }}
          >
            SKYNET://discover
          </div>
          <div style={{ fontSize: 11, color: TERM_DIM, letterSpacing: "0.15em" }}>
            v1.0 · personality.scan
          </div>
        </div>

        {/* Stage routing */}
        {stage === "gate" && <GateView onSubmit={handleGateSubmit} />}

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
  );
}

// ---------- Stage views ----------

function GateView({
  onSubmit,
}: {
  onSubmit: (pwd: string) => Promise<void>;
}) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!pwd.trim() || busy) return;
    setBusy(true);
    setErr("");
    try {
      await onSubmit(pwd.trim());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка авторизации");
      setPwd("");
    } finally {
      setBusy(false);
    }
  };

  const lines = [
    "> initializing access control...",
    "> scan module: LOCKED",
    "> требуется пароль доступа",
    "",
  ];

  return (
    <div style={{ paddingTop: 20 }}>
      <div style={{ fontSize: 13, color: TERM_DIM, lineHeight: 1.8, marginBottom: 20 }}>
        {lines.map((l, i) => (
          <div key={i}>{l || "\u00a0"}</div>
        ))}
      </div>

      <div
        style={{
          fontSize: 14,
          color: TERM_AMBER,
          letterSpacing: "0.15em",
          marginBottom: 14,
        }}
      >
        // ПАРОЛЬ ДОСТУПА
      </div>

      <input
        type="password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="> введите пароль..."
        autoFocus
        disabled={busy}
        style={{
          width: "100%",
          background: "rgba(0,255,65,0.03)",
          border: `1px solid ${TERM_DIM}`,
          color: TERM_GREEN,
          fontFamily: "inherit",
          fontSize: 16,
          padding: "14px 16px",
          borderRadius: 4,
          outline: "none",
          letterSpacing: "0.08em",
        }}
      />

      {err && (
        <div
          style={{
            fontSize: 12,
            color: "#ff6666",
            marginTop: 10,
            letterSpacing: "0.05em",
          }}
        >
          // {err.toUpperCase()}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button
          onClick={submit}
          disabled={!pwd.trim() || busy}
          className="term-submit"
        >
          {busy ? "// ПРОВЕРКА..." : "$ ВОЙТИ →"}
        </button>
      </div>

      <div
        style={{
          fontSize: 11,
          color: TERM_DIM,
          marginTop: 24,
          lineHeight: 1.6,
        }}
      >
        // Доступ ограничен чтобы случайные гости не жгли токены.
        <br />
        // Пароль выдаёт Командир.
      </div>
    </div>
  );
}

function IntroView({ onStart }: { onStart: () => void }) {
  const lines = [
    "> initializing personality scan module...",
    "> loading: holland_codes.dll [ok]",
    "> loading: big_five_ocean.dll [ok]",
    "> ready.",
    "",
    "DISCOVER — СКАНИРОВАНИЕ ЛИЧНОСТИ",
    "",
    "Я — SKYNET. Сейчас я задам тебе 20 адаптивных вопросов",
    "и определю твой профиль по двум валидированным моделям:",
    "Holland Codes (RIASEC) и Big Five (OCEAN).",
    "",
    "На выходе ты получишь:",
    "  — твой Holland-код и Big Five профиль",
    "  — 3 ключевые сильные стороны",
    "  — 8-12 рекомендованных профессий и ниш",
    "  — план развития на 3-6 месяцев",
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
    "> синтез сильных сторон...",
    "> подбор профессиональных ниш...",
    "> построение плана развития...",
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
