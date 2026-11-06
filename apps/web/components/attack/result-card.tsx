"use client";
import { motion } from "motion/react";
import type { AttackResult } from "@/lib/api/schema";
import { describeVaultError } from "@/lib/chain/errors";
import { txUrl } from "@/lib/config";
import { spring } from "@/lib/motion/tokens";
import { Hash } from "@/components/ui/hash";
import { StatusIcon } from "@/components/ui/status";
import { cn, formatCents } from "@/lib/utils";
import { ATTACKS } from "./attacks";

export function ResultCard({ result }: { result: AttackResult }) {
  const meta = ATTACKS.find((a) => a.kind === result.kind)!;
  const err = describeVaultError(result.errorName);
  const breached = result.outcome === "paid";

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={spring.soft}
      className={cn("relative overflow-hidden rounded-xl border bg-[#07080d] text-[#eef0f7] shadow-3", breached ? "border-warn/60" : "border-danger/40")}
      aria-label={`Result: ${meta.title}`}
    >
      <div aria-hidden className="absolute -right-24 -top-24 size-72 rounded-full bg-[#ff5c6c]/20 blur-[90px]" />
      <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-3">
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[#a0a6bd]">{meta.title}</span>
        <span className="font-mono text-[0.6875rem] text-[#7d839f]">{new Date(result.at).toLocaleTimeString()}</span>
      </div>

      <div className="relative p-5 md:p-7">
        <motion.p
          initial={{ scale: 1.6, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: -3 }}
          transition={{ ...spring.snappy, delay: 0.15 }}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border-2 px-3 py-1 font-mono text-small font-bold uppercase tracking-[0.18em]",
            breached ? "border-[#f5b544] text-[#f5b544]" : "border-[#ff6b79] text-[#ff6b79]",
          )}
        >
          <StatusIcon tone={breached ? "warn" : "danger"} size={16} />
          {result.outcome === "reverted" ? "Reverted on-chain" : result.outcome === "refused" ? "Refused" : "Paid: invariant broken"}
        </motion.p>

        {result.errorName && (
          <h3 className="mt-5 break-all font-mono text-[clamp(1.5rem,1rem+2.4vw,2.5rem)] font-semibold leading-tight text-[#ff6b79]">
            {result.errorName}({result.errorArgs.join(", ")})
          </h3>
        )}
        <p className="mt-2 text-[#eef0f7]">{err.title}</p>
        <p className="mt-1 text-small text-[#a0a6bd]">{err.explanation}</p>

        {result.aiSaid && (
          <div className="mt-5 rounded-lg border border-[#f5b544]/30 bg-[#f5b544]/10 p-3">
            <p className="font-mono text-[0.6875rem] uppercase tracking-wider text-[#f5b544]">The AI was fooled and said</p>
            <p className="mt-1 text-small text-[#eef0f7]">“{result.aiSaid}”</p>
          </div>
        )}

        <pre className="mt-5 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-[0.75rem] text-[#a0a6bd]" data-lenis-prevent>
          <span className="text-[#5b6180]">call › </span>
          {result.attemptedCall}
        </pre>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 sm:grid-cols-3">
          <div>
            <dt className="text-micro text-[#7d839f]">Attempted</dt>
            <dd className="mt-1 font-display text-h3 text-[#eef0f7]">{formatCents(result.amountAttemptedCents)}</dd>
          </div>
          <div>
            <dt className="text-micro text-[#7d839f]">Money moved to attacker</dt>
            <dd className={cn("mt-1 font-display text-h3", breached ? "text-[#f5b544]" : "text-[#3ddc97]")}>{formatCents(result.amountMovedCents)}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-micro text-[#7d839f]">Stopped by</dt>
            <dd className="mt-1 text-small text-[#eef0f7]">{err.layer}</dd>
          </div>
        </dl>
        {result.txHash && (
          <p className="mt-4 flex items-center gap-2 text-micro text-[#7d839f]">
            Reverted tx <Hash value={result.txHash} href={txUrl(result.txHash)} className="text-[#eef0f7]" />
          </p>
        )}
      </div>
    </motion.article>
  );
}
