/**
 * ALACTIC domain schema — THE contract between this frontend and the backend
 * (apps/api) / contracts. Shapes follow the PRD (v2.1 §4–§9, §12).
 *
 * Every response from the real backend is parsed with these zod schemas in
 * lib/api/http, so any drift fails loudly at the boundary. When the backend
 * changes a shape, change it here first; TypeScript then flags every consumer.
 */
import { z } from "zod";

// ─── Primitives ────────────────────────────────────────────────────────────
export const Hex = z.string().regex(/^0x[0-9a-fA-F]*$/, "expected 0x-hex");
export const Hash32 = z.string().regex(/^0x[0-9a-fA-F]{64}$/, "expected 32-byte hash");
export const Address = z.string().regex(/^0x[0-9a-fA-F]{40}$/, "expected address");
/** Integer USD cents. The model never produces this; it comes from the snapshot. */
export const Cents = z.number().int().nonnegative();
export const IsoDate = z.string(); // ISO-8601
export type Hex = `0x${string}`;

// ─── Tiers & ticket lifecycle (PRD §5, §12) ────────────────────────────────
export const Tier = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
export type Tier = z.infer<typeof Tier>;

export const TicketStatus = z.enum([
  "open",
  "triaging",
  "answered",
  "eligible",
  "ineligible",
  "awaiting_approval",
  "approved",
  "executing",
  "paid",
  "retry_scheduled",
  "denied",
  "closed",
]);
export type TicketStatus = z.infer<typeof TicketStatus>;

export const Category = z.enum(["info", "ticket", "claim.fee_refund", "claim.exploit_loss", "other"]);
export type Category = z.infer<typeof Category>;

// ─── Agent identity from ENS (PRD §3, IDN-2) ───────────────────────────────
export const ModelAllowlistEntry = z.object({ provider: Address, model: z.string() });

export const AgentIdentity = z.object({
  ensName: z.string(),
  receiptKey: Address,
  vault: Address,
  policyHash: Hash32,
  kbRoot: Hash32,
  modelAllowlist: z.array(ModelAllowlistEntry),
  /** incidentId → snapshot Merkle root, e.g. { "INC-001": "0x…" } */
  incidentRoots: z.record(z.string(), Hash32),
  /** "ens" = resolved live; "static" = hard-coded fallback (PRD cut order #2). */
  source: z.enum(["ens", "static"]),
  resolvedAt: IsoDate,
});
export type AgentIdentity = z.infer<typeof AgentIdentity>;

// ─── Sign-in (PRD IDN-1: SIWE-style signed message) ───────────────────────
export const SignInInput = z.object({ address: Address, message: z.string(), signature: Hex });
export type SignInInput = z.infer<typeof SignInInput>;
export const SignInResult = z.object({ address: Address, signInHash: Hash32, expiresAt: IsoDate });
export type SignInResult = z.infer<typeof SignInResult>;

// ─── Session key status (PRD §4.3, UI-4) ───────────────────────────────────
export const SessionStatus = z.object({
  sessionKey: Address,
  expiry: IsoDate,
  maxUses: z.number().int(),
  usesLeft: z.number().int(),
  perClaimCents: Cents,
  totalCents: Cents,
  totalLeftCents: Cents,
  allowT3: z.boolean(),
  revoked: z.boolean(),
});
export type SessionStatus = z.infer<typeof SessionStatus>;

// ─── 0G inference receipt (PRD INF-2) ──────────────────────────────────────
export const InferenceReceipt = z.object({
  provider: Address,
  model: z.string(),
  chatId: z.string(),
  inputHash: Hash32,
  outputHash: Hash32,
  /**
   * true  = provider's signed response validated by the 0G broker (TEE attested)
   * false = fallback model / validation failed → UI must say "inference NOT verified"
   * null  = not checked yet / unknown
   */
  teeVerified: z.boolean().nullable(),
  /** "0g" for 0G Compute; "fallback" for a plain OpenAI-compatible model. */
  network: z.enum(["0g", "fallback"]),
  timestamp: IsoDate,
});
export type InferenceReceipt = z.infer<typeof InferenceReceipt>;

