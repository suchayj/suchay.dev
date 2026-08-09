"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const subscribe = (callback: () => void) => {
  window.addEventListener("suchay-theme-change", callback);
  return () => window.removeEventListener("suchay-theme-change", callback);
};

const getTheme = (): Theme => document.documentElement.dataset.theme === "light" ? "light" : "dark";
const getServerTheme = (): Theme => "dark";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("suchay-theme", next);
    window.dispatchEvent(new Event("suchay-theme-change"));
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Use ${theme === "dark" ? "light" : "dark"} mode`} suppressHydrationWarning>
      <span aria-hidden="true">{theme === "dark" ? "☼" : "◐"}</span>
    </button>
  );
}
