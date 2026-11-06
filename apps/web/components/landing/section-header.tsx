"use client";
import { useSplitReveal, useStaggerReveal } from "@/lib/motion/reveal";
import { cn } from "@/lib/utils";

export function SectionHeader({
  label,
  title,
  description,
  id,
  className,
  align = "left",
}: {
  label: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  id?: string;
  className?: string;
  align?: "left" | "split";
}) {
  const heading = useSplitReveal<HTMLHeadingElement>({ scroll: true });
  const desc = useStaggerReveal<HTMLParagraphElement>({ delay: 0.2 });
  return (
    <div className={cn(align === "split" ? "grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-end" : "max-w-3xl", className)}>
      <div>
        <p className="label-bracket">{label}</p>
        <h2 id={id} ref={heading} data-reveal className="mt-5 font-display text-h1 font-semibold text-fg">
          {title}
        </h2>
      </div>
      {description && (
        <p ref={desc} data-reveal className={cn("text-body-lg text-fg-muted", align === "split" ? "md:pb-2" : "mt-5")}>
          {description}
        </p>
      )}
    </div>
  );
}
