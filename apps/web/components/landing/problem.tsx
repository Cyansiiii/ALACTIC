"use client";
import { StatusIcon } from "@/components/ui/status";
import { useStaggerReveal } from "@/lib/motion/reveal";
import { SectionHeader } from "./section-header";

const FAILURES = [
  {
    title: "Black-box reasoning",
    wrong: "Nobody can prove which model and prompt produced a decision.",
    answer: "Every answer carries a 0G Compute receipt: provider, model, input and output hashes, TEE check.",
  },
  {
    title: "A powerful hot key",
    wrong: "One leaked key or one prompt injection drains the treasury.",
    answer: "The agent holds only an expiring, capped session key. The owner key never touches a server.",
  },
  {
    title: "Invented payouts",
    wrong: "A tricked agent pays the wrong person, or the wrong amount.",
    answer: "Recipients and amounts come from a Merkle snapshot committed on-chain in advance. The AI never supplies either.",
  },
  {
    title: "Mutable logs, anonymous agents",
    wrong: "Records can be edited, and users can't tell who the agent is.",
    answer: "Hash-chained, signed receipts. Keys and roots published on ENS. Anyone can re-check.",
  },
];

export function Problem() {
  const grid = useStaggerReveal<HTMLOListElement>({ stagger: 0.12 });
  return (
    <section className="section-y" aria-labelledby="problem-title">
      <div className="container-x">
        <SectionHeader
          id="problem-title"
          label="The problem"
          align="split"
          title={
            <>
              Agents that move money fail in <em className="font-serif font-normal italic">four</em> ways.
            </>
          }
          description="Support agents that resolve tickets and pay refunds are arriving fast. Dropped into crypto as-is, each of these is one bad prompt away from a drained treasury."
        />

        <ol ref={grid} data-reveal className="mt-16 grid overflow-hidden rounded-xl border border-line md:grid-cols-2">
          {FAILURES.map((f, i) => (
            <li
              key={f.title}
              data-reveal-item
              className="group relative flex flex-col gap-8 border-line bg-surface/40 p-7 transition-colors duration-[var(--dur-slow)] hover:bg-surface md:p-10 [&:nth-child(n+2)]:border-t md:[&:nth-child(2)]:border-l md:[&:nth-child(2)]:border-t-0 md:[&:nth-child(4)]:border-l"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-h3 font-semibold text-fg">{f.title}</h3>
                <span className="font-mono text-micro text-fg-subtle">0{i + 1}</span>
              </div>
              <div className="mt-auto space-y-5">
                <p className="flex gap-3 text-fg-muted">
                  <StatusIcon tone="danger" className="mt-1" />
                  <span>
                    <span className="sr-only">Failure: </span>
                    {f.wrong}
                  </span>
                </p>
                <p className="flex gap-3 border-t border-line pt-5 text-fg">
                  <StatusIcon tone="verified" className="mt-1" />
                  <span>
                    <span className="sr-only">ALACTIC answer: </span>
                    {f.answer}
                  </span>
                </p>
              </div>
              <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-accent via-verified to-transparent transition-transform duration-[var(--dur-reveal)] ease-[var(--ease-out)] group-hover:scale-x-100" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
