"use client";

import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import Link from "next/link";
import { i18n, langs, type Lang } from "../lib/i18n";
import { getTranslatedProducts } from "../lib/products-data";
import { useLang } from "../lib/lang-context";

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */





// Nav trimmed to logo-only — the chat bar now drives product discovery.
const navLinks: { href: string; label: string }[] = [];


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
  const { lang, setLang } = useLang();
  const t = i18n[lang];

  // Single-line typewriter effect
  const [displayText, setDisplayText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const phrases = t.roles;
    const current = phrases[phraseIdx % phrases.length];
    const typeSpeed = isDeleting ? 12 : 25;
    const pauseAfterType = 7500;
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
        style={{ top: "var(--chat-top-h, 34px)" }}
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || menuOpen
            ? "bg-[var(--bg)]/92 border-b border-[var(--glass-border)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3 sm:gap-5 min-w-0">
          {/* Logo — terminal prompt style. Click focuses the chat input. */}
          <button
            type="button"
            onClick={() => {
              const el = document.querySelector<HTMLTextAreaElement>("[data-chat-input]");
              if (el) { el.focus(); el.scrollIntoView({ block: "nearest" }); }
            }}
            className="shrink-0 text-base font-bold tracking-tight font-mono cursor-pointer bg-transparent border-0 p-0"
            style={{ color: "var(--accent)" }}
            aria-label="Open chat"
          >
            <span style={{ color: "var(--accent2)", opacity: 0.7 }}>&gt; </span>AGENT_CONTROL /&gt;
          </button>

          {/* Brand typewriter — rotates the hero roles so the nav reads as a live agent prompt */}
          <p
            className="flex-1 min-w-0 truncate text-xs sm:text-sm font-mono tracking-wide"
            style={{ color: "rgba(240,224,255,0.45)" }}
            aria-live="polite"
          >
            <span style={{ color: "var(--accent2)", opacity: 0.6 }}>&gt; </span>
            {displayText}
          </p>

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

          {navLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {/* Hamburger — terminal style */}
              <button onClick={() => setMenuOpen((v) => !v)} className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-md border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] transition-colors" aria-label="Menu">
                <motion.span animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="w-5 h-px block" style={{ background: "var(--accent)" }} />
                <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-5 h-px block" style={{ background: "var(--accent)" }} />
                <motion.span animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="w-5 h-px block" style={{ background: "var(--accent)" }} />
              </button>
            </div>
          )}
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
      <section id="hero" className="relative z-10 min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
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

          <div className="mb-8" />

          {/* Lineup inventory — terminal badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-6 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em]"
            style={{ color: "var(--muted)" }}
          >
            <span>
              <span style={{ color: "var(--accent)" }}>07</span>
              <span className="ml-1">{lang === "RU" ? "агентов" : lang === "UA" ? "агентів" : "agents"}</span>
              <span className="mx-1 opacity-40">·</span>
              <span>{lang === "RU" ? "подписка" : lang === "UA" ? "підписка" : "subscription"}</span>
            </span>
            <span className="opacity-30">+</span>
            <span>
              <span style={{ color: "var(--accent2)" }}>01</span>
              <span className="ml-1">{lang === "RU" ? "система" : lang === "UA" ? "система" : "system"}</span>
              <span className="mx-1 opacity-40">·</span>
              <span>{lang === "RU" ? "код твой" : lang === "UA" ? "код твій" : "own the code"}</span>
            </span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center sm:items-stretch">
            <a href="#projects" className="btn-terminal">
              <span className="flex flex-col items-start leading-tight text-left">
                <span>{t.cta.viewProducts}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 400,
                    opacity: 0.6,
                    letterSpacing: "0.02em",
                    textTransform: "none",
                    marginTop: 2,
                    textShadow: "none",
                  }}
                >
                  {t.cta.viewProductsSub}
                </span>
              </span>
            </a>
            <Link href="/discover" className="btn-terminal">
              <span className="flex flex-col items-start leading-tight text-left">
                <span>{t.cta.discoverScan}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 400,
                    opacity: 0.6,
                    letterSpacing: "0.02em",
                    textTransform: "none",
                    marginTop: 2,
                    textShadow: "none",
                  }}
                >
                  {t.cta.discoverScanSub}
                </span>
              </span>
            </Link>
            <Link href="/genesis" className="btn-terminal">
              <span className="flex flex-col items-start leading-tight text-left">
                <span>
                  {lang === "RU"
                    ? "GENESIS · посмотреть как родилось"
                    : lang === "UA"
                    ? "GENESIS · подивитись як народилося"
                    : "GENESIS · watch how it was born"}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 400,
                    opacity: 0.6,
                    letterSpacing: "0.02em",
                    textTransform: "none",
                    marginTop: 2,
                    textShadow: "none",
                  }}
                >
                  {lang === "RU"
                    ? "кинематографичное демо как появилась система"
                    : lang === "UA"
                    ? "кінематографічне демо як з'явилася система"
                    : "cinematic demo of how the system came to life"}
                </span>
              </span>
            </Link>
          </motion.div>

        </div>

        {/* Language switcher — pinned to the bottom of the hero (where the scroll indicator used to sit) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2">
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
      </section>


      {/* ─── PRODUCTS ─── */}
      {(() => {
        const allProducts = getTranslatedProducts(lang);
        const agents = allProducts.filter((p) => p.pricing.subscription);
        const systems = allProducts.filter((p) => !p.pricing.subscription);

        const subLabels = {
          EN: { agents: "// agents — subscription", systems: "// systems — one-time purchase" },
          RU: { agents: "// агенты — по подписке", systems: "// системы — разовая покупка" },
          UA: { agents: "// агенти — за підпискою", systems: "// системи — разова покупка" },
        }[lang];

        const renderCard = (p: (typeof allProducts)[number], i: number) => (
          <motion.div
            key={p.id}
            id={`product-${p.id}`}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="rounded-lg overflow-hidden group transition-all scroll-mt-24"
            style={{ border: "1px solid var(--glass-border)" }}
          >
            {/* Terminal window header */}
            <div className="terminal-card-header group-hover:border-b-[var(--glass-border-hover)]">
              <span className="term-dot term-dot-r" />
              <span className="term-dot term-dot-y" />
              <span className="term-dot term-dot-g" />
              <span className="term-filename">
                {p.id}{p.pricing.subscription ? ".agent" : ".py"}
              </span>
              {p.available && (
                <span
                  className="term-tag term-tag-live ml-auto"
                  style={p.pricing.subscription ? { background: "rgba(34, 211, 238, 0.12)", color: "var(--cyan)", borderColor: "rgba(34, 211, 238, 0.3)" } : undefined}
                >
                  {p.pricing.subscription
                    ? (lang === "RU" ? "ПОДПИСКА" : lang === "UA" ? "ПІДПИСКА" : "SUBSCRIPTION")
                    : t.projectUI.live}
                </span>
              )}
            </div>

            <div className="p-5 sm:p-6" style={{ background: "var(--glass-bg)" }}>
              <div className="flex items-start gap-3 mb-2">
                {p.avatarEmoji && (
                  <div
                    className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ background: "rgba(244,63,160,0.08)", border: "1px solid var(--glass-border)", boxShadow: "0 0 20px rgba(244,63,160,0.15)" }}
                  >
                    {p.avatarEmoji}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-lg font-bold transition-colors truncate" style={{ color: "rgba(240,224,255,0.8)" }}>{p.name}</h3>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "var(--accent)", opacity: 0.7 }}>{p.tagline}</p>
                </div>
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
                    ${p.pricing.subscription ? p.pricing.subscription.monthly : p.pricing.code}
                  </span>
                  {p.pricing.subscription ? (
                    <span className="text-[10px] font-mono ml-1" style={{ color: "var(--accent)", opacity: 0.6 }}>
                      /{lang === "RU" ? "мес" : lang === "UA" ? "міс" : "mo"}
                    </span>
                  ) : null}
                  {p.pricing.setup && (
                    <p className="text-[9px] font-mono mt-0.5" style={{ color: "var(--cyan)", opacity: 0.6 }}>
                      {lang === "RU" ? "от" : lang === "UA" ? "від" : "from"} · {lang === "RU" ? "интеграция" : lang === "UA" ? "інтеграція" : "setup"} ${p.pricing.setup}
                    </p>
                  )}
                </div>
                <Link href={`/products/${p.id}`} className="btn-buy">
                  ./details →
                </Link>
              </div>
            </div>
          </motion.div>
        );

        return (
          <section id="projects" className="relative z-10 py-20 sm:py-28 px-6">
            <div className="max-w-6xl mx-auto">
              <motion.div {...fade}>
                <p className="section-label-term">{t.projectsSection.label}</p>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 tracking-tight"><span className="gradient-text">{t.projectsSection.title}</span></h2>
              </motion.div>

              {/* ─── Agents (subscription) ─── */}
              {agents.length > 0 && (
                <div className="mt-12">
                  <motion.div {...fade} className="mb-5 flex items-center gap-3">
                    <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--accent)" }}>
                      {subLabels.agents}
                    </span>
                    <span className="flex-1 h-px" style={{ background: "linear-gradient(90deg, var(--glass-border), transparent)" }} />
                    <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>
                      {agents.length.toString().padStart(2, "0")}
                    </span>
                  </motion.div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                      {agents.map(renderCard)}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* ─── Systems (one-time) ─── */}
              {systems.length > 0 && (
                <div className="mt-16">
                  <motion.div {...fade} className="mb-5 flex items-center gap-3">
                    <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--accent2)" }}>
                      {subLabels.systems}
                    </span>
                    <span className="flex-1 h-px" style={{ background: "linear-gradient(90deg, var(--glass-border), transparent)" }} />
                    <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>
                      {systems.length.toString().padStart(2, "0")}
                    </span>
                  </motion.div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                      {systems.map(renderCard)}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })()}

      <footer className="relative z-10 py-8 font-mono" style={{ borderTop: "1px solid var(--glass-border)" }}>
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-4">
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(106,85,128,0.5)" }}>
            {(() => {
              const parts = t.footer.split("Denys Kot");
              return (
                <>
                  {parts[0]}
                  <a
                    href="https://t.me/finekot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[var(--accent)]"
                    style={{ color: "var(--accent)" }}
                  >
                    Denys Kot
                  </a>
                  {parts[1] ?? ""}
                </>
              );
            })()}
          </p>
        </div>
      </footer>

      {/* ChatbotWidget is now global — rendered in layout.tsx */}
    </div>
  );
}
