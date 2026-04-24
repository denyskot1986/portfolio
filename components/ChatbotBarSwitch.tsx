"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ChatbotBar from "./ChatbotBar";
import { useLang } from "@/lib/lang-context";
import type { Lang } from "@/lib/i18n";

// Три варианта редизайна нижнего консультант-бара на странице товара,
// чтобы он не дублировал inline-чат Boris/Ada/etc. Выбирается через
// `?v=hide|fab|merge` в URL. На главной всегда рендерится полный bar.

type Variant = "default" | "hide" | "fab" | "merge";

function setChromeVars(topH: number, barH: number) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--chat-top-h", `${topH}px`);
  document.documentElement.style.setProperty("--chat-bar-h", `${barH}px`);
}

function ChatbotBarSwitchInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const v = (searchParams?.get("v") as Variant) || "default";
  const isProduct = pathname?.startsWith("/products/") ?? false;
  const isLensDemo = pathname === "/lens";

  const [expanded, setExpanded] = useState(false);

  // Сбрасываем expanded при смене режима/страницы.
  useEffect(() => {
    setExpanded(false);
  }, [v, pathname]);

  // Подвинуть padding тела страницы под фактическую высоту bottom-элемента.
  useEffect(() => {
    if (!isProduct || v === "default") {
      setChromeVars(34, 72);
      return;
    }
    if (v === "hide") {
      setChromeVars(0, 0);
      return;
    }
    if (expanded) {
      setChromeVars(34, 72);
      return;
    }
    if (v === "fab") setChromeVars(0, 56);
    if (v === "merge") setChromeVars(0, 64);
  }, [isProduct, v, expanded]);

  if (isLensDemo) return null;
  if (!isProduct || v === "default") return <ChatbotBar />;

  if (v === "hide") return null;

  if (expanded) {
    return (
      <>
        <ChatbotBar />
        <CollapseButton onClick={() => setExpanded(false)} lang={lang} />
      </>
    );
  }

  if (v === "fab") return <FabPill onClick={() => setExpanded(true)} lang={lang} />;
  if (v === "merge") return <HandoffCard onClick={() => setExpanded(true)} lang={lang} />;

  return <ChatbotBar />;
}

export default function ChatbotBarSwitch() {
  return (
    <Suspense fallback={<ChatbotBar />}>
      <ChatbotBarSwitchInner />
    </Suspense>
  );
}

// ─────────── Variant 2: FAB pill ───────────
function FabPill({ onClick, lang }: { onClick: () => void; lang: Lang }) {
  const label =
    lang === "RU" ? "Общий консультант" : lang === "UA" ? "Загальний консультант" : "Catalog consultant";

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="fixed bottom-4 right-4 z-[499] font-mono flex items-center gap-2.5 pl-3 pr-4 py-2.5"
      style={{
        background: "rgba(4, 2, 8, 0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(var(--accent-rgb), 0.45)",
        borderRadius: "999px",
        color: "var(--accent)",
        fontSize: 12,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        textShadow: "0 0 6px rgba(var(--accent-rgb), 0.55)",
        boxShadow:
          "0 6px 24px rgba(var(--accent-rgb), 0.18), inset 0 0 10px rgba(var(--accent-rgb), 0.08)",
      }}
      aria-label={label}
    >
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full"
        style={{
          background: "rgba(var(--accent-rgb), 0.15)",
          border: "1px solid rgba(var(--accent-rgb), 0.55)",
          fontSize: 13,
        }}
        aria-hidden
      >
        ▸
      </span>
      <span>{label}</span>
      <span
        className="inline-block w-1.5 h-1.5 rounded-full ml-1"
        style={{ background: "var(--accent)", boxShadow: "0 0 6px rgba(var(--accent-rgb), 0.9)" }}
        aria-hidden
      />
    </motion.button>
  );
}

// ─────────── Variant 3: Handoff card ───────────
function HandoffCard({ onClick, lang }: { onClick: () => void; lang: Lang }) {
  const title =
    lang === "RU"
      ? "Нужен обзор по всему каталогу?"
      : lang === "UA"
      ? "Потрібен огляд усього каталогу?"
      : "Need a walk-through of the full catalog?";
  const cta =
    lang === "RU"
      ? "Позвать David · общий консультант →"
      : lang === "UA"
      ? "Покликати David · загальний консультант →"
      : "Call David · catalog consultant →";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="fixed bottom-0 left-0 right-0 z-[499] font-mono"
      style={{
        background: "rgba(4, 2, 8, 0.94)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(var(--accent-rgb), 0.28)",
        boxShadow: "0 -6px 24px rgba(var(--accent-rgb), 0.08)",
      }}
    >
      <button
        onClick={onClick}
        className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3 text-left group"
      >
        <span
          className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full"
          style={{
            background: "rgba(var(--accent-rgb), 0.08)",
            border: "1px solid rgba(var(--accent-rgb), 0.45)",
            color: "var(--accent)",
            fontSize: 14,
            textShadow: "0 0 6px rgba(var(--accent-rgb), 0.55)",
          }}
          aria-hidden
        >
          ▸
        </span>
        <span className="flex-1 min-w-0">
          <span
            className="block text-[11px] uppercase"
            style={{
              color: "rgba(var(--accent-rgb), 0.6)",
              letterSpacing: "0.22em",
            }}
          >
            {title}
          </span>
          <span
            className="block text-[13px] mt-0.5 truncate"
            style={{
              color: "var(--accent2)",
              textShadow: "0 0 6px rgba(var(--accent2-rgb), 0.35)",
              letterSpacing: "0.04em",
            }}
          >
            {cta}
          </span>
        </span>
        <span
          className="shrink-0 text-[10px] uppercase px-2.5 py-1 rounded transition-colors"
          style={{
            border: "1px solid rgba(var(--accent2-rgb), 0.55)",
            color: "var(--accent2)",
            letterSpacing: "0.2em",
            textShadow: "0 0 6px rgba(var(--accent2-rgb), 0.35)",
          }}
        >
          {lang === "RU" ? "открыть" : lang === "UA" ? "відкрити" : "open"}
        </span>
      </button>
    </motion.div>
  );
}

// ─────────── Shared: collapse button ───────────
function CollapseButton({ onClick, lang }: { onClick: () => void; lang: Lang }) {
  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClick}
        className="fixed right-3 z-[500] font-mono flex items-center gap-1.5 px-2.5 py-1"
        style={{
          top: 6,
          background: "rgba(4, 2, 8, 0.97)",
          border: "1px solid rgba(var(--accent2-rgb), 0.55)",
          color: "var(--accent2)",
          borderRadius: 3,
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          textShadow: "0 0 6px rgba(var(--accent2-rgb), 0.4)",
          boxShadow: "0 0 12px rgba(var(--accent2-rgb), 0.25)",
        }}
        aria-label={lang === "RU" ? "Свернуть" : lang === "UA" ? "Згорнути" : "Collapse"}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
        <span>{lang === "RU" ? "свернуть" : lang === "UA" ? "згорнути" : "collapse"}</span>
      </motion.button>
    </AnimatePresence>
  );
}
