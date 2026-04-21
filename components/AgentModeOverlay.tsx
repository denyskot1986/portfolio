"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import {
  AgentModeIntensity,
  AgentModeTheme,
  INTENSITY,
  THEMES,
  ThemeStops,
} from "./agent-mode-themes";

export interface AgentModeOverlayProps {
  active: boolean;
  theme?: AgentModeTheme;
  customTheme?: ThemeStops;
  intensity?: AgentModeIntensity;
  agentName?: string;
  showBadge?: boolean;
  onTakeOver?: () => void;
  zIndex?: number;
}

export function AgentModeOverlay({
  active,
  theme = "pink",
  customTheme,
  intensity = "normal",
  agentName = "Ada",
  showBadge = true,
  onTakeOver,
  zIndex = 9999,
}: AgentModeOverlayProps) {
  const resolved: ThemeStops = useMemo(() => {
    if (theme === "custom" && customTheme) return customTheme;
    return THEMES[theme === "custom" ? "pink" : theme];
  }, [theme, customTheme]);

  const profile = INTENSITY[intensity];

  // Pick 4 colors from the palette for the four edges (top, right, bottom, left)
  const [cTop, cRight, cBottom, cLeft] = useMemo(() => {
    const s = resolved.stops;
    return [
      s[0] ?? resolved.accent,
      s[2] ?? resolved.accent,
      s[3] ?? resolved.accent,
      s[1] ?? resolved.accent,
    ];
  }, [resolved]);

  // ~2× smaller footprint vs original: thinner inset ring + tighter edge
  // gradients so the takeover overlay hugs the bezel instead of washing
  // the whole viewport.
  const spread = profile.glowBlur * 0.5;
  const strength = profile.glowOpacityMax;
  const alpha = (hex: string, a: number) => {
    // поддерживаем только #rrggbb
    const m = hex.replace("#", "");
    const full =
      m.length === 3
        ? m
            .split("")
            .map((c) => c + c)
            .join("")
        : m;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const keyframes = `
    @keyframes agent-mode-pulse {
      0%, 100% { opacity: ${profile.glowOpacityMin}; }
      50% { opacity: ${profile.glowOpacityMax}; }
    }
    @keyframes agent-mode-pulse-slow {
      0%, 100% { opacity: ${profile.glowOpacityMin * 0.6}; }
      50% { opacity: ${profile.glowOpacityMax * 0.8}; }
    }
    @keyframes agent-mode-badge-dot {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.25); }
    }
  `;

  // Свечение сосредоточено В УГЛАХ экрана (не по серединам сторон) — чтобы
  // центр страницы с карточкой товара оставался чистым, а знак «агент ведёт»
  // считывался только по периферии. Яркость: центр градиента заходит внутрь
  // viewport (4% / 96%), альфа усилена до 1 и есть второй внутренний slot
  // до 20% — так углы читаются как «горят», но в центр экрана не ползут.
  const boosted = Math.min(1, strength * 1.8);
  const edgeGlow = `
    radial-gradient(ellipse 38% 28% at 4% 4%, ${alpha(cTop, boosted)} 0%, ${alpha(cTop, boosted * 0.5)} 20%, transparent 55%),
    radial-gradient(ellipse 38% 28% at 96% 4%, ${alpha(cRight, boosted)} 0%, ${alpha(cRight, boosted * 0.5)} 20%, transparent 55%),
    radial-gradient(ellipse 38% 28% at 96% 96%, ${alpha(cBottom, boosted)} 0%, ${alpha(cBottom, boosted * 0.5)} 20%, transparent 55%),
    radial-gradient(ellipse 38% 28% at 4% 96%, ${alpha(cLeft, boosted)} 0%, ${alpha(cLeft, boosted * 0.5)} 20%, transparent 55%)
  `;

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key="agent-mode-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex,
          }}
          aria-hidden="true"
        >
          <style>{keyframes}</style>

          {/* Основной слой: цветное свечение от 4 краёв внутрь */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: edgeGlow,
              animation: `agent-mode-pulse ${profile.glowPulseSec}s ease-in-out infinite`,
              mixBlendMode: "screen",
            }}
          />

          {/* Мягкое акцентное кольцо — подсвечивает периметр, акцент держится
              в углах за счёт radial-слоя выше. Возвращён почти полный
              strength (0.8×), чтобы "takeover" было заметно издалека. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              boxShadow: `inset 0 0 ${spread * 0.9}px ${alpha(resolved.accent, strength * 0.8)}`,
              animation: `agent-mode-pulse-slow ${profile.glowPulseSec * 1.4}s ease-in-out infinite`,
              mixBlendMode: "screen",
            }}
          />

          {/* Для alert — дополнительное тревожное кольцо */}
          {intensity === "alert" ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                boxShadow: `inset 0 0 ${spread * 0.5}px ${alpha(cRight, strength * 0.8)}`,
                animation: `agent-mode-pulse ${profile.glowPulseSec * 0.7}s ease-in-out infinite`,
                mixBlendMode: "screen",
              }}
            />
          ) : null}

          {showBadge ? (
            <AgentStatusBadge
              agentName={agentName}
              accent={resolved.accent}
              onTakeOver={onTakeOver}
            />
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function AgentStatusBadge({
  agentName,
  accent,
  onTakeOver,
}: {
  agentName: string;
  accent: string;
  onTakeOver?: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        position: "absolute",
        right: 20,
        // Поднимаем бейдж над фиксированным ChatBar-ом, чтобы кнопка
        // «Забрать управление» не перекрывалась полем ввода.
        bottom: "calc(var(--chat-bar-h, 72px) + 20px)",
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        background: "rgba(8, 8, 12, 0.78)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${accent}55`,
        borderRadius: 999,
        boxShadow: `0 8px 40px ${accent}33, inset 0 0 20px ${accent}14`,
        color: "#e7e7ea",
        fontFamily:
          '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 13,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: accent,
          boxShadow: `0 0 12px ${accent}, 0 0 24px ${accent}88`,
          animation: "agent-mode-badge-dot 1.6s ease-in-out infinite",
        }}
      />
      <span style={{ letterSpacing: 0.2 }}>
        <strong style={{ color: accent, fontWeight: 600 }}>{agentName}</strong>{" "}
        ведёт
      </span>
      {onTakeOver ? (
        <button
          type="button"
          onClick={onTakeOver}
          style={{
            marginLeft: 4,
            padding: "4px 10px",
            border: `1px solid ${accent}88`,
            borderRadius: 999,
            background: "transparent",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: 12,
            cursor: "pointer",
            transition: "background 120ms ease, color 120ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = accent;
            (e.currentTarget as HTMLButtonElement).style.color = "#08080c";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
          }}
        >
          Забрать управление
        </button>
      ) : null}
    </motion.div>
  );
}