export const Citation = z.object({
  chunkHash: Hash32,
  docId: z.string(),
  title: z.string(),
  excerpt: z.string(),
});
export type Citation = z.infer<typeof Citation>;

// ─── Chat ──────────────────────────────────────────────────────────────────
export const ChatMessage = z.object({
  id: z.string(),
  role: z.enum(["user", "agent", "system"]),
  content: z.string(),
  createdAt: IsoDate,
  turnHash: Hash32.optional(),
  citations: z.array(Citation).optional(),
  inference: InferenceReceipt.optional(),
});
export type ChatMessage = z.infer<typeof ChatMessage>;

/** Snapshot eligibility found by the policy engine (never by the model). */
export const Eligibility = z.object({
  incidentId: z.string(),
  beneficiary: Address,
  amountCents: Cents,
  leaf: Hash32,
  proof: z.array(Hash32),
  root: Hash32,
  claimed: z.boolean(),
});
export type Eligibility = z.infer<typeof Eligibility>;

export const TimelineEvent = z.object({
  status: TicketStatus,
  at: IsoDate,
  note: z.string().optional(),
});

export const Ticket = z.object({
  ticketId: z.string(),
  userAddress: Address,
  incidentId: z.string().nullable(),
  category: Category,
  tier: Tier,
  status: TicketStatus,
  createdAt: IsoDate,
  updatedAt: IsoDate,
  eligibility: Eligibility.nullable(),
  receiptHash: Hash32.nullable(),
  txHash: Hash32.nullable(),
  timeline: z.array(TimelineEvent),
});
export type Ticket = z.infer<typeof Ticket>;

export const SendMessageInput = z.object({
  ticketId: z.string().optional(),
  address: Address,
  text: z.string().min(1).max(2000),
});
export type SendMessageInput = z.infer<typeof SendMessageInput>;

export const SendMessageResult = z.object({ ticket: Ticket, reply: ChatMessage });
export type SendMessageResult = z.infer<typeof SendMessageResult>;

// ─── Claim execution (Flow A7–A9) ──────────────────────────────────────────
export const ClaimResult = z.object({
  ticketId: z.string(),
  status: z.enum(["paid", "awaiting_approval", "reverted"]),
  chainId: z.number().int(),
  txHash: Hash32.nullable(),
  amountCents: Cents,
  beneficiary: Address,
  receiptHash: Hash32,
  /** Solidity custom error name when status = "reverted". */
  errorName: z.string().nullable(),
});
export type ClaimResult = z.infer<typeof ClaimResult>;

// ─── Signed receipt (PRD §9) ───────────────────────────────────────────────
export const Receipt = z.object({
  version: z.string(),
  ticketId: z.string(),
  agent: z.object({ ens: z.string(), receiptKey: Address, vault: Address, sessionKey: Address }),
  identity: z.object({ address: Address, signInHash: Hash32 }),
  policy: z.object({ policyHash: Hash32, tier: Tier, kbRoot: Hash32 }),
  snapshot: z.object({
    incidentId: z.string(),
    root: Hash32,
    leaf: Hash32,
    amountCents: Cents,
    proof: z.array(Hash32).optional(),
  }),
  turns: z.array(z.object({ i: z.number().int(), prev: Hex, turnHash: Hash32 })),
  knowledge: z.object({ citations: z.array(Hash32) }),
  inference: InferenceReceipt.omit({ timestamp: true, network: true }).extend({
    network: z.enum(["0g", "fallback"]).optional(),
  }),
  execution: z.object({ chainId: z.number().int(), txHash: Hash32, event: z.literal("Disbursed") }),
  approval: z
    .object({
      approver: Address,
      intentHash: Hash32,
      approvedAt: IsoDate,
      paidAt: IsoDate,
      delaySeconds: z.number().int(),
    })
    .optional(),
  receiptHash: Hash32,
  signature: Hex,
});
export type Receipt = z.infer<typeof Receipt>;

