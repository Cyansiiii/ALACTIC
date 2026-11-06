import { ApproverConsole } from "@/components/approver/approver-console";

export const metadata = { title: "Approver", description: "Review and sign Tier-3 ALACTIC payouts." };

export default function Page() {
  return (
    <div className="container-x pb-24 pt-[calc(var(--nav-h)+3rem)]">
      <header className="max-w-3xl">
        <p className="label-bracket">Approver console · Tier 3</p>
        <h1 className="mt-5 font-display text-h1 font-semibold text-fg">
          Big money needs the agent, <em className="font-serif font-normal italic">a second human,</em> and time.
        </h1>
        <p className="mt-4 text-body-lg text-fg-muted">
          Review the evidence package, sign the exact payout intent, then wait out the delay. The vault refuses Tier-3 payouts without all three.
        </p>
      </header>
      <div className="mt-12">
        <ApproverConsole />
      </div>
    </div>
  );
}
