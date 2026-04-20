import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LangProvider } from "@/lib/lang-context";
import { ThemeProvider } from "@/lib/theme-context";
import ChatbotWidget from "@/components/ChatbotWidget";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const siteUrl = "https://finekot.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Finekot — Authored AI Agents & Production-Ready Systems",
  description:
    "Authored AI agents by subscription + production-ready AI systems you can own outright. iБоря, Ада and the Finekot lineup — built by an engineer, not a committee.",
  keywords: [
    "AI agents", "AI subscription", "authored AI agents", "AI systems", "AI templates",
    "multi-agent systems", "voice AI", "RAG", "business automation", "Finekot", "iБоря",
  ],
  authors: [{ name: "Finekot", url: siteUrl }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Finekot — Authored AI Agents & Production-Ready Systems",
    description: "Subscribe to authored AI agents like iБоря and Ада — or buy full systems with source code. Your choice.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finekot — Authored AI Agents & Systems",
    description: "Authored agents by subscription + owned systems. Built by Finekot.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Finekot — AI Agents & Systems",
  url: siteUrl,
  description: "Authored AI agents by subscription (from $49/mo) and production-ready AI systems you can own outright ($499 template, $2500 personal integration). Custom agents from $15k.",
  contactPoint: { "@type": "ContactPoint", url: "https://t.me/shop_by_finekot_bot", contactType: "sales" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Finekot Store",
    itemListElement: [
      { "@type": "Offer", name: "iБоря Subscription", price: "49", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: "49", priceCurrency: "USD", unitCode: "MON", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" } }, description: "AI operations chief for small business. Cancel anytime.", itemOffered: { "@type": "Service", name: "iБоря — AI agent subscription" } },
      { "@type": "Offer", name: "System Template", price: "499", priceCurrency: "USD", description: "Full source code + documentation + deployment guide. Deploy it yourself.", itemOffered: { "@type": "Service", name: "AI System Template" } },
      { "@type": "Offer", name: "System Integration", price: "2500", priceCurrency: "USD", description: "Personal setup into your business in 1 day. 30 days support included.", itemOffered: { "@type": "Service", name: "AI System Integration" } },
      { "@type": "Offer", name: "Custom Studio", price: "15000", priceCurrency: "USD", description: "Custom authored AI agent built for your business. From $15k. 3–6 weeks delivery.", itemOffered: { "@type": "Service", name: "Custom Agent Studio" } },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-theme="matrix" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <link rel="alternate" type="application/json" href="/api/products" title="AI Products API" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='vanilla'||t==='matrix'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider>
          <LangProvider>
            {children}
          </LangProvider>
          <ChatbotWidget />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
