"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "matrix" | "vanilla";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "matrix",
  setTheme: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("matrix");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    const initial: Theme = saved === "vanilla" || saved === "matrix" ? saved : "matrix";
    setThemeState(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const toggle = () => setTheme(theme === "matrix" ? "vanilla" : "matrix");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
