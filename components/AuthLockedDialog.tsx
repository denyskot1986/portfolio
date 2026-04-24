"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useLang } from "@/lib/lang-context";
import type { Lang } from "@/lib/i18n";

/* ═══════════════════════════════════════════════════════════════
   AUTH-LOCKED DIALOG — «авторизация временно недоступна».
   Показывается при нажатии на кнопку АВТОРИЗАЦИЯ по всему сайту,
   пока публичный запуск не состоялся. Монохром-amber, CRT-chrome,
   скан-бар и pulsing-замок.
   ═══════════════════════════════════════════════════════════════ */

type Copy = {
  header: string;
  title: string;
  body: string;
  status: string;
  ok: string;
  etaKey: string;
  eta: string;
};

const COPY: Record<Lang, Copy> = {
  EN: {
    header: "auth :: handshake",
    title: "ACCESS LOCKED",
    body: "Authorization is temporarily unavailable. The app is in active testing — the gate opens at public launch.",
    status: "// closed beta · build in progress",
    ok: "▸ got it",
    etaKey: "eta",
    eta: "opening soon",
  },
  RU: {
    header: "auth :: рукопожатие",
    title: "ДОСТУП ЗАКРЫТ",
    body: "Авторизация временно недоступна. Приложение в процессе тестирования — ворота откроются на публичном запуске.",
    status: "// closed beta · сборка идёт",
    ok: "▸ понятно",
    etaKey: "eta",
    eta: "скоро открываем",
  },
  UA: {
    header: "auth :: рукостискання",
    title: "ДОСТУП ЗАКРИТИЙ",
    body: "Авторизація тимчасово недоступна. Застосунок у процесі тестування — браму відчинимо на публічному запуску.",
    status: "// closed beta · збірка триває",
    ok: "▸ зрозумів",
    etaKey: "eta",
    eta: "незабаром відкриваємо",
  },
};

