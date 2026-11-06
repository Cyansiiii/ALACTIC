"use client";
import { useState } from "react";
import { cn, shortHex } from "@/lib/utils";

/** Mono hash/address with full value in title + copy button. */
export function Hash({
  value,
  head = 6,
  tail = 4,
  full = false,
  href,
  className,
  copy = true,
}: {
  value: string;
  head?: number;
  tail?: number;
  full?: boolean;
  href?: string;
  className?: string;
  copy?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const text = full ? value : shortHex(value, head, tail);
  const inner = (
    <span className={cn("font-mono text-[0.8125rem] tracking-tight", full && "break-all")} title={value}>
      {text}
    </span>
  );
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5 text-fg", className)}>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 hover:decoration-accent">
          {inner}
          <span className="sr-only"> (opens block explorer)</span>
        </a>
      ) : (
        inner
      )}
      {copy && (
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard?.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}
          className="rounded p-0.5 text-fg-subtle transition-colors hover:text-fg"
          aria-label={copied ? "Copied" : `Copy ${value}`}
        >
          {copied ? (
            <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden><rect x="5" y="5" width="8.5" height="8.5" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" /><path d="M10.5 3.5V3a.5.5 0 00-.5-.5H3a.5.5 0 00-.5.5v7c0 .3.2.5.5.5h.5" stroke="currentColor" strokeWidth="1.4" fill="none" /></svg>
          )}
        </button>
      )}
    </span>
  );
}
