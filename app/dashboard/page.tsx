"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════
   DEMO DATA
   ═══════════════════════════════════════════════════════ */

const kpis = [
  { label: "MRR", value: "$14,820", delta: "+23%", sub: "vs last month", color: "from-pink-500/20 to-fuchsia-500/10", accent: "text-pink-400", border: "border-pink-500/20" },
  { label: "AI Systems Sold", value: "47", delta: "+8", sub: "this month", color: "from-violet-500/20 to-purple-500/10", accent: "text-violet-400", border: "border-violet-500/20" },
  { label: "Active Deployments", value: "134", delta: "+12", sub: "across clients", color: "from-fuchsia-500/20 to-pink-500/10", accent: "text-fuchsia-400", border: "border-fuchsia-500/20" },
  { label: "Conversion Rate", value: "8.4%", delta: "+1.2pp", sub: "visitor → buyer", color: "from-rose-500/20 to-pink-500/10", accent: "text-rose-400", border: "border-rose-500/20" },
];

const products = [
  { name: "SKYNET Intake", sales: 18, revenue: "$8,982", pct: 88 },
  { name: "Reels Agent", sales: 11, revenue: "$3,289", pct: 54 },
  { name: "Call Agent", sales: 9, revenue: "$4,491", pct: 44 },
  { name: "Shop Bot", sales: 6, revenue: "$1,794", pct: 29 },
  { name: "ALPHACH", sales: 3, revenue: "$897", pct: 15 },
];

const geoData = [
  { country: "United States", pct: 34, flag: "🇺🇸" },
  { country: "Germany", pct: 18, flag: "🇩🇪" },
  { country: "United Kingdom", pct: 14, flag: "🇬🇧" },
  { country: "Canada", pct: 11, flag: "🇨🇦" },
  { country: "Netherlands", pct: 9, flag: "🇳🇱" },
  { country: "Other", pct: 14, flag: "🌍" },
];

const recentSales = [
  { id: "TXN-8821", product: "SKYNET Intake · Integration", amount: "$2,500", time: "2m ago", status: "paid" },
  { id: "TXN-8820", product: "Call Agent · Template", amount: "$499", time: "47m ago", status: "paid" },
  { id: "TXN-8819", product: "Reels Agent · Integration", amount: "$2,500", time: "2h ago", status: "paid" },
  { id: "TXN-8818", product: "Shop Bot · Template", amount: "$299", time: "5h ago", status: "paid" },
  { id: "TXN-8817", product: "ALPHACH · Template", amount: "$299", time: "8h ago", status: "paid" },
];

const sparkData = [40, 55, 48, 70, 65, 82, 75, 90, 88, 95, 91, 100];

/* ═══════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════ */

function Counter({ value }: { value: string }) {
  const [displayed, setDisplayed] = useState("0");

  useEffect(() => {
    const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(numeric)) { setDisplayed(value); return; }
    const prefix = value.match(/^[^0-9]*/)?.[0] ?? "";
    const suffix = value.match(/[^0-9.]+$/)?.[0] ?? "";
    let start = 0;
    const duration = 1200;
    const steps = 40;
    const increment = numeric / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      start = Math.min(start + increment, numeric);
      const formatted = Number.isInteger(numeric)
        ? Math.round(start).toLocaleString()
        : start.toFixed(1).replace(".", ".");
      setDisplayed(`${prefix}${formatted}${suffix}`);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayed}</span>;
}

