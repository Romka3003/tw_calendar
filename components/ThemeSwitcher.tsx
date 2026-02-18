"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "desk-booking-theme";

function getStoredTheme(): "light" | "dark" | null {
  if (typeof window === "undefined") return null;
  const t = localStorage.getItem(THEME_KEY);
  if (t === "light" || t === "dark") return t;
  return null;
}

function setStoredTheme(theme: "light" | "dark") {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = getStoredTheme();
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", initial);
    setThemeState(initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    setStoredTheme(next);
  };

  if (!mounted) {
    return (
      <div className="theme-switcher h-[34px] w-[60px] rounded-full bg-zinc-300 dark:bg-zinc-600" />
    );
  }

  return (
    <label className="theme-switcher cursor-pointer" aria-label="Переключить тему">
      <input
        type="checkbox"
        checked={theme === "dark"}
        onChange={toggle}
        className="sr-only"
      />
      <span className="slider round block h-full w-full" />
    </label>
  );
}
