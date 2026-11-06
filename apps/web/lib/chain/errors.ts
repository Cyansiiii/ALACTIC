/**
 * Human copy for every ClaimVault custom error (PRD §8.2). Keyed by the
 * Solidity error name so decoded reverts map straight to UI.
 * New contract error? Add one entry here; unknown names still render by name.
 */
export type VaultLayer = "Snapshot proof" | "Claimed set" | "Session rules" | "Session cap" | "Tier-3 approval" | "Incident limits" | "Guardian" | "Access control";

export interface VaultErrorInfo {
  title: string;
  layer: VaultLayer;
  explanation: string;
}

export const VAULT_ERRORS: Record<string, VaultErrorInfo> = {
  InvalidProof: {
    title: "Not in the committed snapshot",
    layer: "Snapshot proof",
    explanation: "The (address, amount) pair has no valid Merkle proof against the root the owner committed before claims opened.",
  },
  AlreadyClaimed: {
    title: "Leaf already paid",
    layer: "Claimed set",
    explanation: "Each snapshot leaf can be paid exactly once. The vault marks it claimed before transferring.",
  },
  CapExceeded: {
    title: "Over the per-claim cap",
    layer: "Session rules",
    explanation: "The amount is above the cap for this path. Tier-2 tops out at $1,000; larger leaves need the Tier-3 flow.",
  },
  SessionExpired: {
    title: "Session key expired",
    layer: "Session rules",
    explanation: "The agent's session key is past its expiry. Only the offline owner can grant a new one.",
  },
  SessionRevoked: {
    title: "Session key revoked",
    layer: "Session rules",
    explanation: "The owner or guardian revoked this session key. It can no longer call the vault.",
  },
  SessionUsesExhausted: {
    title: "Session uses spent",
    layer: "Session rules",
    explanation: "The session key has used all of its allowed calls.",
  },
  SessionBudgetExceeded: {
    title: "Session budget exhausted",
    layer: "Session cap",
    explanation: "The session's total cap ($2,500 in the demo) is spent. No further payouts until a new grant.",
  },
  NotSession: {
    title: "Caller is not a session key",
    layer: "Access control",
    explanation: "Only an active session key can call disburse. Not the owner, not the guardian, not anyone else.",
  },
  T3NotAllowed: {
    title: "Session not Tier-3 enabled",
    layer: "Tier-3 approval",
    explanation: "High-value payouts need a session key granted with allowT3.",
  },
  InvalidApproverSig: {
    title: "Missing or wrong approver signature",
    layer: "Tier-3 approval",
    explanation: "Tier-3 needs an EIP-712 signature from the approver over this exact intent. A compromised agent cannot produce it.",
  },
  IntentMismatch: {
    title: "Intent was altered",
    layer: "Tier-3 approval",
    explanation: "The payout fields differ from the intent the approver signed.",
  },
  ApprovalExpired: {
    title: "Approval deadline passed",
    layer: "Tier-3 approval",
    explanation: "The approver's signature carries a deadline, and it has passed.",
  },
  DelayNotElapsed: {
    title: "Time delay not elapsed",
    layer: "Tier-3 approval",
    explanation: "Tier-3 payouts wait a fixed delay after approval, giving humans time to react.",
  },
  IncidentExpired: {
    title: "Incident window closed",
    layer: "Incident limits",
    explanation: "Claims for this incident are past their on-chain expiry.",
  },
  BudgetExhausted: {
    title: "Incident budget exhausted",
    layer: "Incident limits",
    explanation: "The incident's committed budget is fully paid out.",
  },
  Paused: {
    title: "Vault paused",
    layer: "Guardian",
    explanation: "The guardian paused the vault. Nothing moves until the owner unpauses.",
  },
};

export function describeVaultError(name: string | null | undefined): VaultErrorInfo & { name: string } {
  const key = name ?? "UnknownError";
  return { name: key, ...(VAULT_ERRORS[key] ?? { title: "Transaction reverted", layer: "Access control", explanation: `The vault reverted with ${key}.` }) };
}
