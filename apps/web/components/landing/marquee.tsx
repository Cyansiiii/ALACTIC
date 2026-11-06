"use client";
/** Infinite marquee driven by GSAP (pauses on hover, stops under reduced motion). */
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";

export function Marquee({ items, className, speed = 40 }: { items: React.ReactNode[]; className?: string; speed?: number }) {
  const track = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = track.current;
      if (!el || document.documentElement.dataset.motion !== "on") return;
      const tween = gsap.to(el, { xPercent: -50, duration: speed, ease: "none", repeat: -1 });
      const pause = () => tween.pause();
      const play = () => tween.play();
      el.addEventListener("pointerenter", pause);
      el.addEventListener("pointerleave", play);
      return () => {
        el.removeEventListener("pointerenter", pause);
        el.removeEventListener("pointerleave", play);
      };
    },
    { scope: track },
  );
  return (
    <div className={cn("overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]", className)}>
      <div ref={track} className="flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {items.map((it, i) => (
              <li key={i} className="shrink-0 px-6">
                {it}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
