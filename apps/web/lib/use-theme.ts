"use client";
import { useCallback, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type Theme } from "./theme";

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

const read = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);
  const setTheme = useCallback((t: Theme) => {
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {}
  }, []);
  const toggle = useCallback(() => setTheme(read() === "dark" ? "light" : "dark"), [setTheme]);
  return { theme, setTheme, toggle };
}