/* ═══════════════════════════════════════════════════════
   SPARKLINE
   ═══════════════════════════════════════════════════════ */

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const h = 40;
  const w = 120;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={pts} fill="none" stroke="#f43fa0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay },
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>

      {/* NAV */}
      <nav className="border-b border-pink-500/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xs font-mono text-pink-400/60 hover:text-pink-400 transition-colors">
          ← finekot.ai
        </Link>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono text-pink-100/30 uppercase tracking-widest">Analytics · DEMO</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* HEADER */}
        <motion.div {...fadeUp(0)}>
          <p className="text-[10px] font-mono text-pink-400/40 uppercase tracking-widest mb-1">finekot.ai · dashboard</p>
          <h1 className="text-2xl sm:text-3xl font-black gradient-text">Analytics Overview</h1>
          <p className="text-xs text-pink-100/30 mt-1 font-mono">Last 30 days · Demo data</p>
        </motion.div>

        {/* KPI GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              {...fadeUp(0.05 * i)}
              className={`glass rounded-xl p-4 sm:p-5 border ${kpi.border} bg-gradient-to-br ${kpi.color}`}
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-pink-100/30 mb-2">{kpi.label}</p>
              <p className={`text-2xl sm:text-3xl font-black font-mono ${kpi.accent}`}>
                <Counter value={kpi.value} />
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-mono text-green-400">{kpi.delta}</span>
                <span className="text-[10px] text-pink-100/20">{kpi.sub}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* REVENUE CHART + GEO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Revenue trend */}
          <motion.div {...fadeUp(0.15)} className="lg:col-span-2 glass rounded-xl border border-pink-500/10">
            <div className="terminal-card-header">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
              <span className="ml-2 text-pink-100/30">revenue_trend.chart</span>
            </div>
            <div className="p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-pink-100/30 mb-4">Monthly Revenue (USD)</p>
              {/* Bar chart */}
              <div className="flex items-end gap-2 h-32">
                {[18, 24, 21, 30, 28, 38, 34, 45, 42, 52, 49, 60].map((v, i) => {
                  const months = ["Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb"];
                  const isLast = i === 11;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        className={`w-full rounded-sm ${isLast ? "bg-pink-400" : "bg-pink-500/20"}`}
                        style={{ height: `${(v / 60) * 100}%` }}
                        initial={{ scaleY: 0, originY: 1 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: 0.05 * i }}
                      />
                      <span className="text-[8px] font-mono text-pink-100/20 hidden sm:block">{months[i]}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs font-mono text-pink-100/30">Peak: Feb · $14.8k</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-pink-100/20">Trend</span>
                  <Sparkline data={sparkData} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Geo */}
          <motion.div {...fadeUp(0.2)} className="glass rounded-xl border border-pink-500/10">
            <div className="terminal-card-header">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
              <span className="ml-2 text-pink-100/30">geo_split.json</span>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-pink-100/30 mb-1">Buyers by Country</p>
              {geoData.map((g, i) => (
                <div key={g.country}>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-pink-100/50">{g.flag} {g.country}</span>
                    <span className="text-pink-400/70">{g.pct}%</span>
                  </div>
                  <div className="h-1 bg-pink-500/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${g.pct}%` }}
                      transition={{ duration: 0.6, delay: 0.08 * i }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* PRODUCTS + RECENT SALES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Products */}
          <motion.div {...fadeUp(0.25)} className="glass rounded-xl border border-pink-500/10">
            <div className="terminal-card-header">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
              <span className="ml-2 text-pink-100/30">top_products.list</span>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-pink-100/30">Top Products · 30d</p>
              {products.map((p, i) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-pink-100/60">{p.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-pink-100/30">{p.sales} sales</span>
                      <span className="text-pink-400/80">{p.revenue}</span>
                    </div>
                  </div>
                  <div className="h-1 bg-pink-500/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct}%` }}
                      transition={{ duration: 0.6, delay: 0.08 * i }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Sales */}
          <motion.div {...fadeUp(0.3)} className="glass rounded-xl border border-pink-500/10">
            <div className="terminal-card-header">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
              <span className="ml-2 text-pink-100/30">recent_sales.log</span>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-pink-100/30">Recent Transactions</p>
              {recentSales.map((tx) => (
                <div key={tx.id} className="flex items-start justify-between gap-2 py-2 border-b border-pink-500/5 last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-pink-100/60 truncate">{tx.product}</p>
                    <p className="text-[10px] font-mono text-pink-100/25 mt-0.5">{tx.id} · {tx.time}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono text-green-400">{tx.amount}</p>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-green-500/10 text-green-400/70 border border-green-500/15">
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* FOOTER NOTE */}
        <motion.div {...fadeUp(0.35)} className="text-center py-4">
          <p className="text-[10px] font-mono text-pink-100/15 uppercase tracking-widest">
            Demo data · finekot.ai · Forge unit
          </p>
        </motion.div>

      </div>
    </div>
  );
}
