import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finekot Assembly Bay — forging your Boris",
  description:
    "Watch Finekot Systems assemble a unique Boris instance on-demand. CMD-style live assembly line.",
  openGraph: {
    title: "Finekot Assembly Bay",
    description:
      "Each Boris is forged on-demand — a unique instance, not a copy.",
    url: "https://finekot.ai/factory",
    siteName: "Finekot Systems",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export default function FactoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
