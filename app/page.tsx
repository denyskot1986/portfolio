"use client";

import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useInView } from "framer-motion";
import Link from "next/link";
import { i18n, langs, type Lang } from "../lib/i18n";
import { projectI18n } from "../lib/project-i18n";
import { blogPosts } from "../lib/blog-data";
import { getBlogTranslation } from "../lib/blog-translations";
import { useLang } from "../lib/lang-context";

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */

type Category = "All" | "Multi-Agent" | "Voice AI" | "Automation" | "Bots" | "RAG";

const projects = [
  { id: "03", title: "SKYNET Intake", subtitle: "AI Task Assistant", category: "Bots" as Category, status: "live", price: "$99", priceNote: "AI task routing", description: "", stack: ["aiogram", "AI Model", "Whisper", "Todoist API"], highlights: ["Voice input via Whisper STT", "AI task structuring & routing", "Auto-prioritization", "Todoist integration"], metrics: "Voice + text · auto-route", color: "from-fuchsia-500/25 to-pink-500/15", accent: "border-fuchsia-500/40", glow: "rgba(232, 121, 249, 0.3)" },
];

const categories: Category[] = ["All", "Multi-Agent", "Voice AI", "Bots", "Automation", "RAG"];

const productSlugMap: Record<string, string> = {
  "SKYNET Intake": "skynet-intake",
};
const botBuyLink = (title: string) => `https://t.me/shop_by_finekot_bot?start=buy_${productSlugMap[title] || title.toLowerCase().replace(/\s+/g, "-")}`;



const navLinks = [
  { href: "#projects", label: "Projects" },
  { href: "#blog", label: "Blog" },
];

function PricingBlock({ codePrice, setupPrice, ctaTemplate, ctaIntegration, t, onBuy }: { codePrice: number; setupPrice?: number; ctaTemplate: string; ctaIntegration: string; t: any; onBuy?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
      className="mt-12 mb-6">
      {setupPrice ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-xl p-6 sm:p-8 text-center">
            <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-3">Source Code</p>
            <p className="text-3xl sm:text-4xl font-black gradient-text font-mono mb-2">${codePrice}</p>
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
            <p className="text-3xl sm:text-4xl font-black gradient-text font-mono mb-2">${setupPrice}</p>
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
            <p className="text-3xl sm:text-4xl font-black gradient-text font-mono mb-2">${codePrice}</p>
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
   THEME TOGGLE
   ═══════════════════════════════════════════════════════ */



/* ═══════════════════════════════════════════════════════
   BLOG CARDS SECTION (5 articles)
   ═══════════════════════════════════════════════════════ */

function BlogCardsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const { lang } = useLang();
  const t = i18n[lang].pages.blog;
  const posts = blogPosts.slice(0, 5);

  if (posts.length === 0) return null;

  const feat = getBlogTranslation(posts[0].slug, lang);

  return (
    <section className="relative z-10 py-16 sm:py-20 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="section-label-term">{t.label}</p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            <span className="gradient-text">{t.title}</span>
          </h2>
          <p className="text-base" style={{ color: "var(--muted)" }}>{t.subtitle}</p>
        </motion.div>

        {/* Featured post (first) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <Link href={`/blog/${posts[0].slug}`} className="block rounded-lg overflow-hidden transition-all group" style={{ border: "1px solid var(--glass-border)" }}>
            {/* Terminal header */}
            <div className="terminal-card-header">
              <span className="term-dot term-dot-r" />
              <span className="term-dot term-dot-y" />
              <span className="term-dot term-dot-g" />
              <span className="term-filename">{posts[0].slug}.md — {posts[0].readTime}</span>
            </div>
            <div className="p-6 sm:p-8" style={{ background: "var(--glass-bg)" }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="term-tag term-tag-cat">{posts[0].category}</span>
                <span className="text-[10px] font-mono" style={{ color: "rgba(240,224,255,0.2)" }}>{posts[0].date}</span>
              </div>
              <h3 className="text-lg font-semibold transition-colors mb-2 leading-tight" style={{ color: "rgba(240,224,255,0.75)" }}>
                {feat?.title ?? posts[0].title}
              </h3>
              <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "rgba(240,224,255,0.3)" }}>{feat?.excerpt ?? posts[0].excerpt}</p>
              <span className="text-xs font-mono mt-3 inline-block transition-colors" style={{ color: "rgba(244,63,160,0.5)" }}>
                {t.readMore} →
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Grid of 4 more posts */}
        {posts.length > 1 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {posts.slice(1).map((post, i) => {
            const tr = getBlogTranslation(post.slug, lang);
            return (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: (i + 1) * 0.1, duration: 0.5 }}
            >
              <Link href={`/blog/${post.slug}`} className="block rounded-lg overflow-hidden transition-all group h-full" style={{ border: "1px solid var(--glass-border)" }}>
                <div className="terminal-card-header">
                  <span className="term-dot term-dot-r" />
                  <span className="term-dot term-dot-y" />
                  <span className="term-dot term-dot-g" />
                  <span className="term-filename">{post.readTime}</span>
                </div>
                <div className="p-5" style={{ background: "var(--glass-bg)" }}>
                  <span className="term-tag term-tag-cat">{post.category}</span>
                  <h3 className="text-base font-semibold transition-colors mt-3 mb-2 leading-tight" style={{ color: "rgba(240,224,255,0.65)" }}>
                    {tr?.title ?? post.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed mb-3 line-clamp-3" style={{ color: "rgba(240,224,255,0.25)" }}>{tr?.excerpt ?? post.excerpt}</p>
                  <div className="text-[10px] font-mono" style={{ color: "rgba(244,63,160,0.4)" }}>
                    {post.date}
                  </div>
                </div>
              </Link>
            </motion.div>
            );
          })}
        </div>}

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <Link href="/blog" className="btn-terminal-ghost text-sm">
            {t.allArticles} →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   CONTACT FORM SECTION
   ═══════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════
   CHATBOT WIDGET
   ═══════════════════════════════════════════════════════ */

/* ChatbotWidget moved to components/ChatbotWidget.tsx — rendered globally in layout.tsx */

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

const fade = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true as const } };

