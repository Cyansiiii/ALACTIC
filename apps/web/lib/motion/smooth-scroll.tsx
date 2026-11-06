"use client";
/**
 * Lenis smooth scroll, driven by GSAP's ticker so Lenis and ScrollTrigger share
 * one clock. Disabled entirely under prefers-reduced-motion.
 *
 * Opt a scroll area out (chat log, code blocks, drawers) with `data-lenis-prevent`.
 */
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "./gsap";
import { usePrefersReducedMotion } from "./use-reduced-motion";

const LenisContext = createContext<() => Lenis | null>(() => null);

/** Returns a getter for the Lenis instance (null under reduced motion or before mount). */
export const useLenis = () => useContext(LenisContext);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const getLenis = useCallback(() => lenisRef.current, []);

  useEffect(() => {
    if (reduced) return;

    const instance = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      smoothWheel: true,
      // Touch devices keep native momentum scrolling; it's already smooth.
      syncTouch: false,
    });

    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000); // gsap time is seconds
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = instance;

    return () => {
      gsap.ticker.remove(tick);
      instance.off("scroll", ScrollTrigger.update);
      instance.destroy();
      gsap.ticker.lagSmoothing(500, 33); // restore GSAP default
      lenisRef.current = null;
    };
  }, [reduced]);

  // New route: jump to top and let ScrollTrigger re-measure the new layout.
  useLayoutEffect(() => {
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return <LenisContext.Provider value={getLenis}>{children}</LenisContext.Provider>;
}
