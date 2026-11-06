"use client";
import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/lib/motion/magnetic";
import { useSplitReveal } from "@/lib/motion/reveal";

export function FinalCta() {
  const h = useSplitReveal<HTMLHeadingElement>({ scroll: true });
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden border-t border-line">
      <div aria-hidden className="hairline-grid absolute inset-0 opacity-50" />
      <div aria-hidden className="absolute left-1/2 top-full size-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-strong/25 blur-[140px]" />
      <div className="container-x relative flex flex-col items-center py-32 text-center md:py-44">
        <p className="label-bracket">Try it</p>
        <h2 id="cta-title" ref={h} data-reveal className="mt-6 max-w-4xl font-display text-display-xl font-semibold text-fg">
          Ask for a refund. Then try to <em className="font-serif font-normal italic">steal one.</em>
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Magnetic>
            <ButtonLink href="/app" variant="accent" size="lg">
              Try a claim <ArrowIcon />
            </ButtonLink>
          </Magnetic>
          <Magnetic strength={0.25}>
            <ButtonLink href="/attack" variant="outline" size="lg">
              See it fail to steal
            </ButtonLink>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
