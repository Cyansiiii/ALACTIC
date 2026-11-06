"use client";
import { motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusIcon } from "@/components/ui/status";
import { ErrorState } from "@/components/ui/states";
import { getClient } from "@/lib/api/client";
import { useSampleReceipts, useVerifyReceipt } from "@/lib/api/hooks";
import { Receipt } from "@/lib/api/schema";
import { spring } from "@/lib/motion/tokens";
import { cn, formatCents } from "@/lib/utils";
import { CheckList } from "./check-list";

type Tab = "samples" | "paste" | "hash";
const TABS: { id: Tab; label: string }[] = [
  { id: "samples", label: "Sample receipts" },
  { id: "paste", label: "Paste JSON" },
  { id: "hash", label: "By hash" },
];

export function Verifier() {
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>("samples");
  const [json, setJson] = useState("");
  const [hash, setHash] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const samples = useSampleReceipts();
  const verify = useVerifyReceipt();

  const loadReceipt = async (id: string) => {
    setLoadError(null);
    setSelected(id);
    try {
      const r = await getClient().getReceipt(id);
      setJson(JSON.stringify(r, null, 2));
      verify.reset();
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Receipt not found");
    }
  };

  // Deep link from /app: /verify?receipt=0x…
  const deepLink = params.get("receipt");
  useEffect(() => {
    if (!deepLink) return;
    getClient()
      .getReceipt(deepLink)
      .then((r) => {
        setJson(JSON.stringify(r, null, 2));
        setSelected(deepLink);
        verify.mutate(r);
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Receipt not found"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepLink]);

  const parsed = (() => {
    if (!json.trim()) return null;
    try {
      const r = Receipt.safeParse(JSON.parse(json));
      return r.success ? { ok: true as const, receipt: r.data } : { ok: false as const, error: z.prettifyError(r.error) };
    } catch {
      return { ok: false as const, error: "Not valid JSON" };
    }
  })();

  const run = () => parsed?.ok && verify.mutate(parsed.receipt);

  const tamper = () => {
    if (!parsed?.ok) return;
    const r = structuredClone(parsed.receipt);
    r.snapshot.amountCents = r.snapshot.amountCents * 10;
    setJson(JSON.stringify(r, null, 2));
    verify.reset();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section aria-label="Choose a receipt" className="min-w-0">
        <div role="tablist" aria-label="Receipt source" className="inline-flex rounded-full border border-line bg-surface/60 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn("relative rounded-full px-4 py-2 text-small transition-colors", tab === t.id ? "text-fg" : "text-fg-muted hover:text-fg")}
            >
              {tab === t.id && <motion.span layoutId="verify-tab" transition={spring.snappy} className="absolute inset-0 rounded-full bg-surface-2 shadow-1" aria-hidden />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-5">
          {tab === "samples" && (
            <div className="space-y-2" role="tabpanel">
              {samples.isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
              {samples.isError && <ErrorState error={samples.error} onRetry={() => samples.refetch()} />}
              {samples.data?.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => loadReceipt(s.id)}
                  aria-pressed={selected === s.id}
                  className={cn(
                    "flex w-full items-center justify-between gap-4 rounded-lg border p-4 text-left transition-colors",
                    selected === s.id ? "border-accent/50 bg-accent-soft" : "border-line bg-surface/50 hover:border-line-strong",
                  )}
                >
                  <span>
                    <span className="block text-small font-medium text-fg">{s.label}</span>
                    <span className="mt-0.5 block font-mono text-micro text-fg-subtle">{s.id.slice(0, 18)}…</span>
                  </span>
                  <span className="text-small text-accent">Load</span>
                </button>
              ))}
              <p className="pt-2 text-micro text-fg-subtle">Sample receipts come from the mock data layer until the backend is connected.</p>
            </div>
          )}

          {tab === "hash" && (
            <form
              role="tabpanel"
              onSubmit={(e) => {
                e.preventDefault();
                if (hash.trim()) loadReceipt(hash.trim());
              }}
              className="flex gap-2"
            >
              <label htmlFor="rh" className="sr-only">Receipt hash or ticket ID</label>
              <input
                id="rh"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="0x… receipt hash or ticket ID"
                className="h-11 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 font-mono text-small text-fg outline-none placeholder:text-fg-subtle focus:border-accent/60"
              />
              <Button type="submit" variant="primary">Load</Button>
            </form>
          )}
        </div>

        {loadError && (
          <p role="alert" className="mt-4 flex items-center gap-2 text-small text-danger">
            <StatusIcon tone="danger" size={14} /> {loadError}
          </p>
        )}

        <div className={cn("mt-6", tab !== "paste" && !json && "hidden")}>
          <div className="flex items-center justify-between">
            <label htmlFor="receipt-json" className="label-bracket">Receipt JSON</label>
            {parsed?.ok && (
              <span className="text-micro text-fg-subtle">
                Tier {parsed.receipt.policy.tier} · {formatCents(parsed.receipt.snapshot.amountCents)} · {parsed.receipt.snapshot.incidentId}
              </span>
            )}
          </div>
          <textarea
            id="receipt-json"
            data-lenis-prevent
            value={json}
            onChange={(e) => {
              setJson(e.target.value);
              verify.reset();
            }}
            spellCheck={false}
            placeholder='{ "version": "2.1", "ticketId": "…", … }'
            className="mt-2 h-80 w-full resize-y rounded-lg border border-line bg-bg-elev p-4 font-mono text-[0.75rem] leading-relaxed text-fg outline-none placeholder:text-fg-subtle focus:border-accent/60"
          />
          {parsed && !parsed.ok && (
            <pre role="alert" className="mt-2 whitespace-pre-wrap rounded-md bg-danger-soft p-3 font-mono text-micro text-danger">{parsed.error}</pre>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="accent" onClick={run} disabled={!parsed?.ok || verify.isPending}>
              {verify.isPending ? "Verifying…" : "Verify receipt"}
            </Button>
            <Button variant="outline" onClick={tamper} disabled={!parsed?.ok}>
              Tamper: inflate amount ×10
            </Button>
          </div>
        </div>
      </section>

      <section aria-label="Verification results" className="min-w-0 self-start lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="label-bracket">Checks</h2>
          {verify.data && <span className="font-mono text-micro text-fg-subtle">checked {new Date(verify.data.checkedAt).toLocaleTimeString()}</span>}
        </div>
        {verify.isError ? (
          <ErrorState title="Verification failed to run" error={verify.error} onRetry={run} />
        ) : (
          <CheckList key={verify.data?.checkedAt ?? "idle"} result={verify.data ?? null} running={verify.isPending} />
        )}
        <p className="mt-2 text-micro text-fg-subtle">
          Every check is recomputed from the receipt itself, the ENS records for the agent, and the payout event on-chain. A TEE pass means the declared model ran in attested hardware; it is not a proof that its output is correct.
        </p>
      </section>
    </div>
  );
}
