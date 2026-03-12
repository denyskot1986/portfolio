#!/usr/bin/env node
/**
 * Auto-Publish Blog → Telegram
 * Detects new posts in lib/blog-data.ts vs previous commit, posts to @finekot_ai
 */

const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const SITE_URL = process.env.SITE_URL || 'https://finekot.ai';

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error('❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID');
  process.exit(1);
}

// --- Parse blog-data.ts: extract slugs and post metadata ---
function parsePosts(content) {
  const posts = {};

  // Find all slug positions to determine post boundaries
  const slugRegex = /slug:\s*["'`]([^"'`\n]+)["'`]/g;
  const slugMatches = [];
  let m;
  while ((m = slugRegex.exec(content)) !== null) {
    slugMatches.push({ slug: m[1], pos: m.index });
  }

  for (let i = 0; i < slugMatches.length; i++) {
    const { slug, pos } = slugMatches[i];
    const nextPos = i + 1 < slugMatches.length ? slugMatches[i + 1].pos : content.length;
    const block = content.substring(pos, nextPos);

    const field = (name) => {
      const re = new RegExp(`${name}:\\s*\\n?\\s*["'\`]([\\s\\S]*?)["'\`]\\s*,`);
      const match = block.match(re);
      return match ? match[1].replace(/\s+/g, ' ').trim() : '';
    };

    posts[slug] = {
      slug,
      title: field('title'),
      excerpt: field('excerpt'),
      date: field('date'),
      readTime: field('readTime'),
      category: field('category'),
    };
  }

  return posts;
}

// --- Get previous version of blog-data.ts ---
function getPreviousContent() {
  try {
    return execSync('git show HEAD~1:lib/blog-data.ts', { encoding: 'utf8' });
  } catch {
    return ''; // First commit — all posts are new
  }
}

// --- Send message via Telegram Bot API ---
function sendTelegram(text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      chat_id: CHANNEL_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    });

    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const json = JSON.parse(data);
          if (json.ok) {
            resolve(json);
          } else {
            reject(new Error(`Telegram API error: ${JSON.stringify(json)}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// --- Format post for Telegram ---
function formatPost(post) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const excerpt = post.excerpt.length > 300
    ? post.excerpt.substring(0, 297) + '...'
    : post.excerpt;

  return (
    `📝 <b>New article on Finekot.ai</b>\n\n` +
    `<b>${post.title}</b>\n\n` +
    `${excerpt}\n\n` +
    `🏷 ${post.category}  •  ⏱ ${post.readTime}\n` +
    `🔗 <a href="${url}">Read full article →</a>`
  );
}

// --- Main ---
async function main() {
  const currentContent = fs.readFileSync('lib/blog-data.ts', 'utf8');
  const previousContent = getPreviousContent();

  const currentPosts = parsePosts(currentContent);
  const previousPosts = parsePosts(previousContent);

  const newSlugs = Object.keys(currentPosts).filter((slug) => !previousPosts[slug]);

  if (newSlugs.length === 0) {
    console.log('ℹ️ No new posts detected. Skipping.');
    return;
  }

  console.log(`🆕 Found ${newSlugs.length} new post(s): ${newSlugs.join(', ')}`);

  for (const slug of newSlugs) {
    const post = currentPosts[slug];
    const message = formatPost(post);

    console.log(`📤 Posting: "${post.title}"`);
    try {
      await sendTelegram(message);
      console.log(`✅ Posted: ${slug}`);
    } catch (err) {
      console.error(`❌ Failed to post ${slug}:`, err.message);
      process.exit(1);
    }

    // Small delay between posts if multiple
    if (newSlugs.length > 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
