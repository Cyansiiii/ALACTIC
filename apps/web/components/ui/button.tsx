import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,border-color,color,box-shadow,opacity] duration-[var(--dur-base)] ease-[var(--ease-out)] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Fancy-style solid: inverted fg/bg reads as the most confident action.
  primary: "bg-fg text-fg-inverse hover:bg-fg/90",
  accent:
    "bg-[linear-gradient(135deg,var(--accent-strong),color-mix(in_oklab,var(--accent-strong)_70%,#9d8cff))] text-accent-fg shadow-glow hover:brightness-110",
  ghost: "bg-surface-2/60 text-fg hover:bg-surface-2 border border-line",
  outline: "border border-line-strong text-fg hover:border-fg/40 hover:bg-surface-2/50",
  danger: "bg-danger-soft text-danger border border-danger/40 hover:bg-danger/20",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-small",
  md: "h-11 px-5 text-small",
  lg: "h-14 px-7 text-body",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
});

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: { href: string; variant?: Variant; size?: Size; className?: string; children: React.ReactNode } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>) {
  const cls = cn(base, variants[variant], sizes[size], className);
  if (href.startsWith("http")) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className={cn("shrink-0", className)}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
