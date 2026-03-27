"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const TERMINATORS = [
  { id: "Media",        label: "MEDIA",        emoji: "🩷", color: "#ec4899", bg: "rgba(236,72,153,0.08)", border: "rgba(236,72,153,0.25)", role: "Контент & Посты" },
  { id: "Forge",        label: "FORGE",        emoji: "🟠", color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.25)",  role: "Инфраструктура" },
  { id: "Inspiration",  label: "INSPIRATION",  emoji: "🟢", color: "#22c55e", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.25)",   role: "Монетизация" },
  { id: "Money Maker",  label: "MONEY MAKER",  emoji: "🟡", color: "#eab308", bg: "rgba(234,179,8,0.08)",  border: "rgba(234,179,8,0.25)",   role: "Creator Economy" },
  { id: "iBoря",        label: "iБОРЯ",        emoji: "🔵", color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)",  role: "AI Секретарь" },
];

const PRIORITY_LABELS: Record<number, string> = { 1: "P1", 2: "P2", 3: "P3", 4: "P4", 0: "–" };
const PRIORITY_COLORS: Record<number, string> = { 1: "#ff4444", 2: "#f97316", 3: "#eab308", 4: "#6b7280", 0: "#4b5563" };

interface Issue {
  id: string;
  identifier: string;
  title: string;
  priority: number;
  state: { name: string };
  labels: { nodes: { name: string; color: string }[] };
  updatedAt: string;
}

function Clock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      const opts = { timeZone: "Europe/Berlin" };
      setTime(now.toLocaleTimeString("en-GB", { ...opts, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("en-GB", { ...opts, weekday: "short", day: "2-digit", month: "short", year: "numeric" }));
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#00ff41", fontVariantNumeric: "tabular-nums", letterSpacing: "0.05em", textShadow: "0 0 12px rgba(0,255,65,0.4)" }}>
        {time}
      </div>
      <div style={{ fontSize: 9, color: "rgba(0,255,65,0.4)", letterSpacing: "0.15em", marginTop: 2 }}>
        {date} · CET
      </div>
    </div>
  );
}

function TerminatorCard({ t, issues }: { t: typeof TERMINATORS[0]; issues: Issue[] }) {
  const myIssues = issues.filter(i => i.labels.nodes.some(l => l.name === t.id));
  const inProgress = myIssues.filter(i => i.state.name.includes("работе") || i.state.name.toLowerCase().includes("progress")).length;
  const pending = myIssues.filter(i => i.state.name.includes("выполнению") || i.state.name.toLowerCase().includes("backlog") || i.state.name.toLowerCase().includes("todo")).length;
  const review = myIssues.filter(i => i.state.name.includes("проверку") || i.state.name.toLowerCase().includes("review")).length;

  const statusColor = inProgress > 0 ? "#00ff41" : myIssues.length > 0 ? t.color : "#374151";
  const statusText = inProgress > 0 ? "ACTIVE" : myIssues.length > 0 ? "STANDBY" : "IDLE";

  return (
    <div style={{
      background: t.bg, border: `1px solid ${t.border}`,
      borderRadius: 6, padding: "16px", minHeight: 200,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>{t.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.color, letterSpacing: "0.12em" }}>{t.label}</span>
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{t.role}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
            <span style={{ fontSize: 9, color: statusColor, letterSpacing: "0.1em" }}>{statusText}</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: t.color, marginTop: 4 }}>{myIssues.length}</div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>TASKS</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[
          { label: "ACTIVE", val: inProgress, color: "#00ff41" },
          { label: "QUEUE", val: pending, color: t.color },
          { label: "REVIEW", val: review, color: "#f97316" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: 3, padding: "6px 4px", textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Task list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {myIssues.slice(0, 4).map(issue => (
          <div key={issue.id} style={{
            display: "flex", alignItems: "flex-start", gap: 6,
            padding: "5px 7px", background: "rgba(0,0,0,0.25)",
            borderRadius: 3, borderLeft: `2px solid ${PRIORITY_COLORS[issue.priority]}`,
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: PRIORITY_COLORS[issue.priority], minWidth: 16, marginTop: 1 }}>
              {PRIORITY_LABELS[issue.priority]}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", lineHeight: 1.4, flex: 1 }}>
              {issue.title.length > 48 ? issue.title.slice(0, 48) + "…" : issue.title}
            </span>
          </div>
        ))}
        {myIssues.length > 4 && (
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "2px 0" }}>
            +{myIssues.length - 4} more
          </div>
        )}
        {myIssues.length === 0 && (
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", textAlign: "center", padding: "16px 0", letterSpacing: "0.1em" }}>
            NO ACTIVE TASKS
          </div>
        )}
      </div>
    </div>
  );
}

