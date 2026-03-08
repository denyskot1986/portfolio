import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reels Agent — AI Auto-Responder for Instagram",
  description:
    "Automate Instagram comment replies with AI. Boost engagement, save time, grow your audience on autopilot.",
  keywords: ["instagram", "ai", "auto-reply", "comments", "reels", "engagement"],
  openGraph: {
    title: "Reels Agent — AI Auto-Responder for Instagram",
    description:
      "Auto-reply to every Instagram comment. Sounds like you. Works 24/7. Boosts engagement by up to 3x.",
    url: "https://finekot.ai/reels-agent",
    siteName: "Reels Agent by Finekot",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reels Agent — AI Auto-Responder for Instagram",
    description:
      "Auto-reply to every Instagram comment. Sounds like you. Works 24/7. Boosts engagement by up to 3x.",
  },
};

export default function ReelsAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
