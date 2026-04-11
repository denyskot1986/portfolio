import { MetadataRoute } from "next";
import { productsData } from "@/lib/products-data";

const BASE = "https://finekot.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
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

  return [...staticPages, ...productPages, ...checkoutPages];
}
