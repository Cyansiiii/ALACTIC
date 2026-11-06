"use client";
/**
 * Animated verification checklist (PRD §9). Results reveal one by one; each row
 * has pass / fail / unknown / not-applicable with distinct icon + text.
 */
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { CheckStatus, VerifyCheck, VerifyCheckId, VerifyResult } from "@/lib/api/schema";
import { Hash } from "@/components/ui/hash";
import { StatusIcon, type StatusTone } from "@/components/ui/status";
import { duration, ease, spring } from "@/lib/motion/tokens";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { cn } from "@/lib/utils";

export const CHECK_META: Record<VerifyCheckId, { title: string; means: string }> = {
  turn_chain: { title: "Turn hash chain", means: "No turn was edited or reordered." },
  signature: { title: "Signature vs ENS receipt key", means: "The named agent produced this receipt." },
  receipt_hash: { title: "On-chain receiptHash", means: "This is the receipt the payout was made under." },
  snapshot_root: { title: "Snapshot root vs on-chain and ENS", means: "The payout matches what the owner committed in advance." },
  amount_leaf: { title: "Amount equals the leaf", means: "Exactly the committed amount went to the committed address." },
  inference: { title: "0G model and TEE status", means: "Declared model and provider were used. Trust level: TEE attestation." },
  tier3_approval: { title: "Tier-3 approver and delay", means: "Approver signature and time delay were present." },
};

const ORDER: VerifyCheckId[] = ["turn_chain", "signature", "receipt_hash", "snapshot_root", "amount_leaf", "inference", "tier3_approval"];

const TONE: Record<CheckStatus, StatusTone> = { pass: "verified", fail: "danger", unknown: "unknown", skipped: "neutral" };
const LABEL: Record<CheckStatus, string> = { pass: "Pass", fail: "Fail", unknown: "Unknown", skipped: "Not applicable" };

export function summarize(checks: VerifyCheck[]) {
  const fail = checks.filter((c) => c.status === "fail").length;
  const unknown = checks.filter((c) => c.status === "unknown").length;
  const pass = checks.filter((c) => c.status === "pass").length;
  const applicable = checks.filter((c) => c.status !== "skipped").length;
  // Fallback inference alone doesn't invalidate a payout: amounts never come from the model.
  const inferenceOnly = fail === 1 && checks.find((c) => c.id === "inference")?.status === "fail";
  return { fail, unknown, pass, applicable, inferenceOnly };
}

export function CheckList({ result, running }: { result: VerifyResult | null; running: boolean }) {
  const reduced = usePrefersReducedMotion();
  // Parent re-keys this component per result, so state starts fresh each run.
  const [revealed, setRevealed] = useState(reduced ? ORDER.length : 0);
  const [openId, setOpenId] = useState<VerifyCheckId | null>(null);

  useEffect(() => {
    if (!result || reduced) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= ORDER.length) clearInterval(id);
    }, 380);
    return () => clearInterval(id);
  }, [result, reduced]);

  const byId = new Map(result?.checks.map((c) => [c.id, c]));
  const done = !!result && (reduced || revealed >= ORDER.length);
  const s = result ? summarize(result.checks) : null;

  return (
    <div>
      <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface/50">
        {ORDER.map((id, i) => {
          const check = byId.get(id);
          const shown = !!check && (reduced || i < revealed);
          const checking = (running && !result) || (!!result && i === revealed && !shown);
          const open = openId === id && shown;
          return (
            <li key={id}>
              <button
                type="button"
                disabled={!shown || !check?.evidence.length}
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : id)}
                className="flex w-full items-start gap-4 px-5 py-4 text-left enabled:hover:bg-surface-2/40"
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center">
                  <AnimatePresence mode="wait" initial={false}>
                    {shown ? (
                      <motion.span key="s" initial={{ scale: 0, rotate: -60 }} animate={{ scale: 1, rotate: 0 }} transition={spring.snappy}>
                        <StatusIcon tone={TONE[check!.status]} size={20} />
                      </motion.span>
                    ) : checking ? (
                      <motion.span key="c" exit={{ opacity: 0 }} className="size-4 animate-spin rounded-full border-2 border-line-strong border-t-accent" aria-hidden />
                    ) : (
                      <motion.span key="i" exit={{ opacity: 0 }} className="size-2 rounded-full bg-line-strong" aria-hidden />
                    )}
                  </AnimatePresence>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <span className="font-medium text-fg">
                      <span className="mr-2 font-mono text-micro text-fg-subtle">{i + 1}</span>
                      {CHECK_META[id].title}
                    </span>
                    <span className={cn("font-mono text-micro uppercase tracking-wider", shown ? { pass: "text-verified", fail: "text-danger", unknown: "text-fg-muted", skipped: "text-fg-subtle" }[check!.status] : "text-fg-subtle")}>
                      {shown ? LABEL[check!.status] : checking ? "Checking…" : "Pending"}
                    </span>
                  </span>
                  <span className="mt-1 block text-small text-fg-muted">{shown ? check!.detail : CHECK_META[id].means}</span>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.dl
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: duration.base, ease: ease.out }}
                    className="overflow-hidden bg-bg-elev/60"
                  >
                    <div className="space-y-2 px-5 py-4 pl-[3.75rem]">
                      {check!.evidence.map((e) => (
                        <div key={e.label} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-small">
                          <dt className="text-fg-subtle">{e.label}</dt>
                          <dd className="min-w-0">{e.mono && e.value.startsWith("0x") ? <Hash value={e.value} head={10} tail={8} /> : <span className="text-fg">{e.value}</span>}</dd>
                        </div>
                      ))}
                    </div>
                  </motion.dl>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      <div aria-live="polite" className="mt-4 min-h-14">
        <AnimatePresence>
          {done && s && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: duration.slow, ease: ease.out }}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3",
                s.inferenceOnly ? "border-warn/30 bg-warn-soft" : s.fail ? "border-danger/30 bg-danger-soft" : s.unknown ? "border-line-strong bg-surface-2" : "border-verified/30 bg-verified-soft",
              )}
            >
              <StatusIcon tone={s.inferenceOnly ? "warn" : s.fail ? "danger" : s.unknown ? "unknown" : "verified"} size={20} />
              <p className="text-small text-fg">
                {s.inferenceOnly
                  ? "Payout checks passed, but the inference was NOT verified on 0G. The amount still came from the snapshot."
                  : s.fail
                  ? `${s.fail} of ${s.applicable} applicable checks failed. Do not trust this receipt.`
                  : s.unknown
                    ? `${s.pass} passed, ${s.unknown} could not be confirmed.`
                    : `All ${s.applicable} applicable checks passed.`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
