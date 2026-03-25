"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { blogPosts } from "../../lib/blog-data";
import { getBlogTranslation } from "../../lib/blog-translations";
import { i18n } from "../../lib/i18n";
import { useLang } from "../../lib/lang-context";
import LangSwitcher from "../../components/LangSwitcher";

const fade = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true as const } };

export default function BlogPage() {
  const { lang } = useLang();
  const t = i18n[lang].pages;

  return (
    <div className="relative min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob absolute top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-pink-600/80" />
        <div className="blob blob-2 absolute bottom-[10%] left-[-15%] w-[400px] h-[400px] rounded-full bg-purple-600/70" />
      </div>
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-20">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-xs font-mono transition-colors" style={{ color: "var(--muted)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--muted)")}
          >
            <span style={{ color: "var(--accent2)", opacity: 0.6 }}>&larr;</span> {t.backHome}
          </Link>
          <LangSwitcher />
        </div>

        <motion.div {...fade}>
          <p className="section-label-term">{t.blog.label}</p>
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            <span className="gradient-text">{t.blog.title}</span>
          </h1>
          <p className="text-base sm:text-lg mb-12" style={{ color: "var(--muted)" }}>{t.blog.subtitle}</p>
        </motion.div>

        <div className="space-y-4">
          {blogPosts.map((post, i) => {
            const tr = getBlogTranslation(post.slug, lang);
            return (
            <motion.div key={post.slug} {...fade} transition={{ delay: i * 0.1 }}>
              <Link href={`/blog/${post.slug}`}>
                <div className="rounded-lg overflow-hidden transition-all group cursor-pointer"
                  style={{ border: "1px solid var(--glass-border)" }}>
                  {/* Terminal header */}
                  <div className="terminal-card-header">
                    <span className="term-dot term-dot-r" />
                    <span className="term-dot term-dot-y" />
                    <span className="term-dot term-dot-g" />
                    <span className="term-filename">{post.slug}.md</span>
                    <span className="ml-auto text-[10px] font-mono" style={{ color: "var(--muted)" }}>{post.readTime}</span>
                  </div>
                  <div className="p-6 sm:p-8" style={{ background: "var(--glass-bg)" }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="term-tag term-tag-cat">{post.category}</span>
                      <span className="text-[10px] font-mono" style={{ color: "rgba(240,224,255,0.2)" }}>{post.date}</span>
                    </div>
                    <h2 className="text-lg font-semibold transition-colors mb-2" style={{ color: "rgba(240,224,255,0.75)" }}>
                      {tr?.title ?? post.title}
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(240,224,255,0.3)" }}>{tr?.excerpt ?? post.excerpt}</p>
                    <span className="text-xs font-mono mt-3 inline-block transition-colors" style={{ color: "rgba(244,63,160,0.5)" }}>
                      {t.blog.readMore} →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
