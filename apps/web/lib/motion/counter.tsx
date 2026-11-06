"use client";
/** Number that counts up when scrolled into view. Renders the final value on the server. */
import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";

export function Counter({ value, format = (n) => Math.round(n).toLocaleString("en-US"), className }: { value: number; format?: (n: number) => string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || document.documentElement.dataset.motion !== "on") return;
      const obj = { n: 0 };
      el.textContent = format(0);
      gsap.to(obj, {
        n: value,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top bottom", once: true },
        onUpdate: () => {
          el.textContent = format(obj.n);
        },
      });
    },
    { scope: ref, dependencies: [value] },
  );
  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
