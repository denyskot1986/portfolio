import { MetadataRoute } from "next";
import { productsData } from "@/lib/products-data";
import { blogPosts } from "@/lib/blog-data";

const BASE = "https://finekot.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/reels-agent`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];

  const productPages: MetadataRoute.Sitemap = productsData.map((p) => ({
    url: `${BASE}/products/${p.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const checkoutPages: MetadataRoute.Sitemap = productsData.map((p) => ({
    url: `${BASE}/checkout/${p.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...checkoutPages, ...blogPages];
}
