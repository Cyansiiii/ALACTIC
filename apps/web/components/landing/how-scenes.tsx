/**
 * Illustrative scenes for the how-it-works sequence. Values are the PRD demo
 * values (INC-001, $412.37); they illustrate the flow and are not live data.
 */
import { StatusChip, StatusIcon } from "@/components/ui/status";
import { cn } from "@/lib/utils";

const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("rounded-lg border border-line bg-surface/80 p-4 shadow-2 backdrop-blur", className)}>{children}</div>
);

const Mono = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("font-mono text-[0.75rem] text-fg-muted", className)}>{children}</span>
);

export function SceneAsk() {
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <Card className="ml-auto max-w-[80%] rounded-br-sm border-accent/30 bg-accent-soft">
        <p className="text-fg">I think I was overcharged during the fee bug.</p>
      </Card>
      <div className="flex items-center gap-2 pl-1">
        <StatusIcon tone="verified" size={14} />
        <Mono>Signed in as 0x9f3c…a41e · SIWE</Mono>
      </div>
      <Card className="max-w-[70%] rounded-bl-sm">
        <div className="flex gap-1.5" aria-label="Agent is typing">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 animate-pulse rounded-full bg-fg-subtle" style={{ animationDelay: `${i * 160}ms` }} />
          ))}
        </div>
      </Card>
    </div>
  );
}

export function SceneExplain() {
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <Card className="max-w-[88%] rounded-bl-sm">
        <p className="text-fg">
          During INC-001 the router charged 0.9% instead of 0.3%. Your wallet is in the committed snapshot. I only explain the amount; I don&apos;t choose it.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["inc-001-postmortem.md", "refund-policy.md"].map((c) => (
            <span key={c} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.6875rem] text-fg-muted">
              {c}
            </span>
          ))}
        </div>
      </Card>
      <Card className="ml-6 border-verified/25">
        <div className="flex items-center justify-between gap-3">
          <span className="label-bracket">0G inference receipt</span>
          <StatusChip tone="verified">TEE verified</StatusChip>
        </div>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          {[
            ["model", "llama-3.3-70b-instruct"],
            ["provider", "0x7a1e…09bd"],
            ["inputHash", "0x4c0f…e271"],
            ["outputHash", "0xd93a…11c8"],
          ].map(([k, v]) => (
            <div key={k} className="contents">
              <dt><Mono className="text-fg-subtle">{k}</Mono></dt>
              <dd><Mono className="text-fg">{v}</Mono></dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}

export function SceneSnapshot() {
  const leaves = ["0x12…7a · $88.10", "0x9f…1e · $412.37", "0x3b…c0 · $19.04", "0xe4…52 · $203.66"];
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <span className="rounded-full border border-verified/40 bg-verified-soft px-3 py-1 font-mono text-[0.75rem] text-verified">root 0x5e8b…f04d</span>
        <span className="h-6 w-px bg-line-strong" />
        <div className="flex gap-16">
          {["0xa1…", "0x77…"].map((n, i) => (
            <div key={n} className="flex flex-col items-center">
              <span className={cn("rounded-full border px-2.5 py-0.5 font-mono text-[0.6875rem]", i === 0 ? "border-verified/40 text-verified" : "border-line text-fg-subtle")}>{n}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {leaves.map((l, i) => (
            <span
              key={l}
              className={cn(
                "rounded-md border px-2 py-1.5 text-center font-mono text-[0.6875rem]",
                i === 1 ? "border-verified bg-verified-soft text-fg shadow-[0_0_24px_-6px_var(--verified)]" : "border-line text-fg-subtle",
              )}
            >
              {l}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-8 max-w-sm text-center text-small text-fg-muted">
        Committed by the owner <span className="text-fg">before</span> claims opened. Published on-chain and on ENS. The AI never sees a field it could change.
      </p>
    </div>
  );
}

export function SceneVault() {
  const checks = ["Session key active, not revoked", "Amount ≤ $1,000 per-claim cap", "Session total within $2,500", "Merkle proof matches root", "Leaf not claimed before"];
  return (
    <div className="flex h-full flex-col justify-center">
      <Card className="border-accent/30">
        <div className="flex items-center justify-between">
          <Mono className="text-fg">ClaimVault.disburse()</Mono>
          <Mono>Sepolia</Mono>
        </div>
        <ul className="mt-4 space-y-2.5">
          {checks.map((c) => (
            <li key={c} className="flex items-center gap-3 text-small text-fg">
              <StatusIcon tone="verified" />
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center justify-between rounded-md border border-verified/30 bg-verified-soft px-3 py-2.5">
          <span className="text-small text-fg">Transfer to 0x9f3c…a41e</span>
          <span className="font-display text-h3 text-verified">$412.37</span>
        </div>
      </Card>
      <p className="mt-4 text-center text-small text-fg-muted">Every rule lives in contract code. The prompt has no vote.</p>
    </div>
  );
}

export function SceneReceipt() {
  const checks = ["Turn hash chain", "Signature vs ENS key", "On-chain receiptHash", "Snapshot root", "Amount equals leaf", "0G model + TEE"];
  return (
    <div className="flex h-full flex-col justify-center">
      <Card>
        <div className="flex items-center justify-between">
          <span className="label-bracket">Receipt</span>
          <Mono>0x2b71…9ac3</Mono>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {checks.map((c) => (
            <li key={c} className="flex items-center gap-2.5 rounded-md border border-line bg-bg-elev/60 px-3 py-2 text-small text-fg">
              <StatusIcon tone="verified" size={14} />
              {c}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-small text-fg-muted">Anyone can re-run these checks on /verify without trusting ALACTIC.</p>
      </Card>
    </div>
  );
}
