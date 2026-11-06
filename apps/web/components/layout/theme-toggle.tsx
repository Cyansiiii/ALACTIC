"use client";
import { useTheme } from "@/lib/use-theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className={cn("grid size-9 place-items-center rounded-full border border-line bg-surface-2/60 text-fg-muted transition-colors hover:text-fg", className)}
    >
      {/* Both icons rendered; CSS picks one → no hydration mismatch. */}
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="hidden dark:block">
        <circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3 3l1.1 1.1M11.9 11.9L13 13M3 13l1.1-1.1M11.9 4.1L13 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="block dark:hidden">
        <path d="M13.5 9.6A5.8 5.8 0 016.4 2.5a5.8 5.8 0 107.1 7.1z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
