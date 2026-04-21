import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GENESIS — Finekot",
  description: "Watch a multi-agent system build itself.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function GenesisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