export function AuthLockedDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { lang } = useLang();
  const c = COPY[lang];

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-mono"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(40,20,0,0.55) 0%, rgba(4,2,8,0.92) 75%)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          {/* CRT scanlines to match site chrome */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,176,0,0.06) 0px, rgba(255,176,0,0.06) 1px, transparent 1px, transparent 3px)",
              mixBlendMode: "screen",
              opacity: 0.35,
            }}
          />

          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={c.title}
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[440px] overflow-hidden"
            style={{
              background: "rgba(6,4,2,0.96)",
              border: "1px solid rgba(255,176,0,0.55)",
              borderRadius: 12,
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(255,176,0,0.35), inset 0 0 36px rgba(255,176,0,0.08)",
            }}
          >
            {/* ─── chrome header ─── */}
            <div
              className="flex items-center gap-1.5 px-3.5 py-2.5"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,176,0,0.18), transparent 90%)",
                borderBottom: "1px solid rgba(255,176,0,0.35)",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-2.5 h-2.5 rounded-full transition-transform hover:scale-125"
                style={{ background: "#ff5f57" }}
              />
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "#febc2e" }}
              />
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "#28c840" }}
              />
              <span
                className="ml-2 text-[10px] tracking-[0.2em] uppercase flex-1 truncate"
                style={{
                  color: "#ffb000",
                  opacity: 0.95,
                  fontWeight: 600,
                }}
              >
                {c.header}
              </span>
              {/* live dot */}
              <motion.span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "#ffb000",
                  boxShadow: "0 0 8px #ffb000",
                }}
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.3, repeat: Infinity }}
              />
            </div>

            {/* ─── body ─── */}
            <div className="relative px-6 sm:px-7 pt-7 pb-6 text-center">
              {/* lock icon with scan bar */}
              <div className="relative mx-auto mb-5" style={{ width: 96, height: 96 }}>
                {/* outer pulsing ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: "1px solid rgba(255,176,0,0.4)" }}
                  animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full"
                  style={{ border: "1px solid rgba(255,176,0,0.25)" }}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.15, 0.4] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                />
                {/* lock glyph */}
                <div
                  className="absolute inset-4 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 35%, rgba(255,176,0,0.22), rgba(255,120,0,0.05) 70%)",
                    border: "1px solid rgba(255,176,0,0.6)",
                    boxShadow:
                      "inset 0 0 16px rgba(255,176,0,0.18), 0 0 22px rgba(255,176,0,0.35)",
                  }}
                >
                  <svg
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffb000"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      filter: "drop-shadow(0 0 6px rgba(255,176,0,0.7))",
                    }}
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    <circle cx="12" cy="15.5" r="1.3" fill="#ffb000" stroke="none" />
                  </svg>
                </div>
                {/* scanning bar */}
                <motion.div
                  className="absolute left-3 right-3 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #ffb000, transparent)",
                    filter: "blur(0.5px)",
                    boxShadow: "0 0 8px #ffb000",
                  }}
                  animate={{ top: ["18%", "78%", "18%"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              {/* title */}
              <div
                className="text-[11px] tracking-[0.3em] mb-1.5"
                style={{ color: "rgba(255,176,0,0.55)" }}
              >
                ◎ 401 · restricted
              </div>
              <div
                className="text-xl sm:text-[22px] font-bold tracking-[0.14em] uppercase"
                style={{
                  color: "#ffb000",
                  textShadow: "0 0 14px rgba(255,176,0,0.5)",
                }}
              >
                {c.title}
              </div>

              {/* body text */}
              <p
                className="mt-4 text-[13px] sm:text-sm"
                style={{
                  color: "rgba(255,236,190,0.88)",
                  lineHeight: 1.6,
                  letterSpacing: "0.01em",
                }}
              >
                {c.body}
              </p>

              {/* status row */}
              <div
                className="mt-5 flex items-center justify-center gap-2 text-[10px] tracking-[0.22em] uppercase"
                style={{ color: "rgba(255,176,0,0.7)" }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#ffb000", boxShadow: "0 0 6px #ffb000" }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
                <span>{c.status}</span>
              </div>

              {/* eta chip */}
              <div className="mt-3.5 flex items-center justify-center">
                <span
                  className="inline-flex items-center gap-2 px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase rounded"
                  style={{
                    color: "rgba(255,236,190,0.8)",
                    background: "rgba(255,176,0,0.06)",
                    border: "1px solid rgba(255,176,0,0.22)",
                  }}
                >
                  <span style={{ opacity: 0.55 }}>{c.etaKey} ·</span>
                  <span style={{ color: "#ffb000" }}>{c.eta}</span>
                </span>
              </div>

              {/* OK button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 font-mono uppercase px-5 py-2 text-[11px] tracking-[0.2em] transition-all"
                  style={{
                    color: "#ffb000",
                    background: "rgba(255,176,0,0.08)",
                    border: "1px solid rgba(255,176,0,0.55)",
                    borderRadius: 6,
                    textShadow: "0 0 8px rgba(255,176,0,0.6)",
                    boxShadow:
                      "0 0 14px rgba(255,176,0,0.22), inset 0 0 10px rgba(255,176,0,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,176,0,0.22)";
                    e.currentTarget.style.borderColor = "rgba(255,176,0,0.95)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,176,0,0.08)";
                    e.currentTarget.style.borderColor = "rgba(255,176,0,0.55)";
                  }}
                >
                  {c.ok}
                </button>
              </div>
            </div>

            {/* bottom strip — ticker-like */}
            <div
              className="flex items-center justify-between px-4 py-1.5 text-[9px] tracking-[0.22em] uppercase"
              style={{
                background: "rgba(255,176,0,0.06)",
                borderTop: "1px solid rgba(255,176,0,0.25)",
                color: "rgba(255,176,0,0.6)",
              }}
            >
              <span>▸ finekot · auth-gate</span>
              <span style={{ opacity: 0.75 }}>esc · close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Shared AUTH button — orange-amber CRT style ─── */

export function AuthButton({
  onClick,
  className,
  style,
  label,
}: {
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}) {
  const { lang } = useLang();
  const defaultLabel =
    lang === "RU" ? "АВТОРИЗАЦИЯ" : lang === "UA" ? "АВТОРИЗАЦІЯ" : "SIGN IN";
  const text = label ?? defaultLabel;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono uppercase transition-all px-3 py-1.5 text-[10px] sm:text-[11px] tracking-[0.18em] flex items-center gap-1.5 ${className ?? ""}`}
      style={{
        color: "#ffb000",
        background: "rgba(255, 176, 0, 0.1)",
        border: "1px solid rgba(255, 176, 0, 0.55)",
        borderRadius: 4,
        textShadow: "0 0 8px rgba(255, 176, 0, 0.6)",
        boxShadow: "0 0 14px rgba(255, 176, 0, 0.22)",
        cursor: "pointer",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255, 176, 0, 0.22)";
        e.currentTarget.style.borderColor = "rgba(255, 176, 0, 0.9)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255, 176, 0, 0.1)";
        e.currentTarget.style.borderColor = "rgba(255, 176, 0, 0.55)";
      }}
    >
      <span style={{ opacity: 0.55 }}>▸</span>
      {text}
    </button>
  );
}
