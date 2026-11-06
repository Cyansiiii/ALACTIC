"use client";
import { useRef } from "react";
import { StatusIcon } from "@/components/ui/status";
import { Counter } from "@/lib/motion/counter";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { formatCents } from "@/lib/utils";
import { SectionHeader } from "./section-header";

const TIERS = [
  { id: "T0", name: "Inform", example: "Q&A, explain a fee, status", auth: "Autonomous", limit: "No execution", height: 0.08, tone: "neutral" },
  { id: "T1", name: "Off-chain", example: "Open a ticket, attach evidence", auth: "Autonomous", limit: "No execution", height: 0.14, tone: "neutral" },
  { id: "T2", name: "Bounded payout", example: "Fee refund up to $1,000", auth: "Capped session key", limit: "$1,000 / claim · $2,500 / session", height: 0.42, tone: "verified" },
  { id: "T3", name: "High value", example: "Exploit reimbursement", auth: "Session key + approver signature + 10 min delay", limit: "Up to $10,000", height: 0.86, tone: "accent" },
  { id: "T4", name: "Prohibited", example: "Arbitrary transfers, change caps, upgrades", auth: "Never via the agent", limit: "Owner only", height: 1, tone: "danger" },
] as const;

const barClass = {
  neutral: "bg-line-strong",
  verified: "bg-gradient-to-t from-verified/20 to-verified",
  accent: "bg-gradient-to-t from-accent-strong/20 to-accent",
  danger: "bg-[repeating-linear-gradient(135deg,var(--danger)_0_6px,transparent_6px_12px)] opacity-60",
};

export function Tiers() {
  const ladder = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (document.documentElement.dataset.motion !== "on") return;
      gsap.from("[data-bar]", {
        scaleY: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ladder.current, start: "top 75%", once: true },
      });
      gsap.from("[data-tier-col]", {
        autoAlpha: 0,
        y: 24,
        duration: 0.9,
        stagger: 0.08,
        scrollTrigger: { trigger: ladder.current, start: "top 80%", once: true },
      });
    },
    { scope: ladder },
  );

  return (
    <section id="tiers" aria-labelledby="tiers-title" className="section-y border-t border-line">
      <div className="container-x">
        <SectionHeader
          id="tiers-title"
          label="Bounded autonomy"
          align="split"
          title={<>Autonomy that ends <em className="font-serif font-normal italic">where the code says.</em></>}
          description="Risk tiers are derived from the committed amount, never from the model. Small refunds are automatic. Large ones need a second human and time. Some things the agent can never do."
        />

        <div ref={ladder} className="mt-16 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {TIERS.map((t) => (
            <div key={t.id} data-tier-col className="flex flex-col bg-bg p-6">
              <div className="flex items-center justify-between">
                <span className="label-bracket">{t.id}</span>
                <StatusIcon tone={t.tone === "neutral" ? "neutral" : t.tone} />
              </div>
              <h3 className="mt-4 font-display text-h3 font-semibold text-fg">{t.name}</h3>
              <p className="mt-2 text-small text-fg-muted">{t.example}</p>
              <div className="relative mt-6 h-24 sm:mt-8 sm:h-40 lg:h-52" aria-hidden>
                <div className="absolute inset-x-0 bottom-0 border-t border-dashed border-line-strong" />
                <div data-bar className={`absolute inset-x-6 bottom-0 origin-bottom rounded-t-md ${barClass[t.tone]}`} style={{ height: `${t.height * 100}%` }} />
              </div>
              <dl className="mt-6 space-y-3 border-t border-line pt-5 text-small">
                <div>
                  <dt className="text-fg-subtle">Authorization</dt>
                  <dd className="mt-0.5 text-fg">{t.auth}</dd>
                </div>
                <div>
                  <dt className="text-fg-subtle">Limit</dt>
                  <dd className="mt-0.5 font-medium text-fg">{t.limit}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>

      <MaxLoss />
    </section>
  );
}

function MaxLoss() {
  const stats = [
    { value: 250_000, label: "Max loss per session", note: "Even if the AI, the server and the session key are all stolen." },
    { value: 100_000, label: "Max per claim", note: "Larger leaves must take the Tier-3 path." },
    { value: 0, label: "Payouts outside the list", note: "Only committed (address, amount) leaves, once each." },
  ];
  return (
    <div className="container-x mt-24">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-[linear-gradient(160deg,#0d0b26,#06070b_70%)] p-8 text-[#eef0f7] md:p-14">
        <div aria-hidden className="absolute -right-32 -top-32 size-96 rounded-full bg-accent-strong/30 blur-[120px]" />
        <div className="relative grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="label-bracket !text-[#a0a6bd]">Max-loss invariant</p>
            <p className="mt-6 font-display text-h1 font-semibold">
              Assume everything off-chain is <em className="font-serif font-normal italic text-[#8b7dff]">compromised.</em> The vault still holds.
            </p>
            <p className="mt-6 max-w-lg text-[#a0a6bd]">
              The attacker can only call <code className="font-mono text-[#eef0f7]">disburse</code>. Tier 3 additionally needs the approver&apos;s EIP-712 signature, which a compromised agent cannot produce.
            </p>
          </div>
          <dl className="divide-y divide-white/10 border-y border-white/10">
            {stats.map((s) => (
              <div key={s.label} className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 py-6">
                <dd className="font-display text-display-xl font-medium leading-none">
                  <Counter value={s.value / 100} format={(n) => formatCents(Math.round(n) * 100, { compact: true })} />
                </dd>
                <dt>
                  <span className="block text-small font-medium">{s.label}</span>
                  <span className="mt-1 block text-small text-[#a0a6bd]">{s.note}</span>
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
