/** Theme handling. Dark is the default; the inline script prevents a flash before hydration. */
export type Theme = "dark" | "light";
export const THEME_STORAGE_KEY = "alactic-theme";

/**
 * Runs before first paint: applies the saved theme, and sets data-motion="on"
 * when the user hasn't asked for reduced motion (enables [data-reveal] hiding).
 */
export const themeInitScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");d.dataset.theme=(t==="light"||t==="dark")?t:"dark"}catch(e){d.dataset.theme="dark"}if(!matchMedia("(prefers-reduced-motion: reduce)").matches)d.dataset.motion="on"})()`;
