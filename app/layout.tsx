import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LangProvider } from "@/lib/lang-context";
import ChatbotBarSwitch from "@/components/ChatbotBarSwitch";
import "./globals.css";

// Pre-paint theme init: read saved theme (or migrate legacy dark/light) and
// apply data-theme before first render, so color swatches don't flash.
const themeInitScript = `(function(){try{var t=localStorage.getItem('finekot-theme');if(t==='dark')t='matrix';else if(t==='light')t='paper';var ok=['matrix','telegram','violet','amber','pink','paper'];if(ok.indexOf(t)>=0)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

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
    "Authored AI agents by subscription + production-ready AI systems you can own outright. Boris, Ada and the Finekot lineup — built by an engineer, not a committee.",
  keywords: [
    "AI agents", "AI subscription", "authored AI agents", "AI systems", "AI templates",
    "multi-agent systems", "voice AI", "RAG", "business automation", "Finekot", "Boris", "Ada", "David", "Eva", "Patrik", "Taras", "Hanna",
  ],
  authors: [{ name: "Finekot", url: siteUrl }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Finekot — Authored AI Agents & Production-Ready Systems",
    description: "Subscribe to authored AI agents like Boris and Ada — or buy full systems with source code. Your choice.",
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
  description: "Authored AI agents by subscription (from $149/mo) and production-ready AI systems you can own outright ($1499 template, $7499 personal integration). Custom agents from $44999.",
  contactPoint: { "@type": "ContactPoint", url: "https://t.me/shop_by_finekot_bot", contactType: "sales" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Finekot Store",
    itemListElement: [
      { "@type": "Offer", name: "Boris Subscription", price: "149", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: "149", priceCurrency: "USD", unitCode: "MON", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" } }, description: "Personal AI chief of staff. Cancel anytime.", itemOffered: { "@type": "Service", name: "Boris — AI agent subscription" } },
      { "@type": "Offer", name: "System Template", price: "1499", priceCurrency: "USD", description: "Full source code + documentation + deployment guide. Deploy it yourself.", itemOffered: { "@type": "Service", name: "AI System Template" } },
      { "@type": "Offer", name: "System Integration", price: "7499", priceCurrency: "USD", description: "Personal setup into your business in 1 day. 30 days support included.", itemOffered: { "@type": "Service", name: "AI System Integration" } },
      { "@type": "Offer", name: "Custom Studio", price: "44999", priceCurrency: "USD", description: "Custom authored AI agent built for your business. From $44999. 3–6 weeks delivery.", itemOffered: { "@type": "Service", name: "Custom Agent Studio" } },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <link rel="alternate" type="application/json" href="/api/products" title="AI Products API" />
      </head>
      <body
        className={`${jetbrainsMono.variable} antialiased`}
        style={{
          paddingTop: "var(--chat-top-h, 34px)",
          paddingBottom: "var(--chat-bar-h, 72px)",
        }}
      >
        <LangProvider>
          {children}
          <ChatbotBarSwitch />
        </LangProvider>
        <Analytics />
      </body>
    </html>
  );
}
