import type { Metadata } from "next";
import { productsData, getProductById } from "@/lib/products-data";
import ProductPageClient from "./ProductPageClient";

export async function generateStaticParams() {
  return productsData.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return { title: "Product Not Found — Finekot AI" };
  }

  const price = product.pricing.setup
    ? `From $${product.pricing.code}`
    : `$${product.pricing.code}`;

  return {
    title: `${product.name} — ${product.tagline} | Finekot AI`,
    description: `${product.description} ${price}. Full source code, lifetime updates, production-ready.`,
    openGraph: {
      title: `${product.name} — ${product.tagline}`,
      description: `${product.description} ${price}. Full source code, lifetime updates.`,
      url: `https://finekot.ai/products/${product.id}`,
      siteName: "Finekot AI",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — ${product.tagline}`,
      description: `${product.description} ${price}.`,
    },
  };
}

export default function ProductPage() {
  return <ProductPageClient />;
}
