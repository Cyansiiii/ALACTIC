import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Verifier } from "@/components/verify/verifier";

export const metadata = { title: "Verify", description: "Independently verify an ALACTIC refund receipt." };

export default function Page() {
  return (
    <div className="container-x pb-24 pt-[calc(var(--nav-h)+3rem)]">
      <header className="max-w-3xl">
        <p className="label-bracket">Receipt verifier</p>
        <h1 className="mt-5 font-display text-h1 font-semibold text-fg">
          Don&apos;t trust the agent. <em className="font-serif font-normal italic">Re-check it.</em>
        </h1>
        <p className="mt-4 text-body-lg text-fg-muted">
          Load a receipt and run seven independent checks: hash chain, signature against the ENS key, on-chain payout event, committed snapshot, amount, 0G inference, and Tier-3 approval.
        </p>
      </header>
      <div className="mt-12">
        {/* useSearchParams renders client-side; reserve the space so the footer doesn't jump (CLS). */}
        <Suspense
          fallback={
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-3"><Skeleton className="h-11 w-80 rounded-full" />{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[4.5rem] rounded-lg" />)}</div>
              <Skeleton className="h-[34rem] rounded-xl" />
            </div>
          }
        >
          <Verifier />
        </Suspense>
      </div>
    </div>
  );
}
