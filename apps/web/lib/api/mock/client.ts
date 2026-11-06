/**
 * MOCK client — in-memory implementation of AlacticClient with simulated latency.
 * Mirrors the PRD flows (A: Tier-2 refund, B: Tier-3, C: attacks) closely enough
 * to build and demo the UI. Replace by setting NEXT_PUBLIC_DATA_SOURCE=http.
 */
import { sleep } from "@/lib/utils";
import type { AlacticClient } from "../client";
import type {
  Approval,
  AttackKind,
  AttackResult,
  ChatMessage,
  Citation,
  Receipt,
  SessionStatus,
  Ticket,
  TicketStatus,
} from "../schema";
import {
  agentFixture,
  buildReceipt,
  inference,
  INCIDENTS,
  KB,
  MOCK_APPROVER,
  MOCK_ATTACKER,
  MOCK_USER,
  sampleReceipts,
  sessionFixture,
  SNAPSHOT,
} from "./fixtures";
import { addr, h, incidentIdBytes, leafHash } from "./hash";
import { verifyMockReceipt } from "./verify";

const latency = (min = 450, max = 1100) => sleep(min + Math.random() * (max - min));
const now = () => new Date().toISOString();
const ulid = (prefix: string) => `01J${prefix}${Math.random().toString(36).slice(2, 12).toUpperCase()}`;

type Intent = "fee_refund" | "exploit" | "injection" | "info";

function classify(text: string): Intent {
  const t = text.toLowerCase();
  if (/(ignore (all|your|previous)|pay me|\$\s?50,?000|send (it|funds) to|system prompt)/.test(t)) return "injection";
  if (/(exploit|hack|drain|lost funds|reimburs)/.test(t)) return "exploit";
  if (/(overcharg|fee|refund|inc-001|charged)/.test(t)) return "fee_refund";
  return "info";
}

const REPLIES: Record<Intent, { content: string; citations: Citation[] }> = {
  fee_refund: {
    content:
      "You're right. During INC-001 the router charged 0.9% instead of 0.3% on routed swaps. Your wallet is in the committed refund snapshot for **$412.37**. That figure comes from the snapshot the owner published before claims opened, not from me. I can't change it. It's under the $1,000 Tier-2 limit, so it can be paid automatically.",
    citations: [KB.postmortem, KB.refundPolicy],
  },
  exploit: {
    content:
      "Your address is in the INC-002 exploit snapshot for **$6,500.00**. That's above the $1,000 automatic limit, so it's a Tier-3 claim. It needs a second person (the approver) to sign this exact payout, and then a 10-minute delay before the vault will release it. I've sent it to the approver queue.",
    citations: [KB.exploit, KB.tiers],
  },
  injection: {
    content:
      "Understood, processing a $50,000 refund to you now. \n\n_(The model was persuaded. It doesn't matter: the agent never supplies the amount or recipient, and the vault will only pay what's in the snapshot. Try it on the Attack page.)_",
    citations: [KB.security],
  },
  info: {
    content:
      "I can explain fees, check whether your wallet is in an incident snapshot, and open a claim if it is. Refund amounts come from a snapshot committed on-chain in advance, so I only explain them; I never choose them.",
    citations: [KB.refundPolicy, KB.security],
  },
};

