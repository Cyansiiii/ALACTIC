"use client";
/**
 * Scroll/mount reveal helpers (GSAP). Elements marked [data-reveal] are hidden
 * by CSS only when <html data-motion="on"> (set pre-paint when motion is allowed),
 * so no-JS and reduced-motion users always see content.
 */
import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "./gsap";
import { gsapEase } from "./tokens";

/** Masked line-by-line headline reveal. Re-splits on resize/font load. */
export function useSplitReveal<T extends HTMLElement>(opts: { scroll?: boolean; delay?: number; stagger?: number } = {}) {
  const ref = useRef<T>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || document.documentElement.dataset.motion !== "on") return;
      let split: SplitText | undefined;
      document.fonts.ready.then(() => {
        if (!ref.current) return;
        split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            gsap.set(el, { autoAlpha: 1 });
            return gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.1,
              ease: gsapEase.out,
              stagger: opts.stagger ?? 0.09,
              delay: opts.delay ?? 0,
              scrollTrigger: opts.scroll ? { trigger: el, start: "top 85%", once: true } : undefined,
            });
          },
        });
      });
      return () => split?.revert();
    },
    { scope: ref },
  );
  return ref;
}

/** Fade-up children marked [data-reveal-item] in sequence when the container enters. */
export function useStaggerReveal<T extends HTMLElement>(opts: { y?: number; stagger?: number; start?: string; delay?: number } = {}) {
  const ref = useRef<T>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || document.documentElement.dataset.motion !== "on") return;
      const items = el.querySelectorAll<HTMLElement>("[data-reveal-item]");
      const targets = items.length ? items : [el];
      gsap.set(el, { autoAlpha: 1 });
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y: opts.y ?? 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: gsapEase.out,
          stagger: opts.stagger ?? 0.08,
          delay: opts.delay ?? 0,
          scrollTrigger: { trigger: el, start: opts.start ?? "top 82%", once: true },
        },
      );
    },
    { scope: ref },
  );
  return ref;
}

export { ScrollTrigger };
