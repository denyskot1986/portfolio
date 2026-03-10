"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { blogPosts } from "../../lib/blog-data";

const fade = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true as const } };

export default function BlogPage() {
  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-pink-600/60" />
        <div className="blob blob-2 absolute top-[40%] right-[-15%] w-[500px] h-[500px] rounded-full bg-purple-600/50" />
      </div>
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-20">
        <Link href="/" className="text-xs text-pink-400/40 hover:text-pink-400/70 font-mono transition-colors mb-8 inline-block">
          ← Back to Home
        </Link>

        <motion.div {...fade}>
          <p className="text-xs text-pink-400/30 uppercase tracking-[0.4em] mb-3 font-mono">Insights</p>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-pink-100/40 text-lg mb-12">Thoughts on AI systems, automation, and building the future.</p>
        </motion.div>

        <div className="space-y-6">
          {blogPosts.map((post, i) => (
            <motion.div key={post.slug} {...fade} transition={{ delay: i * 0.1 }}>
              <Link href={`/blog/${post.slug}`}>
                <div className="glass rounded-xl p-6 sm:p-8 hover:border-pink-500/20 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-pink-500/10 text-pink-400/60 border border-pink-500/20 font-mono">
                      {post.category}
                    </span>
                    <span className="text-[10px] text-pink-300/25 font-mono">{post.date}</span>
                    <span className="text-[10px] text-pink-300/25 font-mono">{post.readTime}</span>
                  </div>
                  <h2 className="text-xl font-bold text-pink-100/70 group-hover:text-pink-100 transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-pink-100/30 leading-relaxed">{post.excerpt}</p>
                  <span className="text-xs text-pink-400/40 group-hover:text-pink-400/70 font-mono mt-3 inline-block transition-colors">
                    Read more →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
