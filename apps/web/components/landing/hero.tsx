"use client";
import { useRef } from "react";
import { HeroObject } from "@/components/three/hero-object";
import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { Counter } from "@/lib/motion/counter";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { heroMotion } from "@/lib/motion/hero-store";
import { Magnetic } from "@/lib/motion/magnetic";
import { useSplitReveal, useStaggerReveal } from "@/lib/motion/reveal";
import { formatCents } from "@/lib/utils";

const LIMITS = [
  { label: "Per claim", cents: 100_000, note: "Tier 2, automatic" },
  { label: "Session cap", cents: 250_000, note: "Max loss if fully compromised" },
  { label: "Tier 3", cents: 1_000_000, note: "Needs approver + delay" },
];

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const objectRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headline = useSplitReveal<HTMLHeadingElement>({ delay: 0.15 });
  const intro = useStaggerReveal<HTMLDivElement>({ delay: 0.55, start: "top bottom" });

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => (heroMotion.scroll = self.progress),
      });
      if (document.documentElement.dataset.motion !== "on") return () => st.kill();

      // Parallax: object drifts slower than content; content fades as it leaves.
      gsap.to(objectRef.current, {
        yPercent: 18,
        scale: 0.92,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(contentRef.current, {
        y: -80,
        autoAlpha: 0.15,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "center center", end: "bottom top", scrub: true },
      });
      gsap.from(objectRef.current, { autoAlpha: 0, scale: 0.85, duration: 1.8, ease: "expo.out", delay: 0.1 });
      return () => st.kill();
    },
    { scope: section },
  );

  return (
    <section ref={section} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden" aria-labelledby="hero-title">
      {/* Background: hairline grid + accent glow */}
      <div aria-hidden className="hairline-grid absolute inset-0 -z-20 opacity-60" />
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "var(--hero-glow)" }} />
      {/* Scrim keeps the headline legible where the ring passes behind it. */}
      <div aria-hidden className="absolute inset-y-0 left-0 z-0 hidden w-[62%] bg-[radial-gradient(60%_55%_at_25%_48%,var(--bg)_0%,color-mix(in_oklab,var(--bg)_60%,transparent)_45%,transparent_80%)] md:block" />

      {/* Signature object: right-cropped on desktop, rising from the bottom on mobile */}
      <div
        className="pointer-events-none absolute -z-10 aspect-square w-[135vw] max-w-none left-1/2 -translate-x-1/2 bottom-[-58vw] md:bottom-auto md:left-auto md:translate-x-0 md:right-[-20vw] md:top-[46%] md:w-[min(70vw,1000px)] md:-translate-y-1/2 lg:right-[-12vw] xl:right-[-6vw]"
      >
        <div ref={objectRef} className="size-full">
          <HeroObject className="size-full" />
        </div>
      </div>

      <div ref={contentRef} className="container-x relative flex flex-1 flex-col justify-center pb-40 pt-[calc(var(--nav-h)+3rem)] md:pb-28">
        <p className="label-bracket">Verifiable refund agent</p>

        <h1 id="hero-title" ref={headline} data-reveal className="mt-6 max-w-[11ch] font-display text-display-2xl font-semibold text-fg md:max-w-[12ch]">
          It can be fooled. It <em className="font-serif font-normal italic tracking-normal">cannot</em> steal.
        </h1>

        <div ref={intro} data-reveal>
          <p data-reveal-item className="mt-7 max-w-[34rem] text-body-lg text-fg-muted">
            An AI that handles money, but cannot pay anyone outside a committed list. The model explains. The vault decides.
          </p>

          <div data-reveal-item className="mt-9 flex flex-wrap items-center gap-3">
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
      </div>

      {/* Limits strip: hairline-divided, Intelliphy-style bracket labels */}
      <div className="relative border-t border-line bg-bg/40 backdrop-blur-md">
        <dl className="container-x grid grid-cols-3 divide-x divide-line">
          {LIMITS.map((l) => (
            <div key={l.label} className="py-5 pr-3 first:pl-0 [&:not(:first-child)]:pl-4 md:py-7 md:[&:not(:first-child)]:pl-8">
              <dt className="label-bracket whitespace-nowrap !text-[0.625rem] !tracking-[0.04em] md:!text-micro md:!tracking-[0.08em]">{l.label}</dt>
              <dd className="mt-2 font-display text-[1.125rem] font-medium text-fg sm:text-h3 md:text-h2">
                <Counter value={l.cents / 100} format={(n) => formatCents(Math.round(n) * 100, { compact: true })} />
              </dd>
              <dd className="mt-1 hidden text-small text-fg-subtle md:block">{l.note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