function FeedItem({ issue }: { issue: Issue }) {
  const termLabel = issue.labels.nodes[0];
  const t = TERMINATORS.find(t => t.id === termLabel?.name);
  const color = t?.color ?? "#6b7280";

  return (
    <div style={{
      padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)",
      display: "flex", alignItems: "flex-start", gap: 8,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: PRIORITY_COLORS[issue.priority], minWidth: 18, marginTop: 2 }}>
        {PRIORITY_LABELS[issue.priority]}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.4, marginBottom: 2 }}>
          {issue.title.length > 60 ? issue.title.slice(0, 60) + "…" : issue.title}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>{issue.identifier}</span>
          {termLabel && (
            <span style={{ fontSize: 8, color, background: `${color}18`, padding: "1px 5px", borderRadius: 2 }}>
              {termLabel.name}
            </span>
          )}
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)" }}>{issue.state.name.replace("✅ ", "").replace("📋 ", "").replace("🔄 ", "")}</span>
        </div>
      </div>
    </div>
  );
}

export default function SkynetDashboard() {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/skynet/tasks");
      const data = await res.json();
      if (data?.data?.issues?.nodes) {
        setIssues(data.data.issues.nodes);
        setLastUpdate(new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchTasks();
    const t = setInterval(fetchTasks, 30000);
    return () => clearInterval(t);
  }, [fetchTasks]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/skynet/login");
  }

  const allActive = issues.filter(i => i.state.name.includes("работе") || i.state.name.toLowerCase().includes("progress")).length;
  const allPending = issues.filter(i => i.state.name.includes("выполнению") || i.state.name.toLowerCase().includes("backlog") || i.state.name.toLowerCase().includes("todo")).length;
  const allReview = issues.filter(i => i.state.name.includes("проверку") || i.state.name.toLowerCase().includes("review")).length;

  return (
    <div style={{
      minHeight: "100vh", background: "#020408",
      backgroundImage: "linear-gradient(rgba(0,255,65,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.025) 1px, transparent 1px)",
      backgroundSize: "40px 40px",
      fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
      color: "rgba(255,255,255,0.85)",
    }}>
      {/* Scanlines */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
      }} />

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 16px 40px", position: "relative", zIndex: 1 }}>

        {/* TOP BAR */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 20, gap: 16, flexWrap: "wrap",
          padding: "12px 16px", background: "rgba(0,255,65,0.02)",
          border: "1px solid rgba(0,255,65,0.1)", borderRadius: 4,
        }}>
          {/* Left: title */}
          <div>
            <div style={{ fontSize: 8, letterSpacing: "0.3em", color: "rgba(0,255,65,0.35)", marginBottom: 2, textTransform: "uppercase" }}>
              FINEKOT SYSTEMS · CLASSIFIED
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#00ff41", letterSpacing: "0.1em", textShadow: "0 0 20px rgba(0,255,65,0.4)" }}>
                SKYNET v3.0
              </span>
              <span style={{ fontSize: 9, color: "rgba(0,255,65,0.4)", letterSpacing: "0.2em" }}>COMMAND CENTER</span>
            </div>
          </div>

          {/* Right: clock + buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Clock />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={fetchTasks} style={{
                fontSize: 9, letterSpacing: "0.15em", color: "#ffffff",
                background: "transparent", border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: 3, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; }}
                onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = "transparent"; }}
              >
                REFRESH
              </button>
              <button onClick={logout} style={{
                fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,68,68,0.6)",
                background: "transparent", border: "1px solid rgba(255,68,68,0.2)",
                borderRadius: 3, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = "#ff4444"; (e.target as HTMLButtonElement).style.borderColor = "rgba(255,68,68,0.5)"; }}
                onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = "rgba(255,68,68,0.6)"; (e.target as HTMLButtonElement).style.borderColor = "rgba(255,68,68,0.2)"; }}
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, alignItems: "start" }}>

          {/* TERMINATORS */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", marginBottom: 10 }}>
              ▸ АКТИВНЫЕ ЮНИТЫ ({TERMINATORS.length})
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 10,
            }}>
              {TERMINATORS.map(t => (
                <TerminatorCard key={t.id} t={t} issues={issues} />
              ))}
            </div>
          </div>


        </div>

      </div>

      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,65,0.2); border-radius: 2px; }
      `}</style>
    </div>
  );
}
