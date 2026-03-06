"use client";

import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import { i18n, langs, type Lang } from "../lib/i18n";
import { projectI18n } from "../lib/project-i18n";

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */

type Category = "All" | "Multi-Agent" | "Voice AI" | "Automation" | "Bots" | "RAG";

const projects = [
  { id: "01", title: "SKYNET", subtitle: "Multi-Agent System", category: "Multi-Agent" as Category, status: "live", price: "$1200", priceNote: "Enterprise multi-agent AI", description: "Distributed army of 4 autonomous Claude Code agents. Telegram-controlled. Three modes: Autopilot / Supervised / Manual. Each agent has memory, tools, and role isolation.", stack: ["Claude Code", "Telegram API", "Docker", "Python", "TypeScript"], highlights: ["4 AI agents with unique specializations", "Automatic task decomposition & delegation", "Three modes: Autopilot, Supervised, Manual", "Real-time Dashboard in Telegram"], metrics: "4 agents · 3 modes · 24/7", color: "from-pink-500/30 to-purple-500/20", accent: "border-pink-500/40", glow: "rgba(244, 114, 182, 0.3)" },
  { id: "02", title: "AI Call Agent", subtitle: "Voice AI for Business", category: "Voice AI" as Category, status: "live", price: "$149", priceNote: "Voice AI agent", description: "Voice robot for business. Full AI-driven phone dialogues — booking, rescheduling, reminders. Handles objections, understands context across turns.", stack: ["Whisper", "Claude API", "TTS", "VoIP", "Python"], highlights: ["Natural voice dialogues", "CRM integration", "Automated reminders & confirmations", "Multi-scenario: booking, reschedule, confirm"], metrics: "< 400ms · 92% completion", color: "from-rose-500/25 to-orange-500/15", accent: "border-rose-500/40", glow: "rgba(251, 113, 133, 0.3)" },
  { id: "03", title: "SKYNET Intake", subtitle: "AI Task Assistant", category: "Bots" as Category, status: "live", price: "$499", priceNote: "AI task routing", description: "Telegram bot converting raw ideas (text/voice) into structured Todoist tasks. AI prioritization and agent routing.", stack: ["aiogram", "Claude Sonnet", "Whisper", "Todoist API"], highlights: ["Voice input via Whisper STT", "AI task structuring & routing", "Auto-prioritization", "Todoist integration"], metrics: "Voice + text · auto-route", color: "from-fuchsia-500/25 to-pink-500/15", accent: "border-fuchsia-500/40", glow: "rgba(232, 121, 249, 0.3)" },
  { id: "04", title: "Svetlana AI-admin", subtitle: "AI Business Manager", category: "Automation" as Category, status: "live", price: "$500", priceNote: "$2500 with setup", description: "Autonomous AI manager for beauty salon. Handles hiring, clients, supply chain, communications, reports — fully on autopilot.", stack: ["Claude API", "Telegram", "Telethon", "PostgreSQL"], highlights: ["Auto-hiring & staff management", "Client acquisition on autopilot", "Supply chain management", "Daily business reports"], metrics: "Full autopilot · 24/7", color: "from-pink-400/25 to-amber-500/10", accent: "border-pink-400/40", glow: "rgba(244, 114, 182, 0.25)" },
  { id: "18", title: "C-Admin", subtitle: "Universal Client Manager", category: "Bots" as Category, status: "live", price: "$250", priceNote: "$500 with setup", description: "AI admin for any service professional. Handles bookings, client management, auto-marketing — all from Telegram. Lite version of Svetlana AI-admin.", stack: ["Claude API", "Telegram Bot API", "PostgreSQL", "N8N", "Redis"], highlights: ["Smart booking & scheduling", "Client CRM with history", "Auto-marketing & promotions", "Multi-channel communication"], metrics: "Lite · any profession", color: "from-indigo-400/25 to-blue-500/15", accent: "border-indigo-400/40", glow: "rgba(129, 140, 248, 0.25)" },
  { id: "05", title: "DocMind", subtitle: "RAG Knowledge Base", category: "RAG" as Category, status: "live", price: "$299", priceNote: "RAG knowledge base", description: "Enterprise knowledge base: upload PDF, DOCX, URLs, Notion — get AI assistant that answers with inline source citations.", stack: ["Claude API", "LangChain", "ChromaDB", "FastAPI", "Next.js"], highlights: ["Supports PDF, DOCX, URL, Notion", "Semantic search across documents", "Answers with inline citations", "Ready widget for site / Telegram"], metrics: "4 doc types · cited answers", color: "from-violet-500/25 to-pink-500/15", accent: "border-violet-500/40", glow: "rgba(167, 139, 250, 0.3)" },
  { id: "06", title: "LeadHunter AI", subtitle: "Lead Qualification Bot", category: "Bots" as Category, status: "live", price: "$399", priceNote: "Lead generation AI", description: "WhatsApp/Telegram lead qualification using BANT methodology. Scores 1–10, auto-syncs hot leads to CRM with full conversation context.", stack: ["Claude API", "aiogram", "WhatsApp API", "HubSpot", "PostgreSQL"], highlights: ["Intelligent BANT qualification", "Lead scoring 1–10 scale", "Auto-push to HubSpot / Bitrix", "Hot lead alerts to manager"], metrics: "BANT scoring · CRM sync", color: "from-orange-500/25 to-rose-500/15", accent: "border-orange-500/40", glow: "rgba(249, 115, 22, 0.3)" },
  { id: "07", title: "SupportBot Pro", subtitle: "AI Customer Support", category: "Bots" as Category, status: "live", price: "$199", priceNote: "AI customer support", description: "First-line support agent trained on historical tickets. Handles 10+ languages. Escalates complex cases to humans with full context.", stack: ["Claude API", "RAG", "Telegram", "Zendesk API", "Python"], highlights: ["Trained on historical tickets & FAQ", "Smart escalation with context", "10+ languages supported", "Zendesk / Intercom / Freshdesk"], metrics: "10+ langs · smart escalation", color: "from-cyan-500/20 to-blue-500/10", accent: "border-cyan-500/30", glow: "rgba(34, 211, 238, 0.25)" },
  { id: "08", title: "ContentFactory", subtitle: "AI Content Automation", category: "Automation" as Category, status: "live", price: "$499", priceNote: "$2000 with setup", description: "N8N pipeline: one idea → 10 posts adapted for Instagram, LinkedIn, Telegram, Twitter in the right brand tone and format.", stack: ["N8N", "Claude API", "OpenAI", "Airtable", "Make"], highlights: ["Brief → ready posts in minutes", "Adapts tone per platform", "Auto-scheduling via Buffer", "Monthly content plan in 5 min"], metrics: "1 idea → 10 posts", color: "from-emerald-500/20 to-teal-500/10", accent: "border-emerald-500/30", glow: "rgba(52, 211, 153, 0.25)" },
  { id: "09", title: "RealEstate AI", subtitle: "Property Assistant Bot", category: "Bots" as Category, status: "live", price: "$199", priceNote: "Property assistant AI", description: "AI agent for real estate. Matches properties by parameters, answers questions 24/7, books viewings in Google Calendar, updates CRM.", stack: ["Claude API", "Telegram", "PostgreSQL", "Google Calendar", "Python"], highlights: ["Smart matching by parameters", "24/7 Q&A about listings", "Viewing booking in Calendar", "CRM updates & agent alerts"], metrics: "Smart match · auto-booking", color: "from-amber-500/20 to-orange-500/10", accent: "border-amber-500/30", glow: "rgba(245, 158, 11, 0.25)" },
  { id: "10", title: "MailMind", subtitle: "AI Email Automation", category: "Automation" as Category, status: "live", price: "$199", priceNote: "Email automation AI", description: "AI email processing: classifies inbound, prioritizes, drafts replies in 3 seconds, auto-sends standard responses, escalates edge cases.", stack: ["Claude API", "N8N", "Gmail API", "OpenAI", "Supabase"], highlights: ["Auto-classification of inbound", "Draft reply in 3 seconds", "Auto-sends FAQ responses", "Smart escalation of edge cases"], metrics: "3s draft · auto-classify", color: "from-pink-400/20 to-purple-400/10", accent: "border-pink-400/30", glow: "rgba(236, 72, 153, 0.25)" },
  { id: "11", title: "Contract Scanner", subtitle: "AI Legal Review", category: "RAG" as Category, status: "live", price: "$399", priceNote: "AI legal review", description: "Upload any contract — get risk analysis, red flags, clause comparison against templates, and plain-language summary in 30 seconds.", stack: ["Claude API", "LangChain", "ChromaDB", "FastAPI", "Next.js"], highlights: ["Risk & red flag analysis in 30s", "Compare against template standards", "Highlights dangerous clauses", "Plain-language summary"], metrics: "30s analysis · red flags", color: "from-blue-500/25 to-indigo-500/15", accent: "border-blue-500/40", glow: "rgba(59, 130, 246, 0.3)" },
  { id: "12", title: "Hiring Autopilot", subtitle: "AI Recruitment Agent", category: "Multi-Agent" as Category, status: "live", price: "$199", priceNote: "AI recruitment", description: "Multi-agent recruitment pipeline: screens 100+ resumes, conducts async chat interviews, AI-scores candidates, books finals automatically.", stack: ["Claude API", "aiogram", "PostgreSQL", "Google Calendar", "Python"], highlights: ["Screen 100+ resumes in minutes", "Async interview via Telegram/Web", "AI scoring by custom criteria", "Auto-booking of final interviews"], metrics: "100+ resumes/min · auto-book", color: "from-indigo-500/25 to-purple-500/15", accent: "border-indigo-500/40", glow: "rgba(139, 92, 246, 0.3)" },
  { id: "13", title: "BizPulse", subtitle: "Business Intelligence Agent", category: "Automation" as Category, status: "live", price: "$199", priceNote: "Business intelligence AI", description: "AI monitors revenue, CAC, LTV and conversion — auto-diagnoses anomalies and sends Telegram alerts with root cause analysis.", stack: ["Claude API", "N8N", "PostgreSQL", "Metabase", "Telegram"], highlights: ["Connects to DB / Sheets / Metabase", "Daily AI metric digest", "Alert on anomaly detection", "Root cause AI diagnosis"], metrics: "Real-time · root cause AI", color: "from-teal-500/25 to-cyan-500/15", accent: "border-teal-500/40", glow: "rgba(20, 184, 166, 0.3)" },
  { id: "14", title: "CodeReviewer", subtitle: "Autonomous Code Review Agent", category: "Multi-Agent" as Category, status: "live", price: "$199", priceNote: "Code review AI", description: "Autonomous code review agent. Analyzes PRs for bugs, security vulns, performance issues. Writes inline comments. Learns team conventions.", stack: ["Claude API", "GitHub API", "AST Parsers", "Python", "Docker"], highlights: ["PR analysis < 60 seconds", "OWASP security checks", "Learns team coding style", "Inline comments like a human"], metrics: "< 60s · OWASP · style learning", color: "from-lime-500/25 to-emerald-500/15", accent: "border-lime-500/40", glow: "rgba(132, 204, 22, 0.3)" },
  { id: "16", title: "Meeting Scribe", subtitle: "AI Meeting Assistant", category: "Voice AI" as Category, status: "live", price: "$199", priceNote: "Meeting assistant AI", description: "Records meetings via bot, transcribes, extracts action items, assigns owners, pushes tasks to project management tools automatically.", stack: ["Whisper", "Claude API", "Zoom SDK", "Notion API", "Python"], highlights: ["Live meeting transcription", "Action item extraction", "Auto-assign to owners", "Push to Notion / Todoist"], metrics: "Live transcription · auto-assign", color: "from-rose-500/25 to-pink-500/15", accent: "border-rose-500/40", glow: "rgba(244, 63, 94, 0.3)" },
  { id: "17", title: "Compliance Guard", subtitle: "Regulatory Compliance AI", category: "RAG" as Category, status: "live", price: "$199", priceNote: "Compliance AI", description: "Regulatory compliance checker. Upload policies + new docs — AI flags violations, suggests fixes, tracks compliance score over time.", stack: ["Claude API", "LangChain", "Pinecone", "FastAPI", "React"], highlights: ["Multi-regulation checking", "Compliance scoring with history", "Fix suggestions per violation", "Full audit trail"], metrics: "Multi-reg · audit trail", color: "from-yellow-500/25 to-amber-500/15", accent: "border-yellow-500/40", glow: "rgba(234, 179, 8, 0.3)" },
];

