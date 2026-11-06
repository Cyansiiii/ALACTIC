import Link from "next/link";
import { cn } from "@/lib/utils";

/** Mark: a closed ring (the vault) holding a committed core. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={cn("size-7", className)} aria-hidden>
      <defs>
        <linearGradient id="lm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--verified)" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="11.5" fill="none" stroke="url(#lm)" strokeWidth="2.2" />
      <path d="M14 7.5l5.6 3.25v6.5L14 20.5l-5.6-3.25v-6.5z" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5 text-fg", className)} aria-label="ALACTIC home">
      <LogoMark className="transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] group-hover:rotate-[60deg]" />
      <span className="font-display text-[1.15rem] font-semibold tracking-[0.02em]">ALACTIC</span>
    </Link>
  );
}