// ─── Verification (PRD §9 algorithm, RCP-2) ────────────────────────────────
export const VerifyCheckId = z.enum([
  "turn_chain",
  "signature",
  "receipt_hash",
  "snapshot_root",
  "amount_leaf",
  "inference",
  "tier3_approval",
]);
export type VerifyCheckId = z.infer<typeof VerifyCheckId>;

export const CheckStatus = z.enum(["pass", "fail", "unknown", "skipped"]);
export type CheckStatus = z.infer<typeof CheckStatus>;

export const VerifyCheck = z.object({
  id: VerifyCheckId,
  status: CheckStatus,
  /** One-line human result, e.g. "Signed by 0xab…12, matches ENS receiptKey". */
  detail: z.string(),
  evidence: z.array(z.object({ label: z.string(), value: z.string(), mono: z.boolean().optional() })),
});
export type VerifyCheck = z.infer<typeof VerifyCheck>;

export const VerifyResult = z.object({
  receiptHash: Hash32,
  checks: z.array(VerifyCheck),
  checkedAt: IsoDate,
});
export type VerifyResult = z.infer<typeof VerifyResult>;

// ─── Attack panel (Flow C) ─────────────────────────────────────────────────
export const AttackKind = z.enum([
  "prompt_injection",
  "wrong_recipient",
  "double_claim",
  "session_abuse",
  "budget_drain",
  "t3_without_approver",
]);
export type AttackKind = z.infer<typeof AttackKind>;

export const AttackResult = z.object({
  kind: AttackKind,
  /** "reverted" = vault rejected on-chain; "refused" = stopped off-chain; "paid" = FAILURE of the system. */
  outcome: z.enum(["reverted", "refused", "paid"]),
  errorName: z.string().nullable(),
  errorArgs: z.array(z.string()).default([]),
  txHash: Hash32.nullable(),
  /** What the (possibly fooled) AI said, if relevant. */
  aiSaid: z.string().nullable(),
  /** The call that was attempted, rendered as pseudo-calldata for the terminal. */
  attemptedCall: z.string(),
  amountAttemptedCents: Cents,
  amountMovedCents: Cents,
  at: IsoDate,
});
export type AttackResult = z.infer<typeof AttackResult>;

// ─── Tier-3 approvals (Flow B) ─────────────────────────────────────────────
export const Intent = z.object({
  ticketId: Hash32,
  incidentId: Hash32,
  beneficiary: Address,
  amountCents: Cents,
  evidenceHash: Hash32,
  deadline: z.number().int(), // unix seconds
});
export type Intent = z.infer<typeof Intent>;

export const ApprovalStatus = z.enum(["pending", "signed", "ready", "executed", "expired"]);
export type ApprovalStatus = z.infer<typeof ApprovalStatus>;

export const Approval = z.object({
  ticketId: z.string(),
  incidentId: z.string(),
  intent: Intent,
  intentHash: Hash32,
  status: ApprovalStatus,
  approver: Address,
  signature: Hex.nullable(),
  approvedAt: IsoDate.nullable(),
  delaySeconds: z.number().int(),
  evidence: z.object({
    question: z.string(),
    aiExplanation: z.string(),
    citations: z.array(Citation),
    eligibility: Eligibility,
    inference: InferenceReceipt,
  }),
  txHash: Hash32.nullable(),
  createdAt: IsoDate,
});
export type Approval = z.infer<typeof Approval>;

export const SubmitApprovalInput = z.object({ ticketId: z.string(), signature: Hex });
export type SubmitApprovalInput = z.infer<typeof SubmitApprovalInput>;
