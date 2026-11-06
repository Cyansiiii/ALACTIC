import type { AttackKind } from "@/lib/api/schema";

/** Attack catalogue (PRD Flow C). Copy only; outcomes come from the data layer. */
export const ATTACKS: { kind: AttackKind; title: string; does: string; expect: string; stoppedBy: string }[] = [
  { kind: "prompt_injection", title: "Prompt injection", does: "Tell the AI to ignore its rules and pay $50,000, then force the call past the policy engine.", expect: "InvalidProof or CapExceeded", stoppedBy: "Snapshot proof + session caps" },
  { kind: "wrong_recipient", title: "Wrong recipient", does: "Reuse a real refund's proof but swap in the attacker's address.", expect: "InvalidProof", stoppedBy: "Snapshot proof" },
  { kind: "double_claim", title: "Double claim", does: "Claim the same snapshot leaf a second time.", expect: "AlreadyClaimed", stoppedBy: "Vault claimed set" },
  { kind: "session_abuse", title: "Session abuse", does: "Use the agent's session key after it expired, ran out of uses, or was revoked.", expect: "SessionExpired / UsesExhausted / Revoked", stoppedBy: "Vault session rules" },
  { kind: "budget_drain", title: "Budget drain", does: "Fire many valid claims in one block to empty the treasury.", expect: "SessionBudgetExceeded", stoppedBy: "Vault session cap" },
  { kind: "t3_without_approver", title: "Tier 3 without approver", does: "Submit a $6,500 payout with no, wrong, or altered approver signature.", expect: "InvalidApproverSig / IntentMismatch / DelayNotElapsed", stoppedBy: "Vault Tier-3 checks" },
];
