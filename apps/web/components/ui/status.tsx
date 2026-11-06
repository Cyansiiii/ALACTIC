/**
 * Status vocabulary. Every tone has a distinct ICON SHAPE and a text label, so
 * meaning never depends on color alone (WCAG 1.4.1).
 */
import { cn } from "@/lib/utils";

export type StatusTone = "verified" | "danger" | "warn" | "unknown" | "accent" | "neutral";

const toneClass: Record<StatusTone, string> = {
  verified: "text-verified bg-verified-soft border-verified/30",
  danger: "text-danger bg-danger-soft border-danger/30",
  warn: "text-warn bg-warn-soft border-warn/30",
  unknown: "text-fg-muted bg-surface-2 border-line-strong",
  accent: "text-accent bg-accent-soft border-accent/30",
  neutral: "text-fg-muted bg-surface-2 border-line",
};

export function StatusIcon({ tone, className, size = 16 }: { tone: StatusTone; className?: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 16 16", "aria-hidden": true, className: cn("shrink-0", className) } as const;
  const stroke = { stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
  switch (tone) {
    case "verified":
      return (
        <svg {...common} className={cn(common.className, "text-verified")}>
          <circle cx="8" cy="8" r="7" {...stroke} />
          <path d="M5 8.2l2 2 4-4.4" {...stroke} />
        </svg>
      );
    case "danger":
      return (
        <svg {...common} className={cn(common.className, "text-danger")}>
          <path d="M8 1.5l6.5 6.5L8 14.5 1.5 8z" {...stroke} />
          <path d="M6 6l4 4M10 6l-4 4" {...stroke} />
        </svg>
      );
    case "warn":
      return (
        <svg {...common} className={cn(common.className, "text-warn")}>
          <path d="M8 1.8l6.6 11.7H1.4z" {...stroke} />
          <path d="M8 6.2v3.3M8 11.6v.1" {...stroke} />
        </svg>
      );
    case "unknown":
      return (
        <svg {...common} className={cn(common.className, "text-fg-muted")}>
          <circle cx="8" cy="8" r="7" {...stroke} strokeDasharray="2.4 2" />
          <path d="M6.3 6.2a1.8 1.8 0 113 1.4c-.6.4-1.3.8-1.3 1.6M8 11.4v.1" {...stroke} />
        </svg>
      );
    case "accent":
      return (
        <svg {...common} className={cn(common.className, "text-accent")}>
          <circle cx="8" cy="8" r="3" fill="currentColor" />
          <circle cx="8" cy="8" r="7" {...stroke} opacity=".4" />
        </svg>
      );
    default:
      return (
        <svg {...common} className={cn(common.className, "text-fg-subtle")}>
          <circle cx="8" cy="8" r="2.5" fill="currentColor" />
        </svg>
      );
  }
}

export function StatusChip({
  tone,
  children,
  className,
  icon = true,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
  icon?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-micro font-medium uppercase tracking-[0.06em]",
        toneClass[tone],
        className,
      )}
    >
      {icon && <StatusIcon tone={tone} size={13} />}
      {children}
    </span>
  );
}
