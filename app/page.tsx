"use client";

import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import Link from "next/link";
import { i18n, langs, type Lang } from "../lib/i18n";
import { productsData, type ProductData } from "../lib/products-data";
import { blogPosts } from "../lib/blog-data";
import { getBlogTranslation } from "../lib/blog-translations";
import { useLang } from "../lib/lang-context";

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */

const allCategories = ["All", ...Array.from(new Set(productsData.map((p) => p.category)))];




const navLinks = [
  { href: "#projects", label: "Projects" },
  { href: "#blog", label: "Blog" },
];


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
  const [cat, setCat] = useState("All");
  const [showAllProjects, setShowAllProjects] = useState(false);
  const { lang, setLang } = useLang();
  const t = i18n[lang];

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

  const allFiltered = cat === "All" ? productsData : productsData.filter((p) => p.category === cat);
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


      {/* ─── PRODUCTS ─── */}
      <section id="projects" className="relative z-10 py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fade}>
            <p className="section-label-term">{t.projectsSection.label}</p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 tracking-tight"><span className="gradient-text">{t.projectsSection.title}</span></h2>
          </motion.div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {allCategories.map((c) => (
              <button key={c} onClick={() => { setCat(c); setShowAllProjects(false); }}
                className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider border transition-all ${
                  cat === c
                    ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--glass-bg)]"
                    : "border-[var(--glass-border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
              >{c}</button>
            ))}
          </div>

          {/* Product count */}
          <p className="text-xs font-mono mb-6" style={{ color: "var(--muted)" }}>// {allFiltered.length} {t.projectsSection.shown}</p>

          {/* Compact product grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="rounded-lg overflow-hidden group transition-all"
                  style={{ border: "1px solid var(--glass-border)" }}
                >
                  {/* Terminal window header */}
                  <div className="terminal-card-header group-hover:border-b-[var(--glass-border-hover)]">
                    <span className="term-dot term-dot-r" />
                    <span className="term-dot term-dot-y" />
                    <span className="term-dot term-dot-g" />
                    <span className="term-filename">
                      {p.id}.py
                    </span>
                    {p.available && <span className="term-tag term-tag-live ml-auto">{t.projectUI.live}</span>}
                  </div>

                  <div className="p-5 sm:p-6" style={{ background: "var(--glass-bg)" }}>
                    <div className="mb-2">
                      <h3 className="text-lg font-bold transition-colors" style={{ color: "rgba(240,224,255,0.8)" }}>{p.name}</h3>
                      <p className="text-xs font-mono mt-0.5" style={{ color: "var(--accent)", opacity: 0.7 }}>{p.tagline}</p>
                    </div>

                    <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: "rgba(240,224,255,0.3)" }}>{p.description}</p>

                    {/* Category tag */}
                    <div className="mb-4">
                      <span className="term-tag term-tag-cat">{p.category}</span>
                    </div>

                    {/* Price + Details CTA */}
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <span className="text-base font-bold font-mono" style={{ color: "var(--accent)" }}>
                          {p.pricing.setup ? `$${p.pricing.code}` : `$${p.pricing.code}`}
                        </span>
                        {p.pricing.setup && (
                          <p className="text-[9px] font-mono mt-0.5" style={{ color: "var(--cyan)", opacity: 0.6 }}>
                            {lang === "RU" ? "от" : lang === "UA" ? "від" : "from"} · {lang === "RU" ? "интеграция" : lang === "UA" ? "інтеграція" : "setup"} ${p.pricing.setup}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/products/${p.id}`}
                        className="btn-buy"
                      >
                        ./details →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
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

      {/* ChatbotWidget is now global — rendered in layout.tsx */}
    </div>
  );
}
