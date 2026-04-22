import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HABITAT — Where Finekot agents live",
  description:
    "Один агент — четыре дома. Telegram, сайт, голос, фон. Анимация показывает где живут агенты Finekot Systems.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function HabitatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
