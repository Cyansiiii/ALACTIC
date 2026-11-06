"use client";
/** A sample receipt whose checks tick green one by one. Illustrative sample, labelled as such. */
import { useRef } from "react";
import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { SectionHeader } from "./section-header";

const CHECKS = [
  ["Turn hash chain", "4 turns linked, none edited"],
  ["Signature vs ENS key", "Signed by receiptKey on ops.alactic.eth"],
  ["On-chain receiptHash", "Disbursed event matches"],
  ["Snapshot root", "INC-001 root matches vault + ENS"],
  ["Amount equals leaf", "$412.37 to the committed address"],
  ["0G model + TEE", "Allowlisted model, TEE attested"],
  ["Tier-3 approver", "Not required for Tier 2"],
];

export function VerifyTeaser() {
  const card = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (document.documentElement.dataset.motion !== "on") return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: card.current, start: "top 70%", once: true } });
      tl.from("[data-check-row]", { autoAlpha: 0, x: -12, duration: 0.5, stagger: 0.18, ease: "expo.out" })
        .from("[data-check-icon]", { scale: 0, rotate: -90, duration: 0.5, stagger: 0.18, ease: "back.out(2)" }, 0.15)
        .from("[data-check-total]", { autoAlpha: 0, y: 10, duration: 0.6 }, ">-0.1");
    },
    { scope: card },
  );

  return (
    <section aria-labelledby="verify-title" className="section-y">
      <div className="container-x grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div ref={card} className="glass order-2 rounded-xl p-6 md:p-8 lg:order-1">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="label-bracket">Sample receipt</p>
              <p className="mt-1 font-mono text-small text-fg">0x2b71e0…f19ac3</p>
            </div>
            <span className="font-mono text-micro text-fg-subtle">ticket 01JALCT…0001</span>
          </div>
          <ul className="mt-2 divide-y divide-line">
            {CHECKS.map(([name, detail], i) => {
              const skipped = i === CHECKS.length - 1;
              return (
                <li key={name} data-check-row className="flex items-center gap-4 py-3">
                  <span data-check-icon className={`grid size-6 shrink-0 place-items-center rounded-full ${skipped ? "border border-dashed border-line-strong text-fg-subtle" : "bg-verified-soft text-verified"}`}>
                    {skipped ? (
                      <span aria-hidden className="text-[0.7rem]">–</span>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M2.5 6.2l2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                  </span>
                  <span className="flex-1 text-small font-medium text-fg">{name}</span>
                  <span className="hidden text-small text-fg-muted sm:block">{detail}</span>
                  <span className="sr-only">{skipped ? "skipped" : "passed"}</span>
                </li>
              );
            })}
          </ul>
          <p data-check-total className="mt-4 flex items-center gap-2 rounded-md bg-verified-soft px-3 py-2 text-small text-fg">
            <span className="font-mono text-verified">6/6</span> applicable checks passed · 1 not applicable
          </p>
        </div>
        <div className="order-1 lg:order-2">
          <SectionHeader
            id="verify-title"
            label="Verify it"
            title={<>Don&apos;t trust us. <em className="font-serif font-normal italic">Check.</em></>}
            description="Paste any receipt into the verifier. It recomputes the hash chain, checks the signature against the key on ENS, matches the payout event on-chain, and shows the 0G inference result honestly."
          />
          <ButtonLink href="/verify" variant="outline" className="mt-8">
            Open the verifier <ArrowIcon />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