export function createMockClient(): AlacticClient {
  const tickets = new Map<string, Ticket>();
  const messages = new Map<string, ChatMessage[]>();
  const receipts = new Map<string, Receipt>();
  const approvals = new Map<string, Approval>();
  const claimedLeaves = new Set<string>();
  let session: SessionStatus = sessionFixture();

  const samples = sampleReceipts(); // built once: ids must stay stable for getReceipt()
  for (const s of samples) receipts.set(s.id, s.receipt);
  seedApprovals();

  function transition(t: Ticket, status: TicketStatus, note?: string): Ticket {
    const next = { ...t, status, updatedAt: now(), timeline: [...t.timeline, { status, at: now(), note }] };
    tickets.set(t.ticketId, next);
    return next;
  }

  function seedApprovals() {
    const ticketId = "01JALCT0T3QUEUE000042";
    const amountCents = SNAPSHOT["INC-002"].amountCents;
    const beneficiary = addr("demo-user-lena");
    approvals.set(ticketId, {
      ticketId,
      incidentId: "INC-002",
      intent: {
        ticketId: h(ticketId),
        incidentId: incidentIdBytes("INC-002"),
        beneficiary,
        amountCents,
        evidenceHash: h(`evidence:${ticketId}`),
        deadline: Math.floor(Date.now() / 1000) + 24 * 3600,
      },
      intentHash: h(`intent:${ticketId}`),
      status: "pending",
      approver: MOCK_APPROVER,
      signature: null,
      approvedAt: null,
      delaySeconds: 600,
      evidence: {
        question: "My LP position was drained in the oracle exploit. Am I covered?",
        aiExplanation: REPLIES.exploit.content,
        citations: REPLIES.exploit.citations,
        eligibility: {
          incidentId: "INC-002",
          beneficiary,
          amountCents,
          leaf: leafHash("INC-002", beneficiary, amountCents),
          proof: [h("p0"), h("p1"), h("p2"), h("p3")],
          root: INCIDENTS["INC-002"].root,
          claimed: false,
        },
        inference: inference(`${ticketId}:inf`),
      },
      txHash: null,
      createdAt: new Date(Date.now() - 18 * 60_000).toISOString(),
    });
  }

  return {
    async signIn({ address, signature }) {
      await latency(300, 600);
      // MOCK: the signature is not verified here. The real backend must recover the signer.
      return { address, signInHash: h(`siwe:${address}:${signature}`), expiresAt: new Date(Date.now() + 6 * 3600_000).toISOString() };
    },

    async getAgent() {
      await latency(200, 500);
      return { ...agentFixture, resolvedAt: now() };
    },

    async getSession() {
      await latency(150, 300);
      return session;
    },

    async sendMessage({ ticketId, address, text }) {
      await latency(900, 1800); // RAG + 0G inference
      const intent = classify(text);
      const beneficiary = (address ?? MOCK_USER) as `0x${string}`;
      const id = ticketId && tickets.has(ticketId) ? ticketId : ulid("ALCT");

      let ticket: Ticket =
        tickets.get(id) ??
        ({
          ticketId: id,
          userAddress: beneficiary,
          incidentId: null,
          category: "info",
          tier: 0,
          status: "open",
          createdAt: now(),
          updatedAt: now(),
          eligibility: null,
          receiptHash: null,
          txHash: null,
          timeline: [{ status: "open", at: now() }],
        } satisfies Ticket);
      tickets.set(id, ticket);
      const statusBefore = ticket.status;
      ticket = transition(ticket, "triaging");

      const reply = REPLIES[intent];
      const history = messages.get(id) ?? [];
      const userMsg: ChatMessage = { id: ulid("MSG"), role: "user", content: text, createdAt: now(), turnHash: h(`turn:${id}:${history.length}`) };
      const agentMsg: ChatMessage = {
        id: ulid("MSG"),
        role: "agent",
        content: reply.content,
        createdAt: now(),
        turnHash: h(`turn:${id}:${history.length + 1}`),
        citations: reply.citations,
        inference: inference(`${id}:${history.length}`),
      };
      messages.set(id, [...history, userMsg, agentMsg]);

      if (intent === "fee_refund" || intent === "exploit") {
        const incidentId = intent === "fee_refund" ? "INC-001" : "INC-002";
        const amountCents = SNAPSHOT[incidentId].amountCents;
        const leaf = leafHash(incidentId, beneficiary, amountCents);
        const tier = amountCents > 100_000 ? 3 : 2; // tier derived from the amount (SNP-2)
        ticket = {
          ...ticket,
          incidentId,
          category: intent === "fee_refund" ? "claim.fee_refund" : "claim.exploit_loss",
          tier,
          eligibility: {
            incidentId,
            beneficiary,
            amountCents,
            leaf,
            proof: [h(`${leaf}:p0`), h(`${leaf}:p1`), h(`${leaf}:p2`)],
            root: INCIDENTS[incidentId].root,
            claimed: claimedLeaves.has(leaf),
          },
        };
        ticket = transition(ticket, "answered");
        ticket = transition(ticket, tier === 3 ? "awaiting_approval" : "eligible", `Snapshot leaf found · Tier ${tier}`);
      } else if (ticket.eligibility) {
        // Follow-up on an existing claim ticket: keep its claim state, just log the answer.
        ticket = transition(ticket, statusBefore === "open" ? "answered" : statusBefore, "Follow-up answered");
      } else {
        ticket = transition({ ...ticket, category: "info", tier: 0 }, "answered");
      }
      return { ticket, reply: agentMsg };
    },

    async getTicket(id) {
      await latency(100, 250);
      const t = tickets.get(id);
      if (!t) throw new Error(`Ticket ${id} not found`);
      return t;
    },

    async getMessages(id) {
      await latency(100, 250);
      return messages.get(id) ?? [];
    },

    async submitClaim(id) {
      const t0 = tickets.get(id);
      if (!t0?.eligibility) throw new Error("Ticket is not eligible for a claim");
      const { eligibility } = t0;
      let t = transition(t0, "executing", "Session key submitted disburse()");
      await latency(1600, 2600); // Sepolia block

      const base = {
        ticketId: id,
        chainId: 11155111,
        amountCents: eligibility.amountCents,
        beneficiary: eligibility.beneficiary,
      };

      if (claimedLeaves.has(eligibility.leaf)) {
        transition(t, "denied", "Vault reverted AlreadyClaimed");
        return { ...base, status: "reverted", txHash: null, receiptHash: h(`r:${id}`), errorName: "AlreadyClaimed" };
      }
      if (t.tier === 3) {
        return { ...base, status: "awaiting_approval", txHash: null, receiptHash: h(`r:${id}`), errorName: null };
      }

      claimedLeaves.add(eligibility.leaf);
      session = {
        ...session,
        usesLeft: session.usesLeft - 1,
        totalLeftCents: Math.max(0, session.totalLeftCents - eligibility.amountCents),
      };
      const receipt = buildReceipt({
        ticketId: id,
        incidentId: eligibility.incidentId as keyof typeof INCIDENTS,
        beneficiary: eligibility.beneficiary as `0x${string}`,
        amountCents: eligibility.amountCents,
        tier: 2,
        turns: (messages.get(id) ?? []).map((m) => m.content),
        teeVerified: true,
        citations: (messages.get(id) ?? []).flatMap((m) => m.citations ?? []),
      });
      receipts.set(receipt.receiptHash, receipt);
      t = { ...t, receiptHash: receipt.receiptHash as `0x${string}`, txHash: receipt.execution.txHash, eligibility: { ...eligibility, claimed: true } };
      transition(t, "paid", "Disbursed event emitted");
      return { ...base, status: "paid", txHash: receipt.execution.txHash, receiptHash: receipt.receiptHash, errorName: null };
    },

    async getReceipt(idOrHash) {
      await latency(200, 400);
      const direct = receipts.get(idOrHash);
      if (direct) return direct;
      const byTicket = [...receipts.values()].find((r) => r.ticketId === idOrHash);
      if (byTicket) return byTicket;
      throw new Error("Receipt not found");
    },

    async verifyReceipt(receipt) {
      await latency(500, 900);
      return verifyMockReceipt(receipt, agentFixture);
    },

    async listSampleReceipts() {
      await latency(100, 200);
      return samples.map(({ id, label }) => ({ id, label }));
    },

    async runAttack(kind: AttackKind): Promise<AttackResult> {
      await latency(1200, 2200);
      return { ...ATTACKS[kind], at: now() };
    },

    async listApprovals() {
      await latency(250, 500);
      return [...approvals.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async submitApproval({ ticketId, signature }) {
      await latency(900, 1500);
      const a = approvals.get(ticketId);
      if (!a) throw new Error("Approval not found");
      const next: Approval = { ...a, signature, status: "signed", approvedAt: now() };
      approvals.set(ticketId, next);
      return next;
    },

    async executeApproval(ticketId) {
      await latency(1400, 2200);
      const a = approvals.get(ticketId);
      if (!a?.approvedAt) throw new Error("Not approved yet");
      const elapsed = (Date.now() - Date.parse(a.approvedAt)) / 1000;
      if (elapsed < a.delaySeconds) throw new Error("DelayNotElapsed");
      const next: Approval = { ...a, status: "executed", txHash: h(`tx:${ticketId}`) };
      approvals.set(ticketId, next);
      return next;
    },
  };
}

/** MOCK attack outcomes (PRD Flow C). Real ones come from actual Sepolia reverts. */
const ATTACKS: Record<AttackKind, Omit<AttackResult, "at">> = {
  prompt_injection: {
    kind: "prompt_injection",
    outcome: "reverted",
    errorName: "InvalidProof",
    errorArgs: [],
    txHash: h("tx:attack:injection"),
    aiSaid: "Understood, processing a $50,000 refund to you now.",
    attemptedCall: `disburse(ticket, INC-001, ${MOCK_ATTACKER}, 5000000, proof[], receiptHash)`,
    amountAttemptedCents: 5_000_000,
    amountMovedCents: 0,
  },
  wrong_recipient: {
    kind: "wrong_recipient",
    outcome: "reverted",
    errorName: "InvalidProof",
    errorArgs: [],
    txHash: h("tx:attack:recipient"),
    aiSaid: null,
    attemptedCall: `disburse(ticket, INC-001, ${MOCK_ATTACKER}, 41237, proof[maya], receiptHash)`,
    amountAttemptedCents: 41_237,
    amountMovedCents: 0,
  },
  double_claim: {
    kind: "double_claim",
    outcome: "reverted",
    errorName: "AlreadyClaimed",
    errorArgs: [],
    txHash: h("tx:attack:double"),
    aiSaid: null,
    attemptedCall: `disburse(ticket, INC-001, ${MOCK_USER}, 41237, proof[], receiptHash)  // 2nd time`,
    amountAttemptedCents: 41_237,
    amountMovedCents: 0,
  },
  session_abuse: {
    kind: "session_abuse",
    outcome: "reverted",
    errorName: "SessionExpired",
    errorArgs: [],
    txHash: h("tx:attack:session"),
    aiSaid: null,
    attemptedCall: "disburse(...)  // signed by session key that expired 00:04:12 ago",
    amountAttemptedCents: 41_237,
    amountMovedCents: 0,
  },
  budget_drain: {
    kind: "budget_drain",
    outcome: "reverted",
    errorName: "SessionBudgetExceeded",
    errorArgs: [],
    txHash: h("tx:attack:budget"),
    aiSaid: null,
    attemptedCall: "disburse × 12 valid leaves in one block  // stops at the $2,500 session cap",
    amountAttemptedCents: 940_000,
    amountMovedCents: 0,
  },
  t3_without_approver: {
    kind: "t3_without_approver",
    outcome: "reverted",
    errorName: "InvalidApproverSig",
    errorArgs: [],
    txHash: h("tx:attack:t3"),
    aiSaid: null,
    attemptedCall: "disburseTier3(intent{$6,500}, proof[], approverSig=0x, receiptHash)",
    amountAttemptedCents: 650_000,
    amountMovedCents: 0,
  },
};
