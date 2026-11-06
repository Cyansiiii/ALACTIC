import Link from "next/link";
import { config } from "@/lib/config";
import { Logo } from "./logo";

const COLUMNS = [
  { title: "Product", links: [{ href: "/app", label: "Claim a refund" }, { href: "/verify", label: "Verify a receipt" }, { href: "/attack", label: "Attack panel" }, { href: "/approver", label: "Approver console" }] },
  { title: "Protocol", links: [{ href: "/#how", label: "How it works" }, { href: "/#tiers", label: "Risk tiers" }, { href: "/#faq", label: "FAQ" }] },
  { title: "Source", links: [{ href: "https://github.com/Cyansiiii/ALACTIC", label: "GitHub" }] },
];

export function Footer() {
  return (
    <footer className="relative border-t border-line">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-small text-fg-muted">
            A refund agent that can be fooled, but cannot steal. Inference on 0G, identity on ENS, rules in the vault.
          </p>
          <p className="mt-4 font-mono text-micro text-fg-subtle">{config.ensName}</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="label-bracket">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith("http") ? (
                    <a href={l.href} target="_blank" rel="noreferrer" className="text-small text-fg-muted transition-colors hover:text-fg">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-small text-fg-muted transition-colors hover:text-fg">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-x border-t border-line py-8">
        <div className="rounded-lg border border-warn/25 bg-warn-soft/60 p-4 md:p-5">
          <p className="label-bracket !text-warn">Honest limitations</p>
          <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-small text-fg-muted md:grid-cols-2">
            <li>Testnet only (Ethereum Sepolia, 0G testnet). No real funds.</li>
            <li>Contracts are unaudited hackathon code.</li>
            <li>TEE attestation shows where a model ran, not that its output is correct.</li>
            <li>The snapshot bounds who and how much. It does not prove one person per wallet.</li>
          </ul>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-2 text-micro text-fg-subtle sm:flex-row">
          <p>© {new Date().getFullYear()} ALACTIC</p>
          <p>Built with 0G and ENS</p>
        </div>
      </div>
    </footer>
  );
}
