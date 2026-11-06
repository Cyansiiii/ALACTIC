/**
 * MOCK verifier implementing the PRD §9 algorithm against mock ENS + mock chain.
 * It genuinely recomputes hashes, so editing a receipt on /verify makes the
 * relevant checks fail. The live version should run the same steps with
 * packages/receipt + viem (ENS resolver, getTransactionReceipt, ecrecover).
 */
import { shortHex, formatCents } from "@/lib/utils";
import type { AgentIdentity, Receipt, VerifyCheck, VerifyResult } from "../schema";
import { leafHash, mockSign, receiptHashOf } from "./hash";
import { mockChainEvents } from "./fixtures";

export function verifyMockReceipt(r: Receipt, agent: AgentIdentity): VerifyResult {
  const checks: VerifyCheck[] = [];

  // 1. Turn hash chain
  {
    let ok = r.turns.length > 0;
    let prev = "0x0";
    r.turns.forEach((t, idx) => {
      if (t.i !== idx || t.prev !== prev) ok = false;
      prev = t.turnHash;
    });
    checks.push({
      id: "turn_chain",
      status: ok ? "pass" : "fail",
      detail: ok ? `${r.turns.length} turns linked, none edited or reordered` : "Turn chain is broken: a turn was edited, removed or reordered",
      evidence: r.turns.map((t) => ({ label: `turn ${t.i}`, value: t.turnHash, mono: true })),
    });
  }

  // 2. Signature vs ENS receiptKey
  {
    const recomputed = receiptHashOf(r as unknown as Record<string, unknown>);
    const keyMatches = r.agent.receiptKey.toLowerCase() === agent.receiptKey.toLowerCase();
    const sigOk = r.signature === mockSign(recomputed, agent.receiptKey);
    checks.push({
      id: "signature",
      status: keyMatches && sigOk ? "pass" : "fail",
      detail: !keyMatches
        ? `Receipt names key ${shortHex(r.agent.receiptKey)}, ENS publishes ${shortHex(agent.receiptKey)}`
        : sigOk
          ? `Signed by ${shortHex(agent.receiptKey)}, the receiptKey published on ${agent.ensName}`
          : "Signature does not match the receipt contents",
      evidence: [
        { label: "ENS name", value: agent.ensName },
        { label: "receiptKey (ENS)", value: agent.receiptKey, mono: true },
        { label: "signature", value: r.signature, mono: true },
      ],
    });
  }

  // 3. On-chain receiptHash from the Disbursed event
  const event = mockChainEvents.get(r.execution.txHash);
  {
    const recomputed = receiptHashOf(r as unknown as Record<string, unknown>);
    const status = !event ? "unknown" : event.receiptHash === recomputed && recomputed === r.receiptHash ? "pass" : "fail";
    checks.push({
      id: "receipt_hash",
      status,
      detail:
        status === "unknown"
          ? "No Disbursed event found for this transaction"
          : status === "pass"
            ? "Disbursed event carries exactly this receipt's hash"
            : "Receipt contents do not hash to the value emitted on-chain",
      evidence: [
        { label: "tx", value: r.execution.txHash, mono: true },
        { label: "recomputed", value: recomputed, mono: true },
        { label: "event.receiptHash", value: event?.receiptHash ?? "not found", mono: true },
      ],
    });
  }

  // 4. Snapshot root: receipt vs on-chain vs ENS
  {
    const ensRoot = agent.incidentRoots[r.snapshot.incidentId];
    const ok = !!ensRoot && ensRoot === r.snapshot.root;
    checks.push({
      id: "snapshot_root",
      status: ensRoot ? (ok ? "pass" : "fail") : "unknown",
      detail: !ensRoot
        ? `No ENS record for ${r.snapshot.incidentId}`
        : ok
          ? `${r.snapshot.incidentId} root matches the vault and the ENS record`
          : "Snapshot root differs from the committed root",
      evidence: [
        { label: "receipt root", value: r.snapshot.root, mono: true },
        { label: "ENS / on-chain root", value: ensRoot ?? "missing", mono: true },
      ],
    });
  }

  // 5. Amount + beneficiary == leaf == event
  {
    const leaf = leafHash(r.snapshot.incidentId, r.identity.address, r.snapshot.amountCents);
    const leafOk = leaf === r.snapshot.leaf;
    const eventOk = !!event && event.amountCents === r.snapshot.amountCents && event.beneficiary.toLowerCase() === r.identity.address.toLowerCase();
    checks.push({
      id: "amount_leaf",
      status: leafOk && eventOk ? "pass" : event ? "fail" : "unknown",
      detail:
        leafOk && eventOk
          ? `Paid exactly ${formatCents(r.snapshot.amountCents)} to the committed address`
          : !leafOk
            ? "Amount or beneficiary does not match the snapshot leaf"
            : "On-chain payout differs from the leaf",
      evidence: [
        { label: "beneficiary", value: r.identity.address, mono: true },
        { label: "amount", value: formatCents(r.snapshot.amountCents) },
        { label: "leaf", value: r.snapshot.leaf, mono: true },
      ],
    });
  }

  // 6. Inference: 0G provider/model + teeVerified, vs ENS allowlist
  {
    const allowed = agent.modelAllowlist.some(
      (m) => m.provider.toLowerCase() === r.inference.provider.toLowerCase() && m.model === r.inference.model,
    );
    const tee = r.inference.teeVerified;
    const status = tee === null ? "unknown" : tee && allowed ? "pass" : "fail";
    checks.push({
      id: "inference",
      status,
      detail:
        tee === null
          ? "TEE verification result not available"
          : !tee
            ? "Inference NOT verified: answered by a fallback model outside 0G"
            : allowed
              ? "TEE-attested 0G provider and model are on the ENS allowlist"
              : "Model or provider is not on the ENS allowlist",
      evidence: [
        { label: "provider", value: r.inference.provider, mono: true },
        { label: "model", value: r.inference.model },
        { label: "teeVerified", value: String(tee) },
        { label: "trust level", value: "TEE attestation (not a proof of output)" },
      ],
    });
  }

  // 7. Tier-3 approver + delay
  {
    if (r.policy.tier !== 3) {
      checks.push({ id: "tier3_approval", status: "skipped", detail: `Tier ${r.policy.tier} payout: no approver required`, evidence: [] });
    } else if (!r.approval) {
      checks.push({ id: "tier3_approval", status: "fail", detail: "Tier-3 payout without an approval record", evidence: [] });
    } else {
      const waited = (Date.parse(r.approval.paidAt) - Date.parse(r.approval.approvedAt)) / 1000;
      const ok = waited >= r.approval.delaySeconds;
      checks.push({
        id: "tier3_approval",
        status: ok ? "pass" : "fail",
        detail: ok
          ? `Approved by ${shortHex(r.approval.approver)}, paid ${Math.round(waited / 60)} min later (delay ${r.approval.delaySeconds / 60} min)`
          : "Paid before the required delay elapsed",
        evidence: [
          { label: "approver", value: r.approval.approver, mono: true },
          { label: "intentHash", value: r.approval.intentHash, mono: true },
          { label: "approved", value: r.approval.approvedAt },
          { label: "paid", value: r.approval.paidAt },
        ],
      });
    }
  }

  return { receiptHash: r.receiptHash as `0x${string}`, checks, checkedAt: new Date().toISOString() };
}