export default function Home() {
  const [cat, setCat] = useState<Category>("All");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const { lang, setLang } = useLang();

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
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Background — subtle glow orbs for terminal depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob absolute top-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full bg-pink-600/80" />
        <div className="blob blob-2 absolute bottom-[10%] left-[-15%] w-[500px] h-[500px] rounded-full bg-purple-600/70" />
      </div>
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      <ScrollProgress />

      {/* ─── NAV (from 3000 — hamburger, active section, scroll-aware) ─── */}
      <motion.nav
        initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || menuOpen
            ? "bg-[var(--bg)]/92 border-b border-[var(--glass-border)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo — terminal prompt style */}
          <a href="#hero" className="text-base font-bold tracking-tight font-mono" style={{ color: "var(--accent)" }}>
            <span style={{ color: "var(--accent2)", opacity: 0.7 }}>&gt; </span>&lt;FK/&gt;
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const id = link.href.slice(1);
              const isActive = activeSection === id;
              const label = t.nav[id as keyof typeof t.nav] || link.label;
              return (
                <a key={link.href} href={link.href}
                  className={`px-3 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all ${
                    isActive
                      ? "text-[var(--accent)] bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                      : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--glass-bg)]"
                  }`}
                >
                  <span style={{ color: "var(--accent2)", opacity: 0.5 }}>./</span>{label}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {/* Hamburger — terminal style */}
            <button onClick={() => setMenuOpen((v) => !v)} className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-md border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] transition-colors" aria-label="Menu">
              <motion.span animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="w-5 h-px block" style={{ background: "var(--accent)" }} />
              <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-5 h-px block" style={{ background: "var(--accent)" }} />
              <motion.span animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="w-5 h-px block" style={{ background: "var(--accent)" }} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden overflow-hidden border-t border-[var(--glass-border)]">
              <div className="px-6 py-4 flex flex-col gap-1">
                {navLinks.map((link) => {
                  const id = link.href.slice(1);
                  const label = t.nav[id as keyof typeof t.nav] || link.label;
                  return (
                    <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                      className={`px-4 py-3 rounded-md text-sm font-mono uppercase tracking-wider transition-all ${
                        activeSection === id
                          ? "text-[var(--accent)] bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                          : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--glass-bg)]"
                      }`}
                    >
                      <span style={{ color: "var(--accent2)", opacity: 0.5 }}>./</span>{label}
                    </a>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ─── HERO ─── */}
      <section id="hero" className="relative z-10 min-h-[85vh] flex items-center justify-center dot-grid overflow-hidden pt-16">
        <div className="relative z-10 text-center px-6 max-w-4xl">
          {/* Terminal system header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-4 mb-8 font-mono text-xs"
            style={{ color: "var(--muted)" }}
          >
            <span style={{ color: "var(--accent2)" }}>FINEKOT.AI</span>
            <span>v3.0.0</span>
            <span>—</span>
            <span style={{ color: "var(--accent)" }}>{t.heroSubtitle}</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: "var(--cyan)", boxShadow: "0 0 6px var(--cyan)" }} />
              <span style={{ color: "var(--cyan)" }}>LIVE</span>
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-7xl font-bold mb-2 tracking-tight">
            Fine<span className="gradient-text">kot</span> Systems
          </motion.h1>

          {/* Typewriter with terminal prompt */}
          <div className="flex items-center justify-center h-[48px] mb-8 overflow-hidden">
            <p className="text-sm sm:text-base md:text-lg font-mono tracking-wide" style={{ color: "rgba(240,224,255,0.45)" }}>
              <span style={{ color: "var(--accent2)", opacity: 0.65 }}>&gt; </span>
              {displayText}
              <span className="cursor-blink" style={{ color: "var(--accent)" }}>█</span>
            </p>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a href="#projects" className="btn-terminal">
              {t.cta.viewProducts}
            </a>
            <a href="/blog" className="btn-terminal-ghost">
              {lang === "RU" ? "Блог соло-разработчика" : lang === "UA" ? "Блог соло-розробника" : "Solo Developer Blog"} →
            </a>
          </motion.div>

          {/* Language switcher */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-2 mt-10">
            {langs.map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
                  lang === l
                    ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--glass-bg)] shadow-[0_0_16px_rgba(244,63,160,0.2)]"
                    : "border-[var(--glass-border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
              >{l}</button>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <motion.p
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[10px] uppercase tracking-[0.3em] font-mono"
            style={{ color: "rgba(244,63,160,0.4)" }}
          >
            scroll
          </motion.p>
          <div className="w-5 h-8 border border-[var(--glass-border)] rounded-sm flex justify-center pt-1.5">
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1 rounded-none" style={{ background: "var(--accent)" }} />
          </div>
        </motion.div>
      </section>


      {/* ─── PROJECTS ─── */}
      <section id="projects" className="relative z-10 py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fade}>
            <p className="section-label-term">{t.projectsSection.label}</p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 tracking-tight"><span className="gradient-text">{t.projectsSection.title}</span></h2>
          </motion.div>


          {/* Project count */}
          <p className="text-xs font-mono mb-6" style={{ color: "var(--muted)" }}>// {allFiltered.length} {t.projectsSection.shown}</p>

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
                    className={`rounded-lg overflow-hidden cursor-pointer group transition-all ${
                      isExpanded ? "md:col-span-2 lg:col-span-2" : ""
                    }`}
                    style={{
                      border: `1px solid ${isExpanded ? "rgba(244,63,160,0.35)" : "var(--glass-border)"}`,
                      boxShadow: isExpanded ? `0 0 40px ${p.glow}` : "none",
                    }}
                  >
                    {/* Terminal window header */}
                    <div className="terminal-card-header group-hover:border-b-[var(--glass-border-hover)]">
                      <span className="term-dot term-dot-r" />
                      <span className="term-dot term-dot-y" />
                      <span className="term-dot term-dot-g" />
                      <span className="term-filename">
                        #{p.id} · {p.title.toLowerCase().replace(/\s+/g, '-')}.py
                      </span>
                      <span className="term-tag term-tag-live ml-auto">{t.projectUI.live}</span>
                    </div>

                    <div className="p-5 sm:p-6" style={{ background: "var(--glass-bg)" }}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold transition-colors" style={{ color: "rgba(240,224,255,0.8)" }}>{p.title}</h3>
                          <p className="text-xs font-mono mt-0.5" style={{ color: "var(--accent)", opacity: 0.7 }}>{pData?.subtitle || p.subtitle}</p>
                        </div>
                        <span className={`font-mono transition-transform text-lg leading-none mt-0.5 ${isExpanded ? "rotate-45" : ""}`} style={{ color: "var(--muted)" }}>+</span>
                      </div>

                      <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(240,224,255,0.3)" }}>{pData?.description || p.description}</p>

                      {/* Price + metrics + CTA */}
                      <div className="flex flex-wrap items-end justify-between gap-2 mt-2">
                        <div>
                          {p.price ? (
                            <>
                              <span className="text-base font-bold font-mono" style={{ color: "var(--accent)" }}>{p.price}</span>
                              <p className="text-[9px] font-mono mt-0.5" style={{ color: "var(--cyan)", opacity: 0.6 }}>{p.priceNote}</p>
                            </>
                          ) : (
                            <span className="text-[10px] font-mono" style={{ color: "var(--muted)" }}>{p.metrics}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {p.price && <p className="text-[10px] font-mono hidden sm:block" style={{ color: "var(--muted)" }}>{p.metrics}</p>}
                          {p.status === "wip" ? (
                            <span className="px-3 py-1.5 rounded-md border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                              style={{ borderColor: "var(--glass-border)", color: "var(--muted)" }}>
                              Testing...
                            </span>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpanded(i); }}
                              className="btn-buy"
                            >
                              ./details →
                            </button>
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--glass-border)" }}>
                              <p className="section-label-term text-[10px] mb-2">{t.projectUI.keyFeatures}</p>
                              <ul className="space-y-1.5 mb-4">
                                {(pData?.highlights || p.highlights).map((h: string) => (
                                  <li key={h} className="flex gap-2 text-xs" style={{ color: "rgba(240,224,255,0.4)" }}>
                                    <span style={{ color: "var(--accent)", opacity: 0.7 }}>→</span> {h}
                                  </li>
                                ))}
                              </ul>

                              {/* Tech stack */}
                              <p className="section-label-term text-[10px] mb-2">
                                {lang === "RU" ? "Стек технологий" : lang === "UA" ? "Стек технологій" : "Tech Stack"}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {p.stack.map((s) => (
                                  <span key={s} className="text-[10px] px-2 py-1 rounded-md font-mono"
                                    style={{ background: "rgba(191,90,242,0.06)", border: "1px solid rgba(191,90,242,0.2)", color: "var(--accent2)" }}>
                                    {s}
                                  </span>
                                ))}
                              </div>

                              {/* What you get */}
                              <div className="rounded-lg p-4 mb-4" style={{ background: "rgba(244,63,160,0.02)", border: "1px solid var(--glass-border)" }}>
                                <p className="section-label-term text-[10px] mb-2">
                                  {lang === "RU" ? "Что вы получаете" : lang === "UA" ? "Що ви отримуєте" : "What you get"}
                                </p>
                                <ul className="space-y-1">
                                  <li className="flex gap-2 text-xs" style={{ color: "rgba(240,224,255,0.4)" }}><span style={{ color: "var(--cyan)" }}>✓</span> {lang === "RU" ? "Полный исходный код" : lang === "UA" ? "Повний вихідний код" : "Full source code"}</li>
                                  <li className="flex gap-2 text-xs" style={{ color: "rgba(240,224,255,0.4)" }}><span style={{ color: "var(--cyan)" }}>✓</span> {lang === "RU" ? "Документация + инструкция по установке" : lang === "UA" ? "Документація + інструкція з встановлення" : "Documentation + setup guide"}</li>
                                  <li className="flex gap-2 text-xs" style={{ color: "rgba(240,224,255,0.4)" }}><span style={{ color: "var(--cyan)" }}>✓</span> {lang === "RU" ? "Без подписок — навсегда ваш" : lang === "UA" ? "Без підписок — назавжди ваш" : "No subscriptions — yours forever"}</li>
                                  <li className="flex gap-2 text-xs" style={{ color: "rgba(240,224,255,0.4)" }}><span style={{ color: "var(--cyan)" }}>✓</span> {lang === "RU" ? "Доставка на email после оплаты" : lang === "UA" ? "Доставка на email після оплати" : "Delivered to your email after payment"}</li>
                                </ul>
                              </div>

                              {p.status === "live" ? (
                                <a
                                  href={botBuyLink(p.title)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="btn-buy block w-full text-center text-sm py-3"
                                >
                                  ./get {p.title} — {p.price} →
                                </a>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); openCheckout(p); }}
                                  className="btn-buy block w-full text-center text-sm py-3"
                                >
                                  ./get {p.title} — {p.price} →
                                </button>
                              )}
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
                className="btn-terminal-ghost text-sm"
              >
                {t.projectsSection.showMore} (+{allFiltered.length - 6})
              </button>
            </motion.div>
          )}
          {showAllProjects && allFiltered.length > 6 && (
            <motion.div {...fade} className="text-center mt-8">
              <button
                onClick={() => setShowAllProjects(false)}
                className="btn-terminal-ghost text-xs"
              >
                ↑ {t.projectsSection.showLess}
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── AI BLOG ─── */}
      <section id="blog">
        <BlogCardsSection />
      </section>

      <footer className="relative z-10 py-8 font-mono" style={{ borderTop: "1px solid var(--glass-border)" }}>
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-4">
          <p className="text-[10px] font-mono mb-1" style={{ color: "var(--muted)" }}>
            <span style={{ color: "var(--accent2)", opacity: 0.6 }}>&gt; </span>connect --channels
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "https://instagram.com/finekot.ai", label: "Instagram — @finekot.ai" },
              { href: "https://t.me/finekot_ai", label: "Telegram EN — @finekot_ai" },
              { href: "https://t.me/finekot_ai_ua", label: "Telegram UA — @finekot_ai_ua" },
              { href: "https://t.me/finekot_ai_ru", label: "Telegram RU — @finekot_ai_ru" },
            ].map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                className="text-xs px-3 py-2 rounded-md transition-all font-mono hover:text-[var(--accent)] hover:border-[var(--glass-border-hover)]"
                style={{ border: "1px solid var(--glass-border)", color: "var(--muted)" }}
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(106,85,128,0.5)" }}>{t.footer}</p>
        </div>
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
              className="relative w-full max-w-md rounded-lg overflow-hidden"
              style={{ border: "1px solid var(--glass-border)", boxShadow: "0 0 80px rgba(244,63,160,0.15)", background: "var(--bg2)" }}
            >
              {/* Terminal header */}
              <div className="terminal-card-header">
                <span className="term-dot term-dot-r" />
                <span className="term-dot term-dot-y" />
                <span className="term-dot term-dot-g" />
                <span className="term-filename">checkout.py</span>
                <button onClick={() => setCheckoutProduct(null)} className="ml-auto text-sm transition-colors" style={{ color: "var(--muted)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--accent)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--muted)")}
                >×</button>
              </div>

              <div className="p-6 sm:p-8">
              {checkoutSubmitted ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✓</div>
                  <p className="font-semibold mb-2" style={{ color: "rgba(240,224,255,0.75)" }}>
                    {lang === "RU" ? "Продукт в стадии закрытого тестирования" : lang === "UA" ? "Продукт на стадії закритого тестування" : "Product is in closed beta testing"}
                  </p>
                  <p className="text-xs font-mono leading-relaxed mt-3" style={{ color: "var(--muted)" }}>
                    {lang === "RU" ? "Мы сохранили ваш email. Вам придёт письмо, как только тестирование завершится и продукт будет доступен." : lang === "UA" ? "Ми зберегли ваш email. Вам прийде лист, щойно тестування завершиться і продукт буде доступний." : "We saved your email. You'll receive a notification once testing is complete and the product is available."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="section-label-term text-[10px] mb-1">
                      {lang === "RU" ? "Оформление" : lang === "UA" ? "Оформлення" : "Checkout"}
                    </p>
                    <h3 className="text-xl font-bold" style={{ color: "rgba(240,224,255,0.85)" }}>{checkoutProduct.title}</h3>
                    <p className="text-xs font-mono mt-0.5" style={{ color: "var(--accent)", opacity: 0.65 }}>{checkoutProduct.subtitle}</p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-mono" style={{ color: "var(--accent)" }}>{checkoutProduct.price}</span>
                      <span className="text-[10px] font-mono" style={{ color: "var(--muted)" }}>{checkoutProduct.priceNote}</span>
                    </div>
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-mono mb-1.5" style={{ color: "var(--muted)" }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={checkoutEmail}
                        onChange={(e) => setCheckoutEmail(e.target.value)}
                        placeholder={lang === "RU" ? "Куда отправить продукт" : lang === "UA" ? "Куди надіслати продукт" : "Where to deliver the product"}
                        className="term-input w-full px-4 py-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-mono mb-1.5" style={{ color: "var(--muted)" }}>
                        {lang === "RU" ? "Имя (опционально)" : lang === "UA" ? "Ім'я (опціонально)" : "Name (optional)"}
                      </label>
                      <input
                        type="text"
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        placeholder={lang === "RU" ? "Ваше имя" : lang === "UA" ? "Ваше ім'я" : "Your name"}
                        className="term-input w-full px-4 py-3 text-sm"
                      />
                    </div>
                    <button type="submit" className="btn-buy w-full justify-center py-3.5 text-sm">
                      {lang === "RU" ? "Записаться в лист ожидания →" : lang === "UA" ? "Записатися в лист очікування →" : "Join the waitlist →"}
                    </button>
                    <p className="text-[9px] text-center font-mono leading-relaxed" style={{ color: "rgba(106,85,128,0.6)" }}>
                      {lang === "RU" ? "Продукт в закрытом тестировании. Оставьте email — мы напишем, когда будет готово." : lang === "UA" ? "Продукт у закритому тестуванні. Залиште email — ми напишемо, коли буде готово." : "Product is in closed beta. Leave your email — we'll notify you when it's ready."}
                    </p>
                  </form>
                </>
              )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ChatbotWidget is now global — rendered in layout.tsx */}
    </div>
  );
}
