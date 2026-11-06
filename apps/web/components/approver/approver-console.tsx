"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { InferenceBadge } from "@/components/app/inference-badge";
import { Button } from "@/components/ui/button";
import { Hash } from "@/components/ui/hash";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusChip, StatusIcon, type StatusTone } from "@/components/ui/status";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { toast } from "@/components/ui/toast";
import { WalletButton } from "@/components/wallet/wallet-button";
import { isMock } from "@/lib/api/client";
import { useAgent, useApprovals, useExecuteApproval, useSubmitApproval } from "@/lib/api/hooks";
import type { Approval } from "@/lib/api/schema";
import { approvalTypedData } from "@/lib/chain/eip712";
import { txUrl } from "@/lib/config";
import { duration, ease, spring } from "@/lib/motion/tokens";
import { cn, formatCents } from "@/lib/utils";

type View = "pending" | "delay" | "ready" | "executed" | "expired";

function viewOf(a: Approval, now: number): View {
  if (a.status === "executed") return "executed";
  if (a.status === "expired" || a.intent.deadline * 1000 < now) return "expired";
  if (!a.approvedAt) return "pending";
  return now - Date.parse(a.approvedAt) >= a.delaySeconds * 1000 ? "ready" : "delay";
}

const VIEW_CHIP: Record<View, { tone: StatusTone; label: string }> = {
  pending: { tone: "warn", label: "Needs signature" },
  delay: { tone: "accent", label: "Delay running" },
  ready: { tone: "verified", label: "Ready to execute" },
  executed: { tone: "verified", label: "Paid" },
  expired: { tone: "danger", label: "Expired" },
};

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

