"use client";

import { useEffect, useState } from "react";

type Theme = "matrix" | "telegram" | "violet" | "amber" | "pink" | "paper";

const THEMES: { id: Theme; label: string; color: string; glow: string }[] = [
  { id: "matrix",   label: "matrix",   color: "#00ff41", glow: "rgba(0, 255, 65, 0.65)" },
  { id: "telegram", label: "telegram", color: "#229ED9", glow: "rgba(34, 158, 217, 0.65)" },
  { id: "violet",   label: "violet",   color: "#9d4edd", glow: "rgba(157, 78, 221, 0.65)" },
  { id: "amber",    label: "amber",    color: "#ffb000", glow: "rgba(255, 176, 0, 0.65)" },
  { id: "pink",     label: "pink",     color: "#ff0080", glow: "rgba(255, 0, 128, 0.65)" },
  { id: "paper",    label: "paper",    color: "#fbf1c7", glow: "rgba(181, 118, 20, 0.55)" },
];

const STORAGE_KEY = "finekot-theme";
const DEFAULT: Theme = "matrix";

function isTheme(v: string | null): v is Theme {
  return v !== null && THEMES.some((t) => t.id === v);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(DEFAULT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let initial: Theme = DEFAULT;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Migrate legacy values: "dark" → matrix, "light" → paper
      if (stored === "dark") initial = "matrix";
      else if (stored === "light") initial = "paper";
      else if (isTheme(stored)) initial = stored;
    } catch {}
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setMounted(true);
  }, []);

  const pick = (next: Theme) => {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  };

  if (!mounted) return null;

  return (
    <div className="theme-picker" role="radiogroup" aria-label="Terminal color theme">
      {THEMES.map((t) => {
        const active = t.id === theme;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${t.label} theme`}
            title={t.label}
            onClick={() => pick(t.id)}
            className="theme-swatch"
            data-active={active ? "true" : "false"}
            style={{
              background: t.color,
              boxShadow: active
                ? `0 0 0 1.5px var(--bg), 0 0 0 3px ${t.color}, 0 0 14px ${t.glow}`
                : `0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 6px ${t.glow}`,
            }}
          />
        );
      })}
    </div>
  );
}
