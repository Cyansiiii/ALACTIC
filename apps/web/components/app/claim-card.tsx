"use client";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import type { ClaimResult, Ticket } from "@/lib/api/schema";
import { describeVaultError } from "@/lib/chain/errors";
import { txUrl } from "@/lib/config";
import { duration, ease, spring } from "@/lib/motion/tokens";
import { Button, ArrowIcon, ButtonLink } from "@/components/ui/button";
import { Hash } from "@/components/ui/hash";
import { StatusChip, StatusIcon } from "@/components/ui/status";
import { formatCents } from "@/lib/utils";

export function ClaimCard({
  ticket,
  result,
  pending,
  error,
  onClaim,
}: {
  ticket: Ticket;
  result: ClaimResult | null;
  pending: boolean;
  error: Error | null;
  onClaim: () => void;
}) {
  const e = ticket.eligibility!;
  const t3 = ticket.tier === 3;
  const paid = result?.status === "paid";
  const reverted = result?.status === "reverted";

  return (
    <motion.div layout transition={spring.soft} className="overflow-hidden rounded-xl border border-line bg-surface shadow-2">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="label-bracket">Eligible claim</span>
          <StatusChip tone={t3 ? "accent" : "verified"}>Tier {ticket.tier}</StatusChip>
        </div>
        <span className="font-mono text-micro text-fg-subtle">{e.incidentId}</span>
      </div>

      <div className="grid gap-6 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-small text-fg-muted">Committed amount</p>
          <p className="mt-1 font-display text-display-xl font-medium leading-none text-fg">{formatCents(e.amountCents)}</p>
          <p className="mt-3 text-small text-fg-muted">
            From the snapshot leaf, not from the AI. Paid to <Hash value={e.beneficiary} className="align-middle" />
          </p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-small">
          <dt className="text-fg-subtle">Leaf</dt>
          <dd><Hash value={e.leaf} /></dd>
          <dt className="text-fg-subtle">Root</dt>
          <dd><Hash value={e.root} /></dd>
          <dt className="text-fg-subtle">Proof</dt>
          <dd className="font-mono text-[0.8125rem] text-fg">{e.proof.length} hashes</dd>
        </dl>
      </div>

      <div className="border-t border-line bg-bg-elev/60 px-5 py-4" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {paid ? (
            <motion.div key="paid" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: duration.slow, ease: ease.out }} className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-fg">
                <StatusIcon tone="verified" /> Paid {formatCents(result!.amountCents)} · <Hash value={result!.txHash!} href={txUrl(result!.txHash!)} />
              </p>
              <ButtonLink href={`/verify?receipt=${result!.receiptHash}`} variant="outline" size="sm">
                Verify receipt <ArrowIcon />
              </ButtonLink>
            </motion.div>
          ) : reverted ? (
            <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3" role="alert">
              <StatusIcon tone="danger" className="mt-1" />
              <div>
                <p className="font-mono text-small text-danger">{result!.errorName}()</p>
                <p className="text-small text-fg-muted">{describeVaultError(result!.errorName).explanation}</p>
              </div>
            </motion.div>
          ) : t3 ? (
            <motion.div key="t3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-small text-fg">
                <StatusIcon tone="accent" /> Awaiting approver signature, then a 10-minute delay.
              </p>
              <ButtonLink href="/approver" variant="outline" size="sm">
                Open approver console <ArrowIcon />
              </ButtonLink>
            </motion.div>
          ) : (
            <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-small text-fg-muted">{pending ? "Session key submitted disburse(). Waiting for Sepolia…" : "The vault re-checks everything on-chain before paying."}</p>
              <Button variant="accent" onClick={onClaim} disabled={pending}>
                {pending ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-accent-fg/30 border-t-accent-fg" aria-hidden /> Executing
                  </>
                ) : (
                  <>Claim {formatCents(e.amountCents)}</>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        {error && (
          <p role="alert" className="mt-3 flex items-center gap-2 text-small text-danger">
            <StatusIcon tone="danger" size={14} /> {error.message}
          </p>
        )}
      </div>
      {t3 && !paid && (
        <p className="border-t border-line px-5 py-3 text-micro text-fg-subtle">
          Tier 3 never auto-pays. See the <Link href="/approver" className="underline underline-offset-2">approver queue</Link>.
        </p>
      )}
    </motion.div>
  );
}
