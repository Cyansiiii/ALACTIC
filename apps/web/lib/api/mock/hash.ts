/**
 * MOCK hashing helpers. These imitate the shapes of the real scheme (PRD §4.2, §9)
 * so the UI and the mock verifier behave realistically. The real implementation
 * belongs in packages/receipt and must match the contracts byte-for-byte.
 */
import { encodePacked, keccak256, toHex, type Hex } from "viem";

/** Deterministic 32-byte hash from any seed string. */
export const h = (seed: string): Hex => keccak256(toHex(seed));

/** Deterministic 20-byte address from a seed. */
export const addr = (seed: string): Hex => `0x${h(`addr:${seed}`).slice(26)}` as Hex;

export const incidentIdBytes = (incidentId: string) => h(`incident:${incidentId}`);

/** leaf = keccak256(incidentId, beneficiary, amountCents) */
export function leafHash(incidentId: string, beneficiary: string, amountCents: number): Hex {
  return keccak256(
    encodePacked(
      ["bytes32", "address", "uint256"],
      [incidentIdBytes(incidentId), beneficiary as Hex, BigInt(amountCents)],
    ),
  );
}

/** turnHash_i = keccak256(prev, i, ticketId, contentHash) */
export function turnHash(prev: string, i: number, ticketId: string, contentHash: string): Hex {
  return keccak256(
    encodePacked(["bytes", "uint256", "string", "bytes32"], [prev as Hex, BigInt(i), ticketId, contentHash as Hex]),
  );
}

/** Stable JSON (sorted keys) so the receipt hash is reproducible. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : 1));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/** receiptHash = keccak256(canonical receipt without receiptHash/signature/execution). */
export function receiptHashOf(r: Record<string, unknown>): Hex {
  const body = { ...r };
  delete body.receiptHash;
  delete body.signature;
  delete body.execution;
  return keccak256(toHex(canonicalJson(body)));
}

/** MOCK signature: NOT ECDSA. Real receipts are signed by the receipt key (viem signMessage). */
export const mockSign = (receiptHash: string, receiptKey: string): Hex => h(`sig:${receiptKey}:${receiptHash}`);
