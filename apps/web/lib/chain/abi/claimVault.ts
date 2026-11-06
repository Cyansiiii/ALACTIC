/**
 * ClaimVault ABI — PLACEHOLDER derived from the PRD §8.2 interface sketch.
 * Replace with the real Foundry artifact once contracts/ exists:
 *   pnpm --filter @alactic/web sync:abi   (copies contracts/out/ClaimVault.sol/ClaimVault.json → here)
 * Keep `as const` so viem infers types for reads, writes and decoded errors.
 */
export const claimVaultAbi = [
  { type: "function", name: "t2CapCents", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "t3CapCents", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "t3DelaySeconds", stateMutability: "view", inputs: [], outputs: [{ type: "uint64" }] },
  { type: "function", name: "approver", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  {
    type: "function",
    name: "incidents",
    stateMutability: "view",
    inputs: [{ name: "id", type: "bytes32" }],
    outputs: [
      { name: "root", type: "bytes32" },
      { name: "budgetLeftCents", type: "uint256" },
      { name: "expiry", type: "uint64" },
    ],
  },
  {
    type: "function",
    name: "sessions",
    stateMutability: "view",
    inputs: [{ name: "key", type: "address" }],
    outputs: [
      { name: "expiry", type: "uint64" },
      { name: "usesLeft", type: "uint16" },
      { name: "perClaimCents", type: "uint256" },
      { name: "totalLeftCents", type: "uint256" },
      { name: "allowT3", type: "bool" },
      { name: "revoked", type: "bool" },
    ],
  },
  { type: "function", name: "claimed", stateMutability: "view", inputs: [{ name: "leaf", type: "bytes32" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "approvedAt", stateMutability: "view", inputs: [{ name: "intentHash", type: "bytes32" }], outputs: [{ type: "uint64" }] },
  {
    type: "function",
    name: "submitApproval",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "i",
        type: "tuple",
        components: [
          { name: "ticketId", type: "bytes32" },
          { name: "incidentId", type: "bytes32" },
          { name: "beneficiary", type: "address" },
          { name: "amountCents", type: "uint256" },
          { name: "evidenceHash", type: "bytes32" },
          { name: "deadline", type: "uint64" },
        ],
      },
      { name: "approverSig", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "event",
    name: "Disbursed",
    inputs: [
      { name: "ticketId", type: "bytes32", indexed: true },
      { name: "incidentId", type: "bytes32", indexed: true },
      { name: "beneficiary", type: "address", indexed: false },
      { name: "amountCents", type: "uint256", indexed: false },
      { name: "sessionKey", type: "address", indexed: false },
      { name: "receiptHash", type: "bytes32", indexed: false },
    ],
  },
  ...(
    [
      "InvalidProof", "AlreadyClaimed", "SessionExpired", "SessionRevoked", "SessionUsesExhausted",
      "SessionBudgetExceeded", "NotSession", "T3NotAllowed", "InvalidApproverSig", "IntentMismatch",
      "ApprovalExpired", "DelayNotElapsed", "IncidentExpired", "BudgetExhausted", "Paused",
    ] as const
  ).map((name) => ({ type: "error", name, inputs: [] }) as const),
  { type: "error", name: "CapExceeded", inputs: [{ name: "cents", type: "uint256" }] },
] as const;
