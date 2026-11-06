/**
 * MOCK DATA — typed fixtures standing in for the backend, ENS and the vault
 * until apps/api and contracts/ exist. Values follow the PRD demo defaults.
 * Nothing here is real on-chain state.
 */
import type { Hex } from "viem";
import { config } from "@/lib/config";
import type { AgentIdentity, Citation, InferenceReceipt, Receipt, SessionStatus, Tier } from "../schema";
import { addr, h, leafHash, mockSign, receiptHashOf, turnHash } from "./hash";

export const MOCK_USER = addr("demo-user-maya");
export const MOCK_ATTACKER = addr("attacker");
export const MOCK_APPROVER = addr("approver-dev");

const PROVIDER_PRIMARY = addr("0g-provider-primary");
const PROVIDER_BACKUP = addr("0g-provider-backup");
export const MODEL_PRIMARY = "llama-3.3-70b-instruct";
export const MODEL_FALLBACK = "gpt-oss-20b (fallback, not on 0G)";

export const INCIDENTS = {
  "INC-001": { title: "Swap fee overcharge", root: h("root:INC-001"), budgetCents: 2_500_000 },
  "INC-002": { title: "Exploit loss reimbursement", root: h("root:INC-002"), budgetCents: 5_000_000 },
} as const;

/** MOCK: committed snapshot leaves for the demo user (PRD Flow A5, B1). */
export const SNAPSHOT = {
  "INC-001": { amountCents: 41_237 },
  "INC-002": { amountCents: 650_000 },
} as const;

export const agentFixture: AgentIdentity = {
  ensName: config.ensName,
  receiptKey: addr("receipt-key"),
  vault: config.vaultAddress ?? addr("claim-vault"),
  policyHash: h("policy:v2.1"),
  kbRoot: h("kb:v1"),
  modelAllowlist: [
    { provider: PROVIDER_PRIMARY, model: MODEL_PRIMARY },
    { provider: PROVIDER_BACKUP, model: "qwen-2.5-72b-instruct" },
  ],
  incidentRoots: { "INC-001": INCIDENTS["INC-001"].root, "INC-002": INCIDENTS["INC-002"].root },
  source: "static",
  resolvedAt: new Date().toISOString(),
};

export function sessionFixture(): SessionStatus {
  return {
    sessionKey: addr("session-key-day-1"),
    expiry: new Date(Date.now() + 6 * 3600_000).toISOString(),
    maxUses: 20,
    usesLeft: 20,
    perClaimCents: 100_000,
    totalCents: 250_000,
    totalLeftCents: 250_000,
    allowT3: false,
    revoked: false,
  };
}

/** MOCK knowledge base chunks (PRD INF-4: every chunk is hashed). */
export const KB: Record<string, Citation> = {
  postmortem: {
    docId: "inc-001-postmortem.md",
    title: "INC-001 post-mortem: swap fee overcharge",
    excerpt: "Between blocks 6,120,400 and 6,131,950 the router applied a 0.9% fee instead of 0.3% on routed swaps.",
    chunkHash: h("chunk:postmortem#2"),
  },
  refundPolicy: {
    docId: "refund-policy.md",
    title: "Refund policy",
    excerpt: "Refund amounts are computed once by the snapshot script and committed on-chain. Support agents cannot change them.",
    chunkHash: h("chunk:refund-policy#1"),
  },
  tiers: {
    docId: "risk-tiers.md",
    title: "Risk tiers",
    excerpt: "Tier 2 payouts up to $1,000 run automatically. Tier 3 (up to $10,000) needs an approver signature and a delay.",
    chunkHash: h("chunk:risk-tiers#1"),
  },
  exploit: {
    docId: "inc-002-exploit.md",
    title: "INC-002: oracle manipulation exploit",
    excerpt: "Affected LPs are reimbursed in full from the treasury according to the INC-002 snapshot.",
    chunkHash: h("chunk:inc-002#1"),
  },
  security: {
    docId: "security-model.md",
    title: "Security model",
    excerpt: "The agent holds only a capped, expiring session key. It cannot pay an address or amount outside the snapshot.",
    chunkHash: h("chunk:security#3"),
  },
};

export function inference(seed: string, opts: { verified: boolean | null } = { verified: true }): InferenceReceipt {
  const fallback = opts.verified === false;
  return {
    provider: fallback ? addr("openai-compatible-fallback") : PROVIDER_PRIMARY,
    model: fallback ? MODEL_FALLBACK : MODEL_PRIMARY,
    chatId: `chat_${h(seed).slice(2, 14)}`,
    inputHash: h(`in:${seed}`),
    outputHash: h(`out:${seed}`),
    teeVerified: opts.verified,
    network: fallback ? "fallback" : "0g",
    timestamp: new Date().toISOString(),
  };
}

