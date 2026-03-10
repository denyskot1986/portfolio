import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = "https://denyskot.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Finekot Systems — Production-Ready AI Systems",
  description:
    "17 production-ready AI systems. $499 template — deploy yourself. $2500 integration — ready in 1 day. Full source code. No subscriptions.",
  keywords: [
    "AI systems", "AI templates", "production AI", "multi-agent systems",
    "voice AI", "RAG", "business automation", "Finekot Systems", "buy AI system",
  ],
  authors: [{ name: "Finekot Systems", url: siteUrl }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Finekot Systems — Production-Ready AI Systems",
    description: "17 AI systems ready to launch. $499 template or $2500 personal integration. Full source code ownership.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finekot Systems — Production-Ready AI Systems",
    description: "17 AI systems. $499 template. $2500 integration. Full source code.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Finekot Systems — Production-Ready AI Systems",
  url: siteUrl,
  description: "17 production-ready AI systems. $499 template — deploy yourself. $2500 integration — ready in 1 day.",
  contactPoint: { "@type": "ContactPoint", url: "https://t.me/shop_by_finekot_bot", contactType: "sales" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "AI Systems Store",
    itemListElement: [
      { "@type": "Offer", name: "Template", price: "499", priceCurrency: "USD", description: "Full source code + documentation + deployment guide. Deploy it yourself.", itemOffered: { "@type": "Service", name: "AI System Template" } },
      { "@type": "Offer", name: "Integration", price: "2500", priceCurrency: "USD", description: "Personal setup into your business in 1 day. 30 days support included.", itemOffered: { "@type": "Service", name: "AI System Integration" } },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <link rel="alternate" type="application/json" href="/api/products" title="AI Products API" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
