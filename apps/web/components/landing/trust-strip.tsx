/**
 * Sponsor strip. Wordmarks are set in type, not invented logos (honesty rule).
 * Swap in official SVG marks from each sponsor's brand kit when available.
 */
const SPONSORS = [
  { name: "0G", role: "Verifiable inference", detail: "Every answer runs on 0G Compute with a TEE-attested receipt." },
  { name: "ENS", role: "Agent identity", detail: "ops.alactic.eth publishes the receipt key, vault, policy and snapshot roots." },
];

export function TrustStrip() {
  return (
    <section aria-label="Built with" className="border-b border-line">
      <div className="container-x grid gap-px md:grid-cols-[auto_1fr_1fr]">
        <p className="label-bracket self-center py-6 md:pr-10">Built with</p>
        {SPONSORS.map((s) => (
          <div key={s.name} className="flex items-center gap-5 border-t border-line py-6 md:border-l md:border-t-0 md:px-10">
            <span className="font-display text-[2.25rem] font-semibold leading-none tracking-tight text-fg">{s.name}</span>
            <span>
              <span className="block text-small font-medium text-fg">{s.role}</span>
              <span className="block text-small text-fg-muted">{s.detail}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