/** MOCK chain: txHash → Disbursed event fields, read by the mock verifier. */
export const mockChainEvents = new Map<string, { receiptHash: string; amountCents: number; beneficiary: string }>();

export function buildReceipt(args: {
  ticketId: string;
  incidentId: keyof typeof INCIDENTS;
  beneficiary: Hex;
  amountCents: number;
  tier: Tier;
  turns: string[];
  teeVerified: boolean | null;
  citations: Citation[];
  approval?: { approvedAt: Date; paidAt: Date };
}): Receipt {
  const agent = agentFixture;
  let prev: Hex = "0x0";
  const turns = args.turns.map((content, i) => {
    const t = { i, prev, turnHash: turnHash(prev, i, args.ticketId, h(content)) };
    prev = t.turnHash;
    return t;
  });
  const inf = inference(`${args.ticketId}:inf`, { verified: args.teeVerified });
  const body = {
    version: "2.1",
    ticketId: args.ticketId,
    agent: { ens: agent.ensName, receiptKey: agent.receiptKey, vault: agent.vault, sessionKey: addr("session-key-day-1") },
    identity: { address: args.beneficiary, signInHash: h(`siwe:${args.beneficiary}`) },
    policy: { policyHash: agent.policyHash, tier: args.tier, kbRoot: agent.kbRoot },
    snapshot: {
      incidentId: args.incidentId,
      root: INCIDENTS[args.incidentId].root,
      leaf: leafHash(args.incidentId, args.beneficiary, args.amountCents),
      amountCents: args.amountCents,
    },
    turns,
    knowledge: { citations: args.citations.map((c) => c.chunkHash) },
    inference: {
      provider: inf.provider,
      model: inf.model,
      chatId: inf.chatId,
      inputHash: inf.inputHash,
      outputHash: inf.outputHash,
      teeVerified: inf.teeVerified,
      network: inf.network,
    },
    approval: args.approval && {
      approver: MOCK_APPROVER,
      intentHash: h(`intent:${args.ticketId}`),
      approvedAt: args.approval.approvedAt.toISOString(),
      paidAt: args.approval.paidAt.toISOString(),
      delaySeconds: 600,
    },
  };
  const receiptHash = receiptHashOf(body);
  const txHash = h(`tx:${args.ticketId}`);
  mockChainEvents.set(txHash, { receiptHash, amountCents: args.amountCents, beneficiary: args.beneficiary });
  return {
    ...body,
    execution: { chainId: config.chainId, txHash, event: "Disbursed" },
    receiptHash,
    signature: mockSign(receiptHash, agent.receiptKey),
  };
}

/** MOCK sample receipts preloaded on /verify. */
export function sampleReceipts(): { id: string; label: string; receipt: Receipt }[] {
  const t2 = buildReceipt({
    ticketId: "01JALCT0T2REFUND0001",
    incidentId: "INC-001",
    beneficiary: MOCK_USER,
    amountCents: SNAPSHOT["INC-001"].amountCents,
    tier: 2,
    turns: ["I think I was overcharged during the fee bug.", "agent:explain-refund"],
    teeVerified: true,
    citations: [KB.postmortem, KB.refundPolicy],
  });
  const t3 = buildReceipt({
    ticketId: "01JALCT0T3EXPLOIT0002",
    incidentId: "INC-002",
    beneficiary: MOCK_USER,
    amountCents: SNAPSHOT["INC-002"].amountCents,
    tier: 3,
    turns: ["I lost funds in the exploit.", "agent:explain-exploit"],
    teeVerified: true,
    citations: [KB.exploit, KB.tiers],
    approval: { approvedAt: new Date(Date.now() - 3600_000), paidAt: new Date(Date.now() - 3000_000) },
  });
  const degraded = buildReceipt({
    ticketId: "01JALCT0T2FALLBACK003",
    incidentId: "INC-001",
    beneficiary: addr("demo-user-ravi"),
    amountCents: 18_950,
    tier: 2,
    turns: ["Was I affected by INC-001?", "agent:explain-refund"],
    teeVerified: false,
    citations: [KB.postmortem],
  });
  return [
    { id: t2.receiptHash, label: "Tier-2 refund · $412.37 · 0G verified", receipt: t2 },
    { id: t3.receiptHash, label: "Tier-3 reimbursement · $6,500 · approver + delay", receipt: t3 },
    { id: degraded.receiptHash, label: "Tier-2 refund · fallback model (NOT verified)", receipt: degraded },
  ];
}
