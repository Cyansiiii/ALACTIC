/** Theme handling. Dark is the default; the inline script prevents a flash before hydration. */
export type Theme = "dark" | "light";
export const THEME_STORAGE_KEY = "alactic-theme";

export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");document.documentElement.dataset.theme=(t==="light"||t==="dark")?t:"dark"}catch(e){document.documentElement.dataset.theme="dark"}})()`;
