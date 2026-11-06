import { AttackPanel } from "@/components/attack/attack-panel";

export const metadata = { title: "Attack", description: "Try to make the ALACTIC agent steal. Every attempt reverts on-chain." };

export default function Page() {
  return (
    <div className="container-x pb-24 pt-[calc(var(--nav-h)+3rem)]">
      <header className="max-w-3xl">
        <p className="label-bracket">Attack panel</p>
        <h1 className="mt-5 font-display text-h1 font-semibold text-fg">
          Fool the AI all you want. <em className="font-serif font-normal italic">The money stays.</em>
        </h1>
        <p className="mt-4 text-body-lg text-fg-muted">
          Each button sends the attack straight to the vault, skipping the backend&apos;s policy engine. The layer that stops it is contract code, not a prompt.
        </p>
      </header>
      <div className="mt-12">
        <AttackPanel />
      </div>
    </div>
  );
}
