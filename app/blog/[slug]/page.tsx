"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { blogPosts } from "../../../lib/blog-data";

export default function BlogPostPage() {
  const params = useParams();
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black gradient-text mb-4">404</h1>
          <p className="text-pink-100/40 mb-6">Post not found</p>
          <Link href="/blog" className="text-pink-400/60 hover:text-pink-400 font-mono text-sm transition-colors">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-pink-600/60" />
        <div className="blob blob-2 absolute top-[40%] right-[-15%] w-[500px] h-[500px] rounded-full bg-purple-600/50" />
      </div>
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      <article className="relative z-10 max-w-3xl mx-auto px-6 pt-28 pb-20">
        <Link href="/blog" className="text-xs text-pink-400/40 hover:text-pink-400/70 font-mono transition-colors mb-8 inline-block">
          ← Back to Blog
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] px-2 py-1 rounded-full bg-pink-500/10 text-pink-400/60 border border-pink-500/20 font-mono">
              {post.category}
            </span>
            <span className="text-[10px] text-pink-300/25 font-mono">{post.date}</span>
            <span className="text-[10px] text-pink-300/25 font-mono">{post.readTime}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-pink-100/90">
            {post.title}
          </h1>

          <div
            className="prose prose-invert max-w-none
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-pink-100/70 [&_h2]:mt-10 [&_h2]:mb-4
              [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-pink-100/60 [&_h3]:mt-8 [&_h3]:mb-3
              [&_p]:text-pink-100/40 [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-sm
              [&_ul]:space-y-1 [&_li]:text-pink-100/40 [&_li]:text-sm
              [&_strong]:text-pink-100/60
              [&_a]:text-pink-400/60 [&_a]:hover:text-pink-400 [&_a]:transition-colors [&_a]:underline
              [&_code]:text-pink-300/50 [&_code]:bg-pink-500/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
              [&_pre]:bg-pink-500/[0.03] [&_pre]:border [&_pre]:border-pink-500/10 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-6
              [&_pre_code]:bg-transparent [&_pre_code]:p-0
              [&_table]:w-full [&_table]:text-sm [&_table]:my-6
              [&_th]:text-left [&_th]:text-pink-100/50 [&_th]:font-mono [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:pb-2 [&_th]:border-b [&_th]:border-pink-500/10
              [&_td]:py-2 [&_td]:text-pink-100/35 [&_td]:border-b [&_td]:border-pink-500/5 [&_td]:text-xs
              [&_hr]:border-pink-500/10 [&_hr]:my-8
              [&_blockquote]:border-l-2 [&_blockquote]:border-pink-500/20 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-pink-100/30
              [&_em]:text-pink-100/50
            "
            dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
          />
        </motion.div>

        <div className="mt-16 pt-8 border-t border-pink-500/10">
          <p className="text-xs text-pink-400/30 uppercase tracking-wider font-mono mb-4">More articles</p>
          <div className="space-y-3">
            {blogPosts
              .filter((p) => p.slug !== post.slug)
              .slice(0, 3)
              .map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="block glass rounded-lg p-4 hover:border-pink-500/20 transition-all group">
                  <h3 className="text-sm font-bold text-pink-100/60 group-hover:text-pink-100/80 transition-colors">{p.title}</h3>
                  <p className="text-[10px] text-pink-300/25 font-mono mt-1">{p.date} · {p.readTime}</p>
                </Link>
              ))}
          </div>
        </div>
      </article>
    </div>
  );
}

function markdownToHtml(md: string): string {
  let html = md;
  // Headers
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>");
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
  html = html.replace(/<\/ul>\s*<ul>/g, "");
  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (_, row) => {
    const cells = row.split("|").map((c: string) => c.trim());
    return "<tr>" + cells.map((c: string) => `<td>${c}</td>`).join("") + "</tr>";
  });
  html = html.replace(/(<tr>[\s\S]*?<\/tr>)/g, "<table>$1</table>");
  html = html.replace(/<\/table>\s*<table>/g, "");
  // Remove separator rows
  html = html.replace(/<tr><td>-+<\/td>(<td>-+<\/td>)*<\/tr>/g, "");
  // First row as thead
  html = html.replace(/<table><tr>([\s\S]*?)<\/tr>/, (_, cells) => {
    const thCells = cells.replace(/<td>/g, "<th>").replace(/<\/td>/g, "</th>");
    return `<table><thead><tr>${thCells}</tr></thead><tbody>`;
  });
  html = html.replace(/<\/table>/g, "</tbody></table>");
  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr />");
  // Paragraphs
  html = html.replace(/^(?!<[a-z])((?!^\s*$).+)$/gm, "<p>$1</p>");
  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, "");
  return html;
}