const categories: Category[] = ["All", "Multi-Agent", "Voice AI", "Bots", "Automation", "RAG"];

const productSlugMap: Record<string, string> = {
  "SKYNET": "skynet-platform",
  "AI Call Agent": "call-agent",
  "SKYNET Intake": "skynet-intake",
  "Svetlana AI-admin": "svetlana",
  "C-Admin": "c-admin",
  "DocMind": "docmind",
  "LeadHunter AI": "leadhunter",
  "SupportBot Pro": "supportbot-pro",
  "ContentFactory": "contentfactory",
  "RealEstate AI": "realestate-ai",
  "MailMind": "mailmind",
  "Contract Scanner": "contract-scanner",
  "Hiring Autopilot": "hiring-autopilot",
  "BizPulse": "bizpulse",
  "CodeReviewer": "code-reviewer",
  "Meeting Scribe": "meeting-scribe",
  "Compliance Guard": "compliance-guard",
};
const botBuyLink = (title: string) => `https://t.me/shop_by_finekot_bot?start=buy_${productSlugMap[title] || title.toLowerCase().replace(/\s+/g, "-")}`;



const navLinks = [
  { href: "#hero", label: "Home" },
  { href: "#products", label: "Products" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

function PricingBlock({ codePrice, setupPrice, ctaTemplate, ctaIntegration, t, onBuy }: { codePrice: number; setupPrice?: number; ctaTemplate: string; ctaIntegration: string; t: any; onBuy?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
      className="mt-12 mb-6">
      {setupPrice ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-xl p-6 sm:p-8 text-center">
            <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-3">Source Code</p>
            <p className="text-4xl font-black gradient-text font-mono mb-2">${codePrice}</p>
            <p className="text-xs text-pink-100/30 mb-5">{t.pricingSection.templateDesc}</p>
            <ul className="space-y-2 text-sm text-pink-100/40 text-left mb-6">
              {t.pricingSection.templateIncludes.map((item: string) => (
                <li key={item} className="flex gap-2"><span className="text-pink-400/40">→</span> {item}</li>
              ))}
            </ul>
            <button onClick={onBuy}
              className="inline-block w-full px-6 py-3 rounded-lg border border-pink-400/20 text-sm font-semibold text-pink-100/70 hover:bg-pink-400/10 hover:text-pink-100 transition-all">
              {ctaTemplate}
            </button>
          </div>
          <div className="glass rounded-xl p-6 sm:p-8 text-center border-pink-400/20 shadow-[0_0_40px_rgba(244,114,182,0.08)]">
            <div className="flex justify-center mb-3">
              <span className="text-[10px] px-3 py-1 rounded-full bg-pink-500/15 text-pink-300/60 border border-pink-500/20 font-mono uppercase tracking-wider">{t.pricingSection.recommended}</span>
            </div>
            <p className="text-4xl font-black gradient-text font-mono mb-2">${setupPrice}</p>
            <p className="text-xs text-pink-100/30 mb-5">{t.pricingSection.integrationDesc}</p>
            <ul className="space-y-2 text-sm text-pink-100/40 text-left mb-6">
              {t.pricingSection.integrationIncludes.map((item: string) => (
                <li key={item} className="flex gap-2"><span className="text-pink-400">→</span> {item}</li>
              ))}
            </ul>
            <button onClick={onBuy}
              className="inline-block w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(244,114,182,0.2)]">
              {ctaIntegration}
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="glass rounded-xl p-6 sm:p-8 text-center border-pink-400/20 shadow-[0_0_40px_rgba(244,114,182,0.08)]">
            <p className="text-4xl font-black gradient-text font-mono mb-2">${codePrice}</p>
            <p className="text-xs text-pink-100/30 mb-5">{t.pricingSection.templateDesc}</p>
            <ul className="space-y-2 text-sm text-pink-100/40 text-left mb-6">
              {t.pricingSection.templateIncludes.map((item: string) => (
                <li key={item} className="flex gap-2"><span className="text-pink-400">→</span> {item}</li>
              ))}
            </ul>
            <button onClick={onBuy}
              className="inline-block w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(244,114,182,0.2)]">
              {ctaTemplate}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   ANIMATED NUMBER (from 3000)
   ═══════════════════════════════════════════════════════ */

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) animate(count, value, { duration: 1.5, ease: "easeOut" });
  }, [inView, count, value]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   SCROLL PROGRESS (from 3000)
   ═══════════════════════════════════════════════════════ */

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setProgress(el.scrollHeight - el.clientHeight > 0 ? (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-transparent">
      <motion.div className="h-full bg-gradient-to-r from-pink-600 via-pink-400 to-orange-400" style={{ width: `${progress}%` }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

const fade = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true as const } };

export default function Home() {
  const [cat, setCat] = useState<Category>("All");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [lang, setLang] = useState<Lang>("EN");

  // Checkout modal state
  const [checkoutProduct, setCheckoutProduct] = useState<typeof projects[0] | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutSubmitted, setCheckoutSubmitted] = useState(false);

  const openCheckout = (product: typeof projects[0]) => {
    setCheckoutProduct(product);
    setCheckoutEmail("");
    setCheckoutName("");
    setCheckoutSubmitted(false);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutProduct || !checkoutEmail) return;
    setCheckoutSubmitted(true);
    const slug = productSlugMap[checkoutProduct.title] || checkoutProduct.title.toLowerCase().replace(/\s+/g, "-");
    const emailB64 = btoa(checkoutEmail);
    const nameParam = checkoutName ? `_${btoa(checkoutName)}` : "";
    setTimeout(() => {
      window.open(`https://t.me/shop_by_finekot_bot?start=pay_${slug}_${emailB64}${nameParam}`, "_blank");
      setCheckoutProduct(null);
    }, 1500);
  };

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const t = i18n[lang];
  const pt = projectI18n[lang];

  // Single-line typewriter effect
  const [displayText, setDisplayText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const phrases = t.roles;
    const current = phrases[phraseIdx % phrases.length];
    const typeSpeed = isDeleting ? 30 : 60;
    const pauseAfterType = 2500;
    const pauseAfterDelete = 300;

    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayText === current) {
      timeout = setTimeout(() => setIsDeleting(true), pauseAfterType);
    } else if (isDeleting && displayText === "") {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIdx((prev) => prev + 1);
      }, pauseAfterDelete);
    } else {
      timeout = setTimeout(() => {
        setDisplayText(
          isDeleting
            ? current.substring(0, displayText.length - 1)
            : current.substring(0, displayText.length + 1)
        );
      }, typeSpeed);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIdx, t.roles]);

  useEffect(() => {
    setDisplayText("");
    setPhraseIdx(0);
    setIsDeleting(false);
  }, [lang]);

  // Nav scroll state + active section
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = navLinks.map((l) => l.href.slice(1));
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) { setActiveSection(id); break; }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const allFiltered = cat === "All" ? projects : projects.filter((p) => p.category === cat);
  const filtered = showAllProjects ? allFiltered : allFiltered.slice(0, 6);
  const hasMore = allFiltered.length > 6 && !showAllProjects;

  return (
    <div className="relative min-h-screen bg-[#0a0608] text-[#ede0e4]">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-pink-600/60" />
        <div className="blob blob-2 absolute top-[40%] right-[-15%] w-[500px] h-[500px] rounded-full bg-purple-600/50" />
        <div className="blob blob-3 absolute bottom-[-15%] left-[25%] w-[550px] h-[550px] rounded-full bg-fuchsia-600/40" />
      </div>
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      <ScrollProgress />

      {/* ─── NAV (from 3000 — hamburger, active section, scroll-aware) ─── */}
      <motion.nav
        initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || menuOpen ? "bg-[#0a0608]/90 backdrop-blur-lg border-b border-pink-500/10" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#hero" className="text-lg font-bold tracking-tight gradient-text font-mono">&lt;FK/&gt;</a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const id = link.href.slice(1);
              const isActive = activeSection === id;
              const label = t.nav[id as keyof typeof t.nav] || link.label;
              return (
                <a key={link.href} href={link.href}
                  className={`text-xs font-mono uppercase tracking-wider transition-colors ${isActive ? "text-pink-400" : "text-pink-200/40 hover:text-pink-300"}`}
                >
                  {label}
                  {isActive && <motion.div layoutId="nav-indicator" className="h-px bg-gradient-to-r from-pink-500 to-pink-300 mt-0.5" />}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <a href="#contact" className="hidden md:block text-sm px-4 py-2 rounded-lg border border-pink-500/20 hover:border-pink-400/60 hover:bg-pink-500/10 hover:shadow-[0_0_15px_rgba(244,114,182,0.15)] transition-all font-mono text-pink-300">
              {t.nav.connect}
            </a>
            {/* Hamburger */}
            <button onClick={() => setMenuOpen((v) => !v)} className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-pink-500/20 hover:border-pink-400/40 transition-colors" aria-label="Menu">
              <motion.span animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="w-5 h-px bg-pink-400 block" />
              <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-5 h-px bg-pink-400 block" />
              <motion.span animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="w-5 h-px bg-pink-400 block" />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden overflow-hidden border-t border-pink-500/10">
              <div className="px-6 py-4 flex flex-col gap-1">
                {navLinks.map((link) => {
                  const id = link.href.slice(1);
                  const label = t.nav[id as keyof typeof t.nav] || link.label;
                  return (
                    <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                      className={`px-4 py-3 rounded-lg text-sm font-mono uppercase tracking-wider transition-all ${activeSection === id ? "text-pink-400 bg-pink-500/10 border border-pink-500/20" : "text-pink-200/50 hover:text-pink-300 hover:bg-pink-500/5"}`}
                    >{label}</a>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ─── HERO ─── */}
      <section id="hero" className="relative z-10 min-h-[85vh] flex items-center justify-center dot-grid overflow-hidden pt-16">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-pink-500/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-orange-500/6 rounded-full blur-[120px]" />

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-[0.4em] text-pink-400/50 mb-4 font-mono">
            {t.heroSubtitle}
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold mb-1 tracking-tight">
            Fine<span className="gradient-text">kot</span>{" "}<span className="text-pink-400/40 font-light">Systems</span>
          </motion.h1>




          <div className="flex items-center justify-center h-[48px] mb-8 overflow-hidden">
            <p className="text-sm sm:text-base md:text-lg text-pink-300/50 font-mono tracking-wide">
              {displayText}<span className="animate-pulse text-pink-400">|</span>
            </p>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a href="#projects" className="px-8 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-medium rounded-lg hover:from-pink-500 hover:to-pink-400 hover:shadow-[0_0_30px_rgba(244,114,182,0.3)] transition-all">
              {t.cta.viewProducts}
            </a>
            <a href="#contact" className="px-8 py-3 border border-pink-500/20 rounded-lg hover:border-pink-400/50 hover:bg-pink-500/5 transition-all text-pink-200">
              {t.cta.requestIntegration}
            </a>
          </motion.div>

          {/* Language switcher */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-2 mt-10">
            {langs.map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
                  lang === l
                    ? "bg-pink-500/20 border-pink-400/60 text-pink-300 shadow-[0_0_20px_rgba(244,114,182,0.15)]"
                    : "border-pink-500/10 text-pink-300/25 hover:border-pink-400/30 hover:text-pink-300/60"
                }`}
              >{l}</button>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator — enhanced */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <motion.p
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[10px] uppercase tracking-[0.3em] text-pink-400/40 font-mono"
          >
            scroll
          </motion.p>
          <div className="w-6 h-10 border-2 border-pink-500/20 rounded-full flex justify-center pt-2">
            <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 bg-pink-400/60 rounded-full" />
          </div>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-pink-400/30"
          >
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 1L8 8L15 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── VALUE PROPOSITION (Comparison + Stats) ─── */}
      <section className="relative z-10 py-16 sm:py-20 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Comparison Block */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative rounded-2xl border border-pink-500/10 bg-gradient-to-b from-pink-500/[0.04] to-transparent backdrop-blur-sm overflow-hidden mb-10">
            <div className="grid grid-cols-2 divide-x divide-pink-500/10">
              {/* WITHOUT column */}
              <div className="p-5 sm:p-8">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/20 font-mono mb-5 sm:mb-6">{t.comparison.without}</p>
                <div className="space-y-3 sm:space-y-4">
                  {t.comparison.rows.map((row, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-2 sm:gap-3">
                      <span className="text-red-400/50 mt-0.5 text-xs sm:text-sm shrink-0">{"\u2715"}</span>
                      <span className="text-white/25 text-xs sm:text-sm leading-relaxed">{row.bad}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* WITH column */}
              <div className="p-5 sm:p-8 bg-pink-500/[0.03]">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-pink-400/50 font-mono mb-5 sm:mb-6">{t.comparison.with}</p>
                <div className="space-y-3 sm:space-y-4">
                  {t.comparison.rows.map((row, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 + 0.15 }}
                      className="flex items-start gap-2 sm:gap-3">
                      <span className="text-emerald-400/70 mt-0.5 text-xs sm:text-sm shrink-0">{"\u2713"}</span>
                      <span className="text-white/60 text-xs sm:text-sm leading-relaxed font-medium">{row.good}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Glass Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
            {[
              { value: 17, suffix: "", prefix: "", label: t.stats.products },
              { value: 149, suffix: "", prefix: "$", label: t.stats.startingPrice },
              { value: 1, suffix: "", prefix: "<", label: t.stats.dayIntegration },
              { value: 17, suffix: "+", prefix: "", label: t.stats.systemsBuilt },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group relative rounded-xl border border-pink-500/10 bg-pink-500/[0.02] p-4 sm:p-5 text-center hover:border-pink-400/25 hover:bg-pink-500/[0.05] transition-all duration-300">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text font-mono mb-1">
                    {s.prefix}<AnimatedNumber value={s.value} suffix={s.suffix} />
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-pink-300/35 uppercase tracking-[0.2em] font-mono">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center">
            <a href="#projects"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-pink-500 hover:to-pink-400 hover:shadow-[0_0_30px_rgba(244,114,182,0.3)] transition-all">
              {t.comparison.cta} <span className="ml-1">&rarr;</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── PROJECTS ─── */}
      <section id="projects" className="relative z-10 py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fade}>
            <p className="text-xs text-pink-400/30 uppercase tracking-[0.4em] mb-3 font-mono">{t.projectsSection.label}</p>
            <h2 className="text-3xl md:text-5xl font-black mb-3 tracking-tight"><span className="gradient-text">{t.projectsSection.title}</span></h2>
          </motion.div>

          {/* Category filter */}
          <motion.div {...fade} className="flex flex-wrap gap-2 mb-8 mt-6">
            {categories.map((c) => (
              <button key={c} onClick={() => { setCat(c); setExpanded(null); }}
                className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider border transition-all ${
                  cat === c
                    ? "border-pink-400/60 bg-pink-500/15 text-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.15)]"
                    : "border-pink-500/10 text-pink-300/30 hover:border-pink-400/30 hover:text-pink-300/50"
                }`}
              >{t.categories[c] || c}</button>
            ))}
          </motion.div>

          {/* Project count */}
          <p className="text-xs text-pink-300/20 font-mono mb-6">{allFiltered.length} {t.projectsSection.shown}</p>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => {
                const isExpanded = expanded === i;
                const pData = pt[p.id as keyof typeof pt];
                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    onClick={() => setExpanded(isExpanded ? null : i)}
                    className={`glass rounded-xl overflow-hidden cursor-pointer group transition-all border border-transparent hover:border-pink-500/20 ${
                      isExpanded ? "md:col-span-2 lg:col-span-2" : ""
                    }`}
                    style={{ boxShadow: isExpanded ? `0 0 40px ${p.glow}` : "none" }}
                  >
                    <div className={`h-1.5 bg-gradient-to-r ${p.color}`} />
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-pink-400/30">#{p.id}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/60 border border-emerald-500/20 font-mono">{t.projectUI.live}</span>
                          </div>
                          <h3 className="text-lg font-bold text-pink-100/80 group-hover:text-pink-100 transition-colors">{p.title}</h3>
                          <p className="text-xs text-pink-300/40 font-mono">{pData?.subtitle || p.subtitle}</p>
                        </div>
                        <span className={`text-pink-400/30 transition-transform ${isExpanded ? "rotate-45" : ""}`}>+</span>
                      </div>

                      <p className="text-xs text-pink-100/30 leading-relaxed mb-3">{pData?.description || p.description}</p>

                      {/* Price + metrics + Buy CTA */}
                      <div className="flex items-end justify-between mt-2">
                        <div>
                          <span className="text-base font-black gradient-text font-mono">{p.price}</span>
                          <p className="text-[9px] text-emerald-400/50 font-mono mt-0.5">{p.priceNote}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-pink-300/30 font-mono hidden sm:block">{p.metrics}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); openCheckout(p); }}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-[10px] font-bold text-white uppercase tracking-wider hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(244,114,182,0.2)] whitespace-nowrap"
                          >
                            Buy →
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="mt-4 pt-4 border-t border-pink-500/10">
                              {/* Full description */}
                              <p className="text-xs text-pink-100/40 leading-relaxed mb-4">{pData?.description || p.description}</p>

                              <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-2">{t.projectUI.keyFeatures}</p>
                              <ul className="space-y-1.5 mb-4">
                                {(pData?.highlights || p.highlights).map((h: string) => (
                                  <li key={h} className="flex gap-2 text-xs text-pink-100/40"><span className="text-pink-400/60">→</span> {h}</li>
                                ))}
                              </ul>

                              {/* Tech stack */}
                              <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-2">
                                {lang === "RU" ? "Стек технологий" : lang === "UA" ? "Стек технологій" : "Tech Stack"}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {p.stack.map((s) => (
                                  <span key={s} className="text-[10px] px-2 py-1 rounded-md bg-pink-500/5 text-pink-300/30 border border-pink-500/10 font-mono">{s}</span>
                                ))}
                              </div>

                              {/* What you get */}
                              <div className="glass rounded-lg p-4 mb-4 border border-pink-500/10">
                                <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-2">
                                  {lang === "RU" ? "Что вы получаете" : lang === "UA" ? "Що ви отримуєте" : "What you get"}
                                </p>
                                <ul className="space-y-1">
                                  <li className="flex gap-2 text-xs text-pink-100/40"><span className="text-emerald-400/60">✓</span> {lang === "RU" ? "Полный исходный код" : lang === "UA" ? "Повний вихідний код" : "Full source code"}</li>
                                  <li className="flex gap-2 text-xs text-pink-100/40"><span className="text-emerald-400/60">✓</span> {lang === "RU" ? "Документация + инструкция по установке" : lang === "UA" ? "Документація + інструкція з встановлення" : "Documentation + setup guide"}</li>
                                  <li className="flex gap-2 text-xs text-pink-100/40"><span className="text-emerald-400/60">✓</span> {lang === "RU" ? "Без подписок — навсегда ваш" : lang === "UA" ? "Без підписок — назавжди ваш" : "No subscriptions — yours forever"}</li>
                                  <li className="flex gap-2 text-xs text-pink-100/40"><span className="text-emerald-400/60">✓</span> {lang === "RU" ? "Доставка на email после оплаты" : lang === "UA" ? "Доставка на email після оплати" : "Delivered to your email after payment"}</li>
                                </ul>
                              </div>

                              <button
                                onClick={(e) => { e.stopPropagation(); openCheckout(p); }}
                                className="block w-full text-center px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_25px_rgba(244,114,182,0.2)]"
                              >
                                Get {p.title} — {p.price} →
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Show more button */}
          {hasMore && (
            <motion.div {...fade} className="text-center mt-8">
              <button
                onClick={() => setShowAllProjects(true)}
                className="px-8 py-3 rounded-xl border border-pink-500/20 text-pink-300/50 font-mono text-sm hover:border-pink-400/50 hover:text-pink-300 hover:bg-pink-500/5 transition-all"
              >
                {t.projectsSection.showMore} (+{allFiltered.length - 6})
              </button>
            </motion.div>
          )}
          {showAllProjects && allFiltered.length > 6 && (
            <motion.div {...fade} className="text-center mt-8">
              <button
                onClick={() => setShowAllProjects(false)}
                className="px-8 py-3 rounded-xl border border-pink-500/10 text-pink-300/30 font-mono text-xs hover:border-pink-400/30 hover:text-pink-300/50 transition-all"
              >
                ↑ {t.projectsSection.showLess}
              </button>
            </motion.div>
          )}
        </div>
      </section>
      {/* ─── ABOUT ─── */}
      <section className="relative z-10 py-20 sm:py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fade}>
            <p className="text-xs text-pink-400/30 uppercase tracking-[0.4em] mb-4 font-mono">{t.about.label}</p>
            <h2 className="text-3xl md:text-5xl font-black mb-6"><span className="gradient-text">{t.about.title}</span></h2>
            <p className="text-pink-100/40 text-base sm:text-lg leading-relaxed mb-8">{t.about.desc}</p>
            <div className="glass rounded-xl p-4 sm:p-6 text-left max-w-md mx-auto">
              <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-3">{t.about.boxTitle}</p>
              <ul className="space-y-2 text-sm text-pink-100/50">
                {t.about.points.map((point) => (
                  <li key={point} className="flex gap-2"><span className="text-pink-400">→</span> {point}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SKYNET PRODUCT ─── */}
      <section id="products" className="relative z-10 py-20 sm:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade} className="text-center mb-12">
            <p className="text-xs text-pink-400/30 uppercase tracking-[0.4em] mb-3 font-mono">{t.skynetProduct.label}</p>
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight"><span className="gradient-text">{t.skynetProduct.title}</span></h2>
            <p className="text-lg md:text-xl text-pink-100/50 font-semibold mb-4">{t.skynetProduct.subtitle}</p>
            <p className="text-pink-100/30 text-base leading-relaxed max-w-3xl mx-auto">{t.skynetProduct.desc}</p>
          </motion.div>

          {/* ASCII Diagram */}
          <motion.div {...fade} className="glass rounded-xl p-4 sm:p-8 overflow-x-auto flex flex-col items-center mb-10">
            <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-4">{t.skynetProduct.diagramTitle}</p>
            <pre className="diagram text-[10px] md:text-xs text-pink-300/50">
{`       ┌──────────────────┐
       │    COMMANDER     │
       │   (You / Telegram)│
       └────────┬─────────┘
                │
       ┌────────▼─────────┐
       │     SKYNET       │
       │   Coordinator    │
       │                  │
       │  Decompose →     │
       │  Route →         │
       │  Quality Gate    │
       └──┬───┬───┬───┬──┘
          │   │   │   │
    ┌─────┘   │   │   └─────┐
    │    ┌────┘   └────┐    │
    ▼    ▼             ▼    ▼
┌──────┐┌──────┐┌──────┐┌──────┐
│ T-1  ││ T-2  ││ T-3  ││ T-4  │
│ Full ││ Back ││ Dev  ││ Res. │
│stack ││ end  ││ Ops  ││ + QA │
└──┬───┘└──┬───┘└──┬───┘└──┬───┘
   │       │       │       │
┌──▼───────▼───────▼───────▼───┐
│     Results → Dashboard      │
│   Reports · Code · Research  │
└──────────────────────────────┘`}
            </pre>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.skynetProduct.features.map((f, i) => (
              <motion.div key={f.title} {...fade} transition={{ delay: i * 0.08 }}
                className="glass rounded-xl p-5 hover:border-pink-500/20 transition-colors group">
                <span className="text-sm font-mono text-pink-400/40 mb-3 block">{f.icon}</span>
                <h3 className="text-sm font-bold text-pink-100/70 mb-2 group-hover:text-pink-100/90 transition-colors">{f.title}</h3>
                <p className="text-xs text-pink-100/30 leading-relaxed">{f.text}</p>
              </motion.div>
            ))}
          </div>

          <PricingBlock codePrice={1200} ctaTemplate={t.skynetProduct.ctaTemplate} ctaIntegration={t.skynetProduct.ctaIntegration} t={t} onBuy={() => openCheckout(projects.find(p => p.title === "SKYNET")!)} />
          <div className="text-center">
            <a href="/products/skynet-platform" className="text-xs text-pink-400/30 hover:text-pink-400/60 transition-colors font-mono">Learn more →</a>
          </div>
        </div>
      </section>

      {/* ─── CONTENTFACTORY ─── */}
      <section className="relative z-10 py-20 sm:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade} className="text-center mb-12">
            <p className="text-xs text-pink-400/30 uppercase tracking-[0.4em] mb-3 font-mono">{t.contentFactory.label}</p>
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight"><span className="gradient-text">{t.contentFactory.title}</span></h2>
            <p className="text-lg md:text-xl text-pink-100/50 font-semibold mb-4">{t.contentFactory.subtitle}</p>
            <p className="text-pink-100/30 text-base leading-relaxed max-w-3xl mx-auto">{t.contentFactory.desc}</p>
          </motion.div>
          <motion.div {...fade} className="glass rounded-xl p-4 sm:p-8 overflow-x-auto flex flex-col items-center mb-10">
            <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-4">{t.contentFactory.diagramTitle}</p>
            <pre className="diagram text-[10px] md:text-xs text-pink-300/50">
{`  ┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
  │  YOUR BRAND  │──────▶│  CONTENTFACTORY  │──────▶│  PUBLISHED   │
  │              │       │                  │       │              │
  │ Voice, Style │       │ Generate →       │       │ Blog, Social │
  │ Guidelines   │       │ Schedule →       │       │ Newsletter   │
  └──────────────┘       │ Publish          │       │ Ads          │
                         └────────┬─────────┘       └──────────────┘
                                  │
            ┌──────────┬──────────┼──────────┬──────────┐
            ▼          ▼          ▼          ▼          ▼
     ┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐
     │ GENERATE ││ SCHEDULE ││ PUBLISH  ││ TRACK    ││ RECYCLE  │
     │ CONTENT  ││ CALENDAR ││ CHANNELS ││ METRICS  ││ WINNERS  │
     └──────────┘└──────────┘└──────────┘└──────────┘└──────────┘`}
            </pre>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.contentFactory.features.map((f, i) => (
              <motion.div key={f.title} {...fade} transition={{ delay: i * 0.08 }}
                className="glass rounded-xl p-5 hover:border-pink-500/20 transition-colors group">
                <span className="text-sm font-mono text-pink-400/40 mb-3 block">{f.icon}</span>
                <h3 className="text-sm font-bold text-pink-100/70 mb-2 group-hover:text-pink-100/90 transition-colors">{f.title}</h3>
                <p className="text-xs text-pink-100/30 leading-relaxed">{f.text}</p>
              </motion.div>
            ))}
          </div>
          <PricingBlock codePrice={499} setupPrice={2000} ctaTemplate={t.contentFactory.ctaTemplate} ctaIntegration={t.contentFactory.ctaIntegration} t={t} onBuy={() => openCheckout(projects.find(p => p.title === "ContentFactory")!)} />
          <div className="text-center">
            <a href="/products/contentfactory" className="text-xs text-pink-400/30 hover:text-pink-400/60 transition-colors font-mono">Learn more →</a>
          </div>
        </div>
      </section>

      {/* ─── SVETLANA — AI BUSINESS ─── */}
      <section className="relative z-10 py-20 sm:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade} className="text-center mb-12">
            <p className="text-xs text-pink-400/30 uppercase tracking-[0.4em] mb-3 font-mono">{t.svetlana.label}</p>
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight"><span className="gradient-text">{t.svetlana.title}</span></h2>
            <p className="text-lg md:text-xl text-pink-100/50 font-semibold mb-4">{t.svetlana.subtitle}</p>
            <p className="text-pink-100/30 text-base leading-relaxed max-w-3xl mx-auto">{t.svetlana.desc}</p>
          </motion.div>

          {/* ASCII Diagram */}
          <motion.div {...fade} className="glass rounded-xl p-4 sm:p-8 overflow-x-auto flex flex-col items-center mb-10">
            <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-4">{t.svetlana.diagramTitle}</p>
            <pre className="diagram text-[10px] md:text-xs text-pink-300/50">
{`  ┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
  │  YOU / ВЫ   │──────▶│ SVETLANA AI-ADMIN│──────▶│  BUSINESS   │
  │             │       │    AI Core       │       │   RUNNING   │
  │ Location +  │       │                  │       │             │
  │ Decor       │       │  Autonomous Mgmt │       │ Clients $   │
  └─────────────┘       └────────┬─────────┘       └─────────────┘
                                 │
            ┌──────────┬─────────┼─────────┬──────────┐
            ▼          ▼         ▼         ▼          ▼
     ┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐
     │  HIRING  ││ CLIENTS  ││  SUPPLY  ││  COMMS   ││ REPORTS  │
     │          ││          ││          ││          ││          │
     │  Auto    ││  Auto    ││  Semi-   ││  Full    ││  Daily   │
     │  recruit ││  acquire ││  auto    ││  auto    ││  summary │
     └──────────┘└──────────┘└──────────┘└──────────┘└──────────┘`}
            </pre>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.svetlana.features.map((f, i) => (
              <motion.div key={f.title} {...fade} transition={{ delay: i * 0.08 }}
                className="glass rounded-xl p-5 hover:border-pink-500/20 transition-colors group">
                <span className="text-sm font-mono text-pink-400/40 mb-3 block">{f.icon}</span>
                <h3 className="text-sm font-bold text-pink-100/70 mb-2 group-hover:text-pink-100/90 transition-colors">{f.title}</h3>
                <p className="text-xs text-pink-100/30 leading-relaxed">{f.text}</p>
              </motion.div>
            ))}
          </div>

          <PricingBlock codePrice={500} setupPrice={2500} ctaTemplate={t.svetlana.ctaTemplate} ctaIntegration={t.svetlana.ctaIntegration} t={t} onBuy={() => openCheckout(projects.find(p => p.title === "Svetlana AI-admin")!)} />
          <div className="text-center">
            <a href="/products/svetlana" className="text-xs text-pink-400/30 hover:text-pink-400/60 transition-colors font-mono">Learn more →</a>
          </div>
        </div>
      </section>

      {/* ─── AI CALL AGENT ─── */}
      <section className="relative z-10 py-20 sm:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade} className="text-center mb-12">
            <p className="text-xs text-pink-400/30 uppercase tracking-[0.4em] mb-3 font-mono">{t.callAgent.label}</p>
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight"><span className="gradient-text">{t.callAgent.title}</span></h2>
            <p className="text-lg md:text-xl text-pink-100/50 font-semibold mb-4">{t.callAgent.subtitle}</p>
            <p className="text-pink-100/30 text-base leading-relaxed max-w-3xl mx-auto">{t.callAgent.desc}</p>
          </motion.div>
          <motion.div {...fade} className="glass rounded-xl p-4 sm:p-8 overflow-x-auto flex flex-col items-center mb-10">
            <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-4">{t.callAgent.diagramTitle}</p>
            <pre className="diagram text-[10px] md:text-xs text-pink-300/50">
{`  ┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
  │   INCOMING   │────────▶│   AI CALL AGENT  │────────▶│   RESULT     │
  │   CALL       │         │                  │         │              │
  └──────────────┘         │  NLU + TTS +     │         │ Booked /     │
  ┌──────────────┐         │  Smart Routing   │         │ Qualified /  │
  │   OUTBOUND   │────────▶│                  │         │ Answered     │
  │   CAMPAIGN   │         └────────┬─────────┘         └──────────────┘
  └──────────────┘                  │
              ┌──────────┬──────────┼──────────┬──────────┐
              ▼          ▼          ▼          ▼          ▼
       ┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐
       │ QUALIFY  ││  BOOK    ││  ANSWER  ││ ESCALATE ││  LOG     │
       │  LEAD    ││  APPT    ││  FAQ     ││ → HUMAN  ││  TO CRM  │
       └──────────┘└──────────┘└──────────┘└──────────┘└──────────┘`}
            </pre>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.callAgent.features.map((f, i) => (
              <motion.div key={f.title} {...fade} transition={{ delay: i * 0.08 }}
                className="glass rounded-xl p-5 hover:border-pink-500/20 transition-colors group">
                <span className="text-sm font-mono text-pink-400/40 mb-3 block">{f.icon}</span>
                <h3 className="text-sm font-bold text-pink-100/70 mb-2 group-hover:text-pink-100/90 transition-colors">{f.title}</h3>
                <p className="text-xs text-pink-100/30 leading-relaxed">{f.text}</p>
              </motion.div>
            ))}
          </div>
          <PricingBlock codePrice={149} ctaTemplate={t.callAgent.ctaTemplate} ctaIntegration={t.callAgent.ctaIntegration} t={t} onBuy={() => openCheckout(projects.find(p => p.title === "AI Call Agent")!)} />
          <div className="text-center">
            <a href="/products/call-agent" className="text-xs text-pink-400/30 hover:text-pink-400/60 transition-colors font-mono">Learn more →</a>
          </div>
        </div>
      </section>

      {/* ─── DOCMIND ─── */}
      <section className="relative z-10 py-20 sm:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade} className="text-center mb-12">
            <p className="text-xs text-pink-400/30 uppercase tracking-[0.4em] mb-3 font-mono">{t.docMind.label}</p>
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight"><span className="gradient-text">{t.docMind.title}</span></h2>
            <p className="text-lg md:text-xl text-pink-100/50 font-semibold mb-4">{t.docMind.subtitle}</p>
            <p className="text-pink-100/30 text-base leading-relaxed max-w-3xl mx-auto">{t.docMind.desc}</p>
          </motion.div>
          <motion.div {...fade} className="glass rounded-xl p-4 sm:p-8 overflow-x-auto flex flex-col items-center mb-10">
            <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-4">{t.docMind.diagramTitle}</p>
            <pre className="diagram text-[10px] md:text-xs text-pink-300/50">
{`  ┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
  │  DOCUMENTS   │──────▶│     DOCMIND      │──────▶│   ANSWERS    │
  │              │       │    RAG Engine     │       │              │
  │ PDF, DOCX,   │       │                  │       │ + Sources    │
  │ XLS, PPT     │       │ Embed → Index    │       │ + Citations  │
  └──────────────┘       │ → Retrieve       │       └──────────────┘
                         └────────┬─────────┘
                                  │
            ┌──────────┬──────────┼──────────┬──────────┐
            ▼          ▼          ▼          ▼          ▼
     ┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐
     │  CHUNK   ││  EMBED   ││  SEARCH  ││ GENERATE ││  CITE    │
     │ & PARSE  ││ VECTORS  ││  & RANK  ││  ANSWER  ││ SOURCES  │
     └──────────┘└──────────┘└──────────┘└──────────┘└──────────┘`}
            </pre>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.docMind.features.map((f, i) => (
              <motion.div key={f.title} {...fade} transition={{ delay: i * 0.08 }}
                className="glass rounded-xl p-5 hover:border-pink-500/20 transition-colors group">
                <span className="text-sm font-mono text-pink-400/40 mb-3 block">{f.icon}</span>
                <h3 className="text-sm font-bold text-pink-100/70 mb-2 group-hover:text-pink-100/90 transition-colors">{f.title}</h3>
                <p className="text-xs text-pink-100/30 leading-relaxed">{f.text}</p>
              </motion.div>
            ))}
          </div>
          <PricingBlock codePrice={299} ctaTemplate={t.docMind.ctaTemplate} ctaIntegration={t.docMind.ctaIntegration} t={t} onBuy={() => openCheckout(projects.find(p => p.title === "DocMind")!)} />
          <div className="text-center">
            <a href="/products/docmind" className="text-xs text-pink-400/30 hover:text-pink-400/60 transition-colors font-mono">Learn more →</a>
          </div>
        </div>
      </section>

      {/* ─── HIRING AUTOPILOT ─── */}
      <section className="relative z-10 py-20 sm:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade} className="text-center mb-12">
            <p className="text-xs text-pink-400/30 uppercase tracking-[0.4em] mb-3 font-mono">{t.hiringAutopilot.label}</p>
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight"><span className="gradient-text">{t.hiringAutopilot.title}</span></h2>
            <p className="text-lg md:text-xl text-pink-100/50 font-semibold mb-4">{t.hiringAutopilot.subtitle}</p>
            <p className="text-pink-100/30 text-base leading-relaxed max-w-3xl mx-auto">{t.hiringAutopilot.desc}</p>
          </motion.div>
          <motion.div {...fade} className="glass rounded-xl p-4 sm:p-8 overflow-x-auto flex flex-col items-center mb-10">
            <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-4">{t.hiringAutopilot.diagramTitle}</p>
            <pre className="diagram text-[10px] md:text-xs text-pink-300/50">
{`  ┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
  │   VACANCY    │──────▶│     HIRING       │──────▶│   TOP 3      │
  │              │       │    AUTOPILOT     │       │  CANDIDATES  │
  │ Role + Reqs  │       │                  │       │              │
  │              │       │ Multi-Agent      │       │ Ranked +     │
  └──────────────┘       │ Pipeline         │       │ Ready        │
                         └────────┬─────────┘       └──────────────┘
                                  │
            ┌──────────┬──────────┼──────────┬──────────┐
            ▼          ▼          ▼          ▼          ▼
     ┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐
     │  POST    ││  SCREEN  ││  CHAT    ││ SCHEDULE ││  RANK    │
     │ TO BOARDS││ RESUMES  ││ INTERVIEW││ MEETINGS ││ & SCORE  │
     └──────────┘└──────────┘└──────────┘└──────────┘└──────────┘`}
            </pre>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.hiringAutopilot.features.map((f, i) => (
              <motion.div key={f.title} {...fade} transition={{ delay: i * 0.08 }}
                className="glass rounded-xl p-5 hover:border-pink-500/20 transition-colors group">
                <span className="text-sm font-mono text-pink-400/40 mb-3 block">{f.icon}</span>
                <h3 className="text-sm font-bold text-pink-100/70 mb-2 group-hover:text-pink-100/90 transition-colors">{f.title}</h3>
                <p className="text-xs text-pink-100/30 leading-relaxed">{f.text}</p>
              </motion.div>
            ))}
          </div>
          <PricingBlock codePrice={199} ctaTemplate={t.hiringAutopilot.ctaTemplate} ctaIntegration={t.hiringAutopilot.ctaIntegration} t={t} onBuy={() => openCheckout(projects.find(p => p.title === "Hiring Autopilot")!)} />
          <div className="text-center">
            <a href="/products/hiring-autopilot" className="text-xs text-pink-400/30 hover:text-pink-400/60 transition-colors font-mono">Learn more →</a>
          </div>
        </div>
      </section>

      {/* ─── LEADHUNTER AI ─── */}
      <section className="relative z-10 py-20 sm:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade} className="text-center mb-12">
            <p className="text-xs text-pink-400/30 uppercase tracking-[0.4em] mb-3 font-mono">{t.leadHunter.label}</p>
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight"><span className="gradient-text">{t.leadHunter.title}</span></h2>
            <p className="text-lg md:text-xl text-pink-100/50 font-semibold mb-4">{t.leadHunter.subtitle}</p>
            <p className="text-pink-100/30 text-base leading-relaxed max-w-3xl mx-auto">{t.leadHunter.desc}</p>
          </motion.div>
          <motion.div {...fade} className="glass rounded-xl p-4 sm:p-8 overflow-x-auto flex flex-col items-center mb-10">
            <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-4">{t.leadHunter.diagramTitle}</p>
            <pre className="diagram text-[10px] md:text-xs text-pink-300/50">
{`  ┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
  │  CHANNELS    │──────▶│   LEADHUNTER     │──────▶│  WARM LEADS  │
  │              │       │      AI          │       │              │
  │ TG, LinkedIn │       │                  │       │ Qualified    │
  │ Forums, Web  │       │ Monitor → Engage │       │ + Context    │
  └──────────────┘       │ → Qualify        │       │ → Your CRM   │
                         └────────┬─────────┘       └──────────────┘
                                  │
            ┌──────────┬──────────┼──────────┬──────────┐
            ▼          ▼          ▼          ▼          ▼
     ┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐
     │ MONITOR  ││ ENGAGE   ││ QUALIFY  ││ DELIVER  ││ OPTIMIZE │
     │ CHANNELS ││ PROSPECT ││ BY RULES ││ TO CRM   ││ & LEARN  │
     └──────────┘└──────────┘└──────────┘└──────────┘└──────────┘`}
            </pre>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.leadHunter.features.map((f, i) => (
              <motion.div key={f.title} {...fade} transition={{ delay: i * 0.08 }}
                className="glass rounded-xl p-5 hover:border-pink-500/20 transition-colors group">
                <span className="text-sm font-mono text-pink-400/40 mb-3 block">{f.icon}</span>
                <h3 className="text-sm font-bold text-pink-100/70 mb-2 group-hover:text-pink-100/90 transition-colors">{f.title}</h3>
                <p className="text-xs text-pink-100/30 leading-relaxed">{f.text}</p>
              </motion.div>
            ))}
          </div>
          <PricingBlock codePrice={399} ctaTemplate={t.leadHunter.ctaTemplate} ctaIntegration={t.leadHunter.ctaIntegration} t={t} onBuy={() => openCheckout(projects.find(p => p.title === "LeadHunter AI")!)} />
          <div className="text-center">
            <a href="/products/leadhunter" className="text-xs text-pink-400/30 hover:text-pink-400/60 transition-colors font-mono">Learn more →</a>
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-md mx-auto">
          <motion.div {...fade} className="glass rounded-xl p-6 sm:p-8 text-center border border-pink-500/10">
            <p className="text-[10px] text-pink-400/30 uppercase tracking-[0.3em] mb-2 font-mono">
              {lang === "RU" ? "Рассылка" : lang === "UA" ? "Розсилка" : "Newsletter"}
            </p>
            <p className="text-sm text-pink-100/40 mb-4">
              {lang === "RU" ? "Новые AI-продукты и спецпредложения. Без спама." : lang === "UA" ? "Нові AI-продукти та спецпропозиції. Без спаму." : "New AI products & special offers. No spam."}
            </p>
            {newsletterDone ? (
              <p className="text-sm text-emerald-400/70 font-mono">
                {lang === "RU" ? "Подписано ✓" : lang === "UA" ? "Підписано ✓" : "Subscribed ✓"}
              </p>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (newsletterEmail) setNewsletterDone(true); }} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={lang === "RU" ? "your@email.com" : "your@email.com"}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-pink-500/15 text-sm text-pink-100/70 placeholder:text-pink-300/20 focus:outline-none focus:border-pink-500/40 font-mono"
                />
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap">
                  →
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="relative z-10 py-20 sm:py-28 px-6">
        <div className="max-w-xl mx-auto text-center">
          <motion.div {...fade}>
            <p className="text-xs text-pink-400/30 uppercase tracking-[0.4em] mb-4 font-mono">{t.contact.label}</p>
            <h2 className="text-3xl md:text-5xl font-black mb-4"><span className="gradient-text">{t.contact.title}</span></h2>
            <p className="text-pink-100/30 mb-8">{t.contact.subtitle}</p>
            <a href="https://t.me/shop_by_finekot_bot" target="_blank" rel="noopener noreferrer" className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_60px_rgba(244,114,182,0.2)]">
              Telegram → @shop_by_finekot_bot
            </a>
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 py-6 text-center text-[10px] text-pink-300/15 border-t border-pink-500/10 font-mono uppercase tracking-wider">
        {t.footer}
      </footer>

      {/* ─── CHECKOUT MODAL ─── */}
      <AnimatePresence>
        {checkoutProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={() => setCheckoutProduct(null)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md glass rounded-2xl p-6 sm:p-8 border border-pink-500/20 shadow-[0_0_80px_rgba(244,114,182,0.15)]"
            >
              <button onClick={() => setCheckoutProduct(null)} className="absolute top-4 right-4 text-pink-400/30 hover:text-pink-400/60 text-lg">×</button>

              {checkoutSubmitted ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✓</div>
                  <p className="text-pink-100/70 font-semibold mb-2">
                    {lang === "RU" ? "Перенаправляем в Telegram..." : lang === "UA" ? "Переспрямовуємо в Telegram..." : "Redirecting to Telegram..."}
                  </p>
                  <p className="text-xs text-pink-300/30 font-mono">
                    {lang === "RU" ? "Выберите криптовалюту и оплатите" : lang === "UA" ? "Оберіть криптовалюту та оплатіть" : "Choose crypto & complete payment"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-[10px] text-pink-400/30 uppercase tracking-[0.3em] font-mono mb-1">
                      {lang === "RU" ? "Оформление" : lang === "UA" ? "Оформлення" : "Checkout"}
                    </p>
                    <h3 className="text-xl font-bold text-pink-100/80">{checkoutProduct.title}</h3>
                    <p className="text-xs text-pink-300/40 font-mono">{checkoutProduct.subtitle}</p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-black gradient-text font-mono">{checkoutProduct.price}</span>
                      <span className="text-[10px] text-pink-300/30 font-mono">{checkoutProduct.priceNote}</span>
                    </div>
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-pink-400/40 uppercase tracking-wider font-mono mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={checkoutEmail}
                        onChange={(e) => setCheckoutEmail(e.target.value)}
                        placeholder={lang === "RU" ? "Куда отправить продукт" : lang === "UA" ? "Куди надіслати продукт" : "Where to deliver the product"}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-pink-500/15 text-sm text-pink-100/70 placeholder:text-pink-300/20 focus:outline-none focus:border-pink-500/40 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-pink-400/40 uppercase tracking-wider font-mono mb-1.5">
                        {lang === "RU" ? "Имя (опционально)" : lang === "UA" ? "Ім'я (опціонально)" : "Name (optional)"}
                      </label>
                      <input
                        type="text"
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        placeholder={lang === "RU" ? "Ваше имя" : lang === "UA" ? "Ваше ім'я" : "Your name"}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-pink-500/15 text-sm text-pink-100/70 placeholder:text-pink-300/20 focus:outline-none focus:border-pink-500/40 font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(244,114,182,0.2)] text-sm"
                    >
                      {lang === "RU" ? "Перейти к оплате →" : lang === "UA" ? "Перейти до оплати →" : "Proceed to Payment →"}
                    </button>
                    <p className="text-[9px] text-pink-300/20 text-center font-mono leading-relaxed">
                      {lang === "RU" ? "Оплата криптовалютой (USDC). После оплаты продукт будет доставлен на указанный email." : lang === "UA" ? "Оплата криптовалютою (USDC). Після оплати продукт буде доставлений на вказаний email." : "Payment via crypto (USDC). Product will be delivered to your email after payment."}
                    </p>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
