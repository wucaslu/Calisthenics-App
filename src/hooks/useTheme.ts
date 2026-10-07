"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

const themeEvent = "calisthenics:theme-change";
const getTheme = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";
const getServerTheme = (): Theme => "dark";

function subscribe(callback: () => void) {
  const sync = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    document.documentElement.dataset.theme =
      event.newValue === "light" ? "light" : "dark";
    callback();
  };
  window.addEventListener(themeEvent, callback);
  window.addEventListener("storage", sync);
  return () => {
    window.removeEventListener(themeEvent, callback);
    window.removeEventListener("storage", sync);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  const toggleTheme = () => {
    const next: Theme = getTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // The current window can still change themes when storage is unavailable.
    }
    window.dispatchEvent(new Event(themeEvent));
  };
  return { theme, toggleTheme };
}
