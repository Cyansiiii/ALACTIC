"use client";
/**
 * ENS agent identity badge (PRD A1). Shows "Verified agent" ONLY when the
 * identity was resolved live from ENS (source === "ens"). A hard-coded
 * fallback is labelled as such.
 */
import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { useAgent } from "@/lib/api/hooks";
import { addressUrl } from "@/lib/config";
import { spring } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";
import { Hash } from "@/components/ui/hash";
import { StatusIcon } from "@/components/ui/status";
import { Skeleton } from "@/components/ui/skeleton";

export function AgentBadge({ className, align = "right" }: { className?: string; align?: "left" | "right" }) {
  const { data: agent, isLoading, isError } = useAgent();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (isLoading) return <Skeleton className={cn("h-9 w-40 rounded-full", className)} />;
  if (isError || !agent)
    return (
      <span className={cn("inline-flex h-9 items-center gap-2 rounded-full border border-danger/30 px-3 text-small text-danger", className)}>
        <StatusIcon tone="danger" size={14} /> Agent unresolved
      </span>
    );

  const live = agent.source === "ens";

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-full border pl-2 pr-3.5 text-small transition-colors",
          live ? "border-verified/30 bg-verified-soft text-fg" : "border-line-strong bg-surface-2/60 text-fg",
        )}
      >
        <StatusIcon tone={live ? "verified" : "warn"} size={15} />
        <span className="font-medium">{live ? "Verified agent" : "Agent"}</span>
        <span className="hidden font-mono text-micro text-fg-muted xl:inline">{agent.ensName}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="Agent identity from ENS"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={spring.snappy}
            className={cn("glass absolute top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-lg p-4", align === "right" ? "right-0" : "left-0")}
          >
            <p className="label-bracket">Agent identity</p>
            <p className="mt-2 font-mono text-small text-fg">{agent.ensName}</p>
            <p className={cn("mt-1 flex items-center gap-1.5 text-micro", live ? "text-verified" : "text-warn")}>
              <StatusIcon tone={live ? "verified" : "warn"} size={12} />
              {live ? "Resolved live from ENS" : "Static fallback, not resolved live from ENS"}
            </p>
            <dl className="mt-4 space-y-2.5 text-small">
              {[
                ["Receipt key", agent.receiptKey, addressUrl(agent.receiptKey)],
                ["Vault", agent.vault, addressUrl(agent.vault)],
                ["Policy hash", agent.policyHash, undefined],
              ].map(([label, value, href]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <dt className="text-fg-muted">{label}</dt>
                  <dd>
                    <Hash value={value!} href={href} />
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3">
                <dt className="text-fg-muted">Committed roots</dt>
                <dd className="font-mono text-micro text-fg">{Object.keys(agent.incidentRoots).join(" · ")}</dd>
              </div>
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
