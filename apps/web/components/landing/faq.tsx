"use client";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { duration, ease } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./section-header";

const FAQ = [
  ["Why not just use a multisig?", "A multisig doesn't scale to hundreds of small refunds and causes signer fatigue. Here small claims are automatic but bounded, and a second human is only needed for the high-value tier."],
  ["Can the 0G provider lie?", "The receipt shows a TEE attestation and an allowlisted provider and model. That narrows trust to attested hardware and the provider key. It is not a proof of the output, which is exactly why amounts never come from the model."],
  ["What if the session key leaks?", "It can only claim leaves already in the snapshot, once each, within the per-claim and session caps, until it expires or is revoked. Maximum loss for the demo session is $2,500."],
  ["What stops one person claiming many times?", "Only addresses in the committed snapshot can claim, once each. This does not prove one human per wallet. Proof of personhood is on the roadmap."],
  ["Who builds the snapshot?", "The owner, with a deterministic script whose hash is published. The root is on-chain and on ENS before claims open, so anyone can audit it."],
  ["Is this live with real money?", "No. It runs on Ethereum Sepolia and the 0G testnet, and the contracts are unaudited hackathon code."],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <section id="faq" aria-labelledby="faq-title" className="section-y border-t border-line">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeader id="faq-title" label="FAQ" title="Questions judges ask." />
        <ul className="border-t border-line">
          {FAQ.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <li key={q} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    id={`${base}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${base}-a${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left font-display text-h3 font-medium text-fg"
                  >
                    {q}
                    <span aria-hidden className={cn("grid size-8 shrink-0 place-items-center rounded-full border border-line transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)]", isOpen && "rotate-45 border-accent text-accent")}>
                      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`${base}-a${i}`}
                      role="region"
                      aria-labelledby={`${base}-q${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: duration.slow, ease: ease.out }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 text-fg-muted">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
