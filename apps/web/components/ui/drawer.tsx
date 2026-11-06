"use client";
/** Side drawer (Framer spring). Esc closes, focus moves in and returns, page scroll locked. */
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef } from "react";
import { useLenis } from "@/lib/motion/smooth-scroll";
import { duration, spring } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const getLenis = useLenis();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => panel.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lenis?.start();
      prev?.focus?.();
    };
  }, [open, onClose, getLenis]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            className="absolute inset-0 bg-bg/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.base }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            data-lenis-prevent
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={spring.drawer}
            className={cn(
              "absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l border-line bg-bg-elev shadow-3 outline-none",
              className,
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line p-6">
              <div>
                <h2 id={titleId} className="font-display text-h3 font-semibold text-fg">{title}</h2>
                {description && <p className="mt-1 text-small text-fg-muted">{description}</p>}
              </div>
              <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-fg-muted hover:text-fg" aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
