"use client";
/** Desktop-only cursor follower. Grows over interactive elements. Off for touch and reduced motion. */
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";

export function CursorFollower() {
  const dot = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = dot.current;
    if (!el || !matchMedia("(pointer: fine)").matches || document.documentElement.dataset.motion !== "on") return;
    gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const x = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
    let hover = false;
    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
      const interactive = !!(e.target as Element)?.closest?.("a,button,[role=button],input,textarea,select,label");
      if (interactive !== hover) {
        hover = interactive;
        gsap.to(el, { scale: hover ? 2.4 : 1, duration: 0.35, ease: "expo.out" });
      }
    };
    const show = () => gsap.to(el, { autoAlpha: 1, duration: 0.3 });
    const hide = () => gsap.to(el, { autoAlpha: 0, duration: 0.3 });
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerenter", show);
    document.addEventListener("pointerleave", hide);
    window.addEventListener("pointermove", show, { once: true });
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerenter", show);
      document.removeEventListener("pointerleave", hide);
    };
  });
  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[95] size-3 rounded-full border border-fg/60 bg-fg/10 mix-blend-difference"
      style={{ visibility: "hidden" }}
    />
  );
}
