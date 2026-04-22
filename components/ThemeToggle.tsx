"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (typeof window !== "undefined" && (localStorage.getItem("finekot-theme") as Theme | null)) || null;
    const initial: Theme = stored === "light" ? "light" : "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("finekot-theme", next); } catch {}
  };

  if (!mounted) return null;

  const label = theme === "dark" ? "[ LIGHT ]" : "[ DARK ]";
  const aria = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={aria}
      title={aria}
      className="theme-toggle"
    >
      {label}
    </button>
  );
}
