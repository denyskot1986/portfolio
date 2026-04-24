import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HABITAT — Your agents, side by side",
  description:
    "Восемь агентов Finekot, живущих параллельно в собственных окнах чатов. Клик по аватару в доке — окно агента разворачивается и накрывает соседей наполовину.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function HabitatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