export function ApproverConsole() {
  const { data, isLoading, isError, error, refetch } = useApprovals();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const now = useNow(true);

  const selected = useMemo(() => data?.find((a) => a.ticketId === (selectedId ?? data?.[0]?.ticketId)) ?? null, [data, selectedId]);

  if (isLoading)
    return (
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <Skeleton className="h-[32rem] rounded-xl" />
      </div>
    );
  if (isError) return <ErrorState title="Couldn't load the approval queue" error={error} onRetry={() => refetch()} />;
  if (!data?.length) return <EmptyState title="No Tier-3 tickets" description="High-value claims land here when the policy engine finds a leaf above the Tier-2 cap." />;

  const open = data.filter((a) => viewOf(a, now) !== "executed").length;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section aria-labelledby="queue-h">
        <div className="flex items-center justify-between">
          <h2 id="queue-h" className="label-bracket">Queue</h2>
          <span className="font-mono text-micro text-fg-subtle">{open} open</span>
        </div>
        <ul className="mt-4 space-y-2">
          {data.map((a) => {
            const v = viewOf(a, now);
            const active = selected?.ticketId === a.ticketId;
            return (
              <li key={a.ticketId}>
                <button
                  type="button"
                  onClick={() => setSelectedId(a.ticketId)}
                  aria-current={active ? "true" : undefined}
                  className={cn("relative w-full rounded-xl border p-4 text-left transition-colors", active ? "border-accent/50" : "border-line hover:border-line-strong")}
                >
                  {active && <motion.span layoutId="queue-active" transition={spring.snappy} className="absolute inset-0 rounded-xl bg-accent-soft" aria-hidden />}
                  <span className="relative flex items-center justify-between gap-3">
                    <span className="font-display text-h3 font-medium text-fg">{formatCents(a.intent.amountCents)}</span>
                    <StatusChip tone={VIEW_CHIP[v].tone}>{VIEW_CHIP[v].label}</StatusChip>
                  </span>
                  <span className="relative mt-2 flex items-center justify-between text-small text-fg-muted">
                    <span className="font-mono text-[0.75rem]">{a.incidentId} · {a.ticketId.slice(-6)}</span>
                    <span>{new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div key={selected.ticketId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: duration.base, ease: ease.out }}>
            <Detail approval={selected} view={viewOf(selected, now)} now={now} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Detail({ approval: a, view, now }: { approval: Approval; view: View; now: number }) {
  const { data: agent } = useAgent();
  const { address, isConnected } = useAccount();
  const { signTypedDataAsync, isPending: signing } = useSignTypedData();
  const submit = useSubmitApproval();
  const execute = useExecuteApproval();
  const e = a.evidence;
  const wrongWallet = isConnected && address?.toLowerCase() !== a.approver.toLowerCase();

  const sign = async () => {
    try {
      let signature: `0x${string}`;
      if (isConnected && agent) {
        signature = await signTypedDataAsync(approvalTypedData(a.intent, agent.vault as `0x${string}`));
      } else if (isMock()) {
        // MOCK: demo approver signature. Not EIP-712; the real vault would reject it.
        signature = `0x${Array.from(crypto.getRandomValues(new Uint8Array(65)), (b) => b.toString(16).padStart(2, "0")).join("")}`;
      } else return;
      await submit.mutateAsync({ ticketId: a.ticketId, signature });
      toast({ tone: "accent", title: "Approval recorded", description: `${a.delaySeconds >= 60 ? `${Math.round(a.delaySeconds / 60)} min` : `${a.delaySeconds}s`} delay started.` });
    } catch (err) {
      toast({ tone: "danger", title: "Signature not submitted", description: err instanceof Error ? err.message.split("\n")[0] : undefined });
    }
  };

  const run = async () => {
    try {
      const r = await execute.mutateAsync(a.ticketId);
      toast({ tone: "verified", title: `Paid ${formatCents(r.intent.amountCents)}`, description: "disburseTier3 succeeded after approval and delay." });
    } catch (err) {
      toast({ tone: "danger", title: "Execution reverted", description: err instanceof Error ? err.message : undefined });
    }
  };

  const elapsed = a.approvedAt ? (now - Date.parse(a.approvedAt)) / 1000 : 0;
  const remaining = Math.max(0, a.delaySeconds - elapsed);

  return (
    <article className="overflow-hidden rounded-xl border border-line bg-surface/50" aria-labelledby="detail-h">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-6">
        <div>
          <p className="label-bracket">Tier-3 payout intent</p>
          <h2 id="detail-h" className="mt-2 font-display text-display-xl font-medium leading-none text-fg">{formatCents(a.intent.amountCents)}</h2>
          <p className="mt-2 flex items-center gap-2 text-small text-fg-muted">to <Hash value={a.intent.beneficiary} /> · {a.incidentId}</p>
        </div>
        <StatusChip tone={VIEW_CHIP[view].tone}>{VIEW_CHIP[view].label}</StatusChip>
      </header>

      {/* Action rail */}
      <div className="border-b border-line bg-bg-elev/60 p-6" aria-live="polite">
        {view === "pending" && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-md text-small text-fg-muted">
              You are signing an EIP-712 approval for this exact intent. Any change to amount, recipient or deadline invalidates it.
            </p>
            {isConnected ? (
              <Button variant="accent" onClick={sign} disabled={signing || submit.isPending}>
                {signing ? "Confirm in wallet…" : submit.isPending ? "Recording…" : "Sign approval"}
              </Button>
            ) : isMock() ? (
              <div className="flex flex-wrap items-center gap-2">
                <WalletButton />
                <Button variant="ghost" size="sm" onClick={sign} disabled={submit.isPending}>
                  {submit.isPending ? "Recording…" : "Sign as demo approver"}
                </Button>
              </div>
            ) : (
              <WalletButton />
            )}
          </div>
        )}
        {wrongWallet && view === "pending" && (
          <p className="mt-3 flex items-center gap-2 text-small text-warn">
            <StatusIcon tone="warn" size={14} /> Connected wallet is not the configured approver. The vault will reject this signature.
          </p>
        )}
        {(view === "delay" || view === "ready") && (
          <div className="flex flex-wrap items-center justify-between gap-6">
            <Countdown remaining={remaining} total={a.delaySeconds} />
            <Button variant={view === "ready" ? "accent" : "outline"} onClick={run} disabled={view !== "ready" || execute.isPending}>
              {execute.isPending ? "Executing…" : view === "ready" ? "Execute payout" : "Waiting for delay"}
            </Button>
          </div>
        )}
        {view === "executed" && (
          <p className="flex flex-wrap items-center gap-2 text-fg">
            <StatusIcon tone="verified" /> Paid after approval and delay. {a.txHash && <Hash value={a.txHash} href={txUrl(a.txHash)} />}
          </p>
        )}
        {view === "expired" && <p className="flex items-center gap-2 text-danger"><StatusIcon tone="danger" /> Deadline passed. The vault would revert ApprovalExpired.</p>}
      </div>

      <div className="grid gap-8 p-6 xl:grid-cols-2">
        <section>
          <h3 className="label-bracket">Evidence · user question</h3>
          <p className="mt-3 rounded-lg border border-line bg-bg-elev/60 p-4 text-small text-fg">“{e.question}”</p>
          <div className="mt-5 flex items-center justify-between">
            <h3 className="label-bracket">AI explanation</h3>
            <InferenceBadge inference={e.inference} />
          </div>
          <p className="mt-3 text-small leading-relaxed text-fg-muted">{e.aiExplanation.replace(/\*\*/g, "")}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {e.citations.map((c) => (
              <li key={c.chunkHash} className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.6875rem] text-fg-muted" title={c.excerpt}>{c.docId}</li>
            ))}
          </ul>
          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-small">
            <dt className="text-fg-subtle">Model</dt><dd className="font-mono text-[0.8125rem] text-fg">{e.inference.model}</dd>
            <dt className="text-fg-subtle">Provider</dt><dd><Hash value={e.inference.provider} /></dd>
            <dt className="text-fg-subtle">Output hash</dt><dd><Hash value={e.inference.outputHash} /></dd>
          </dl>
        </section>

        <section>
          <h3 className="label-bracket">Snapshot leaf</h3>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border border-line p-4 text-small">
            <dt className="text-fg-subtle">Amount</dt><dd className="text-fg">{formatCents(e.eligibility.amountCents)} <span className="text-fg-subtle">· from snapshot</span></dd>
            <dt className="text-fg-subtle">Leaf</dt><dd><Hash value={e.eligibility.leaf} /></dd>
            <dt className="text-fg-subtle">Root</dt><dd><Hash value={e.eligibility.root} /></dd>
            <dt className="text-fg-subtle">Proof</dt>
            <dd className="space-y-1">{e.eligibility.proof.map((p) => <Hash key={p} value={p} head={8} tail={6} className="flex" />)}</dd>
          </dl>
          <h3 className="label-bracket mt-6 block">Intent (what you sign)</h3>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border border-line p-4 text-small">
            <dt className="text-fg-subtle">intentHash</dt><dd><Hash value={a.intentHash} /></dd>
            <dt className="text-fg-subtle">evidenceHash</dt><dd><Hash value={a.intent.evidenceHash} /></dd>
            <dt className="text-fg-subtle">deadline</dt><dd className="text-fg">{new Date(a.intent.deadline * 1000).toLocaleString()}</dd>
            <dt className="text-fg-subtle">approver</dt><dd><Hash value={a.approver} /></dd>
            <dt className="text-fg-subtle">delay</dt><dd className="text-fg">{a.delaySeconds}s after approval</dd>
          </dl>
        </section>
      </div>
    </article>
  );
}

function Countdown({ remaining, total }: { remaining: number; total: number }) {
  const r = 26, c = 2 * Math.PI * r;
  const pct = total ? 1 - remaining / total : 1;
  const mm = Math.floor(remaining / 60), ss = Math.floor(remaining % 60);
  return (
    <div className="flex items-center gap-4">
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--line-strong)" strokeWidth="4" />
        <motion.circle cx="32" cy="32" r={r} fill="none" stroke={remaining ? "var(--accent)" : "var(--verified)"} strokeWidth="4" strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - pct) }} transition={{ duration: 1, ease: "linear" }} />
      </svg>
      <div>
        <p className="font-mono text-h3 text-fg" role="timer" aria-label={remaining ? `${mm} minutes ${ss} seconds remaining` : "Delay elapsed"}>
          {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
        </p>
        <p className="text-small text-fg-muted">{remaining ? "Time-lock: humans can still react" : "Delay elapsed"}</p>
      </div>
    </div>
  );
}
