import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge our token font sizes so `text-small` isn't mistaken for a color.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display-2xl", "display-xl", "h1", "h2", "h3", "body-lg", "body", "small", "micro"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 0x1234…abcd */
export function shortHex(value: string, head = 6, tail = 4) {
  if (!value || value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/** Integer USD cents → "$412.37". Amounts are always cents (PRD §5). */
export function formatCents(cents: number, opts: { compact?: boolean } = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.compact && cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
