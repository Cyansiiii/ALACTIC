/**
 * EIP-712 typed data for Tier-3 approvals (PRD Flow B4).
 * MUST match the vault's EIP712 domain + Approval struct. Update when the
 * contract is written (name/version/verifyingContract).
 */
import type { Address } from "viem";
import { config } from "@/lib/config";
import type { Intent } from "@/lib/api/schema";

export const approvalTypes = {
  Intent: [
    { name: "ticketId", type: "bytes32" },
    { name: "incidentId", type: "bytes32" },
    { name: "beneficiary", type: "address" },
    { name: "amountCents", type: "uint256" },
    { name: "evidenceHash", type: "bytes32" },
    { name: "deadline", type: "uint64" },
  ],
} as const;

export function approvalTypedData(intent: Intent, vault: Address) {
  return {
    domain: { name: "ClaimVault", version: "1", chainId: config.chainId, verifyingContract: vault },
    types: approvalTypes,
    primaryType: "Intent" as const,
    message: {
      ticketId: intent.ticketId as `0x${string}`,
      incidentId: intent.incidentId as `0x${string}`,
      beneficiary: intent.beneficiary as Address,
      amountCents: BigInt(intent.amountCents),
      evidenceHash: intent.evidenceHash as `0x${string}`,
      deadline: BigInt(intent.deadline),
    },
  };
}
