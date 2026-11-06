"use client";
/**
 * Chooses how to show the hero vault:
 *  - desktop + motion allowed → lazy-loaded R3F scene, poster until first frame
 *  - mobile / Save-Data / reduced motion → static poster only (no three.js download)
 */
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { heroMotion } from "@/lib/motion/hero-store";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { useTheme } from "@/lib/use-theme";
import { cn } from "@/lib/utils";

const VaultScene = dynamic(() => import("./vault-scene"), { ssr: false });

const noopSubscribe = () => () => {};
function useSaveData() {
  return useSyncExternalStore(
    noopSubscribe,
    () => !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
    () => false,
  );
}

export function HeroObject({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const desktop = useMediaQuery("(min-width: 768px)");
  const saveData = useSaveData();
  const { theme } = useTheme();
  const wrap = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [onscreen, setOnscreen] = useState(true);

  const live = desktop && !reduced && !saveData;

  useEffect(() => {
    heroMotion.animate = !reduced;
  }, [reduced]);

  useEffect(() => {
    if (!live || !wrap.current) return;
    const io = new IntersectionObserver(([e]) => setOnscreen(e.isIntersecting), { rootMargin: "100px" });
    io.observe(wrap.current);
    const onMove = (e: PointerEvent) => {
      heroMotion.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      heroMotion.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [live]);

  return (
    <div ref={wrap} className={cn("relative", className)} aria-hidden>
      <Image
        src={theme === "light" ? "/hero/vault-poster-light.webp" : "/hero/vault-poster.webp"}
        alt=""
        fill
        priority
        sizes="(min-width: 768px) 60vw, 120vw"
        className={cn("object-contain transition-opacity duration-700", live && ready ? "opacity-0" : "opacity-100")}
      />
      {live && (
        <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}>
          <VaultScene theme={theme} active={onscreen} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
