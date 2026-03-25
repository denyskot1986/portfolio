"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { blogPosts } from "../../../lib/blog-data";
import { getBlogTranslation } from "../../../lib/blog-translations";
import { i18n } from "../../../lib/i18n";
import { useLang } from "../../../lib/lang-context";
import LangSwitcher from "../../../components/LangSwitcher";
import BlogChat from "../../../components/BlogChat";

export default function BlogPostPage() {
  const params = useParams();
  const { lang } = useLang();
  const t = i18n[lang].pages;
  const post = blogPosts.find((p) => p.slug === params.slug);
  const translation = post ? getBlogTranslation(post.slug, lang) : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black gradient-text mb-4">404</h1>
          <p className="text-pink-100/40 mb-6">Post not found</p>
          <Link href="/blog" className="text-pink-400/60 hover:text-pink-400 font-mono text-sm transition-colors">
            &larr; {t.backBlog}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob absolute top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-pink-600/80" />
        <div className="blob blob-2 absolute bottom-[10%] left-[-15%] w-[400px] h-[400px] rounded-full bg-purple-600/70" />
      </div>
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      <article className="relative z-10 max-w-3xl mx-auto px-6 pt-28 pb-48">
        <div className="flex items-center justify-between mb-8">
          <Link href="/blog" className="text-xs font-mono transition-colors" style={{ color: "var(--muted)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--muted)")}
          >
            &larr; {t.backBlog}
          </Link>
          <LangSwitcher />
        </div>

        {lang !== "EN" && !translation && (
          <div className="rounded-lg px-4 py-3 mb-6 text-xs font-mono" style={{ border: "1px solid var(--glass-border)", color: "var(--muted)" }}>
            <span style={{ color: "var(--accent2)", opacity: 0.6 }}>[~] </span>{t.blog.translationSoon}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Article terminal header */}
          <div className="terminal-card-header rounded-lg mb-6">
            <span className="term-dot term-dot-r" />
            <span className="term-dot term-dot-y" />
            <span className="term-dot term-dot-g" />
            <span className="term-filename">{post.slug}.md</span>
            <div className="ml-auto flex items-center gap-3">
              <span className="term-tag term-tag-cat">{post.category}</span>
              <span className="text-[10px] font-mono" style={{ color: "var(--muted)" }}>{post.date}</span>
              <span className="text-[10px] font-mono" style={{ color: "var(--muted)" }}>{post.readTime}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-8 tracking-tight" style={{ color: "rgba(240,224,255,0.92)" }}>
            {translation?.title ?? post.title}
          </h1>

          <div
            className="prose prose-invert max-w-none
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4
              [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-3
              [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-sm
              [&_ul]:space-y-1 [&_li]:text-sm
              [&_a]:underline [&_a]:transition-colors
              [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
              [&_pre]:border [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-6
              [&_pre_code]:bg-transparent [&_pre_code]:p-0
              [&_table]:w-full [&_table]:text-sm [&_table]:my-6
              [&_th]:text-left [&_th]:font-mono [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:pb-2 [&_th]:border-b
              [&_td]:py-2 [&_td]:border-b [&_td]:text-xs
              [&_hr]:my-8
              [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic
              [&_h2]:text-[rgba(240,224,255,0.9)]
              [&_h3]:text-[rgba(240,224,255,0.8)]
              [&_p]:text-[rgba(240,224,255,0.72)]
              [&_li]:text-[rgba(240,224,255,0.72)]
              [&_strong]:text-[rgba(240,224,255,0.92)]
              [&_em]:text-[rgba(240,224,255,0.72)]
              [&_a]:text-[var(--accent)] [&_a]:hover:text-[rgba(244,63,160,0.8)]
              [&_code]:text-[var(--accent2)] [&_code]:bg-[rgba(191,90,242,0.06)] [&_code]:border [&_code]:border-[rgba(191,90,242,0.15)]
              [&_pre]:bg-[rgba(244,63,160,0.02)] [&_pre]:border-[var(--glass-border)]
              [&_th]:text-[rgba(240,224,255,0.8)] [&_th]:border-[var(--glass-border)]
              [&_td]:text-[rgba(240,224,255,0.65)] [&_td]:border-[rgba(244,63,160,0.06)]
              [&_hr]:border-[var(--glass-border)]
              [&_blockquote]:border-[var(--accent)] [&_blockquote]:text-[rgba(240,224,255,0.6)]
            "
            dangerouslySetInnerHTML={{ __html: markdownToHtml(translation?.content ?? post.content) }}
          />

          <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--glass-border)" }}>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-4" style={{ color: "var(--muted)" }}>
              <span style={{ color: "var(--accent2)", opacity: 0.6 }}>&gt; </span>
              {lang === "RU" ? "Подписывайся" : lang === "UA" ? "Підписуйся" : "Follow"}
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { href: "https://instagram.com/finekot.ai", label: "Instagram — @finekot.ai" },
                { href: "https://t.me/finekot_ai", label: "Telegram EN — @finekot_ai" },
                { href: "https://t.me/finekot_ai_ua", label: "Telegram UA — @finekot_ai_ua" },
                { href: "https://t.me/finekot_ai_ru", label: "Telegram RU — @finekot_ai_ru" },
              ].map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-mono transition-all"
                  style={{ border: "1px solid var(--glass-border)", color: "var(--muted)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--glass-border-hover)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--muted)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--glass-border)"; }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </article>

      <div className="fixed bottom-0 left-0 right-0 z-50" style={{ willChange: "transform", transform: "translateZ(0)" }}>
        <div className="max-w-3xl mx-auto px-6 pb-4 pt-2" style={{ background: "linear-gradient(to top, var(--bg) 60%, transparent)" }}>
          <BlogChat articleTitle={translation?.title ?? post.title} articleSlug={post.slug} lang={lang} />
        </div>
      </div>
    </div>
  );
}

function markdownToHtml(md: string): string {
  let html = md;
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
  html = html.replace(/<\/ul>\s*<ul>/g, "");
  html = html.replace(/^\|(.+)\|$/gm, (_, row) => {
    const cells = row.split("|").map((c: string) => c.trim());
    return "<tr>" + cells.map((c: string) => `<td>${c}</td>`).join("") + "</tr>";
  });
  html = html.replace(/(<tr>[\s\S]*?<\/tr>)/g, "<table>$1</table>");
  html = html.replace(/<\/table>\s*<table>/g, "");
  html = html.replace(/<tr><td>-+<\/td>(<td>-+<\/td>)*<\/tr>/g, "");
  html = html.replace(/<table><tr>([\s\S]*?)<\/tr>/, (_, cells) => {
    const thCells = cells.replace(/<td>/g, "<th>").replace(/<\/td>/g, "</th>");
    return `<table><thead><tr>${thCells}</tr></thead><tbody>`;
  });
  html = html.replace(/<\/table>/g, "</tbody></table>");
  html = html.replace(/^---$/gm, "<hr />");
  // Wrap remaining lines in <p> — skip block-level HTML tags but include inline tags like <strong>, <em>, <a>
  const blockTags = /^<(h[1-6]|ul|ol|li|table|thead|tbody|tr|th|td|pre|hr|div|blockquote)/;
  html = html.replace(/^(.+)$/gm, (line) => {
    if (!line.trim()) return line;
    if (blockTags.test(line)) return line;
    return `<p>${line}</p>`;
  });
  html = html.replace(/<p>\s*<\/p>/g, "");
  return html;
}
