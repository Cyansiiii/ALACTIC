import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-md bg-surface-2",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.6s_infinite] after:bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--fg)_6%,transparent),transparent)]",
        className,
      )}
    />
  );
}
