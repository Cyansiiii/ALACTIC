"use client";
/** Minimal toast system: store + <Toaster/>. Announced via aria-live. */
import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";
import { spring } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";
import { StatusIcon, type StatusTone } from "./status";

type Toast = { id: number; tone: StatusTone; title: string; description?: string };

let toasts: Toast[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
let nextId = 1;

export function toast(t: Omit<Toast, "id">, ms = 5000) {
  const id = nextId++;
  toasts = [...toasts, { ...t, id }].slice(-4);
  emit();
  setTimeout(() => dismiss(id), ms);
  return id;
}

export function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

const EMPTY: Toast[] = [];

export function Toaster() {
  const list = useSyncExternalStore(
    (cb) => (listeners.add(cb), () => listeners.delete(cb)),
    () => toasts,
    () => EMPTY,
  );
  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
    >
      <AnimatePresence initial={false}>
        {list.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={spring.snappy}
            role="status"
            className={cn("glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg p-4")}
          >
            <StatusIcon tone={t.tone} className="mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-small font-medium text-fg">{t.title}</p>
              {t.description && <p className="mt-0.5 text-small text-fg-muted">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="-m-1 rounded p-1 text-fg-subtle hover:text-fg"
              aria-label="Dismiss notification"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
