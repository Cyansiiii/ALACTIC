# ALACTIC — Frontend ⇄ Backend ⇄ Contracts integration contract

This is the handshake between `apps/web` (built), `apps/api` (to build) and `contracts/` (to build).
The source of truth for every shape is **`apps/web/lib/api/schema.ts`** (zod). If a shape below and
that file ever disagree, the file wins. Change it there first.

## 1. Switching the frontend to the real backend

```bash
# apps/web/.env.local
NEXT_PUBLIC_DATA_SOURCE=http
NEXT_PUBLIC_API_URL=https://api.your-host.dev   # base URL, no trailing slash
```

Every response is parsed with zod in `lib/api/http/client.ts`. If the backend returns a different shape,
the UI shows an `ApiError` naming the field instead of breaking silently.

Requests use `credentials: "include"`. The backend must set a session cookie on `/auth/siwe` and send
CORS headers allowing the web origin with credentials.

## 2. HTTP endpoints `apps/api` must implement

| Method | Path | Body | Returns (schema.ts) | PRD |
|---|---|---|---|---|
| POST | `/auth/siwe` | `SignInInput { address, message, signature }` | `SignInResult` | IDN-1 |
| GET | `/agent` | — | `AgentIdentity` (ENS-resolved, `source: "ens" \| "static"`) | IDN-2 |
| GET | `/session` | — | `SessionStatus` (current agent session key caps/usage) | UI-4 |
| POST | `/chat` | `SendMessageInput { ticketId?, address, text }` | `SendMessageResult { ticket, reply }` | A2–A6 |
| GET | `/tickets/:id` | — | `Ticket` (with full `timeline`) | §12 |
| GET | `/tickets/:id/messages` | — | `ChatMessage[]` | §12 |
| POST | `/claims/:ticketId` | — | `ClaimResult` (`paid` \| `awaiting_approval` \| `reverted` + `errorName`) | A7–A9 |
| GET | `/receipts/:idOrHash` | — | `Receipt` (PRD §9 JSON) | RCP-1 |
| GET | `/receipts?sample=1` | — | `{ id, label }[]` | demo |
| POST | `/verify` | `Receipt` | `VerifyResult` (7 checks) | RCP-2 |
| POST | `/attacks/:kind` | — | `AttackResult` | Flow C |
| GET | `/approvals` | — | `Approval[]` | Flow B3 |
| POST | `/approvals/:ticketId/sign` | `{ signature }` | `Approval` | Flow B4 |
| POST | `/approvals/:ticketId/execute` | — | `Approval` | Flow B5 |

Errors: non-2xx with JSON `{ "error": "human message" }`.

### Rules the UI relies on (please keep)
- **Amounts are integer USD cents** everywhere (`amountCents`, `perClaimCents`…).
- `inference.teeVerified`: `true` only when the 0G broker validated the signed response; `false` for
  the fallback model; `null` if unknown. The UI shows "TEE verified" **only** for `true` + `network: "0g"`.
- `AgentIdentity.source = "static"` when ENS could not be resolved live. The badge then reads "Agent",
  not "Verified agent".
- `AttackResult.errorName` is the **Solidity custom error name** decoded from the revert
  (viem `decodeErrorResult` with the ClaimVault ABI). The UI looks it up in `lib/chain/errors.ts`.
- `Ticket.status` uses the PRD §12 states exactly.
- `Receipt` matches PRD §9. `receiptHash` is what the vault emits in `Disbursed`.

### /verify independence
For judging, the strongest story is that verification **does not trust our backend**. When
`packages/receipt` exists, implement `verifyReceipt` in the browser instead: resolve ENS with viem,
read the `Disbursed` event, recover the signer and recompute hashes. Then swap only
`verifyReceipt` in `lib/api/http/client.ts` to call it locally. The UI doesn't change.
`lib/api/mock/verify.ts` is a working reference of the seven checks.

## 3. Contracts → frontend

| What | Where in apps/web | How to update |
|---|---|---|
| ClaimVault ABI | `lib/chain/abi/claimVault.ts` | `forge build` then `pnpm --filter @alactic/web sync:abi` |
| Vault address | `NEXT_PUBLIC_VAULT_ADDRESS` | env |
| Error copy | `lib/chain/errors.ts` | add one entry per new custom error |
| EIP-712 domain + `Intent` struct | `lib/chain/eip712.ts` | must equal the vault's `EIP712("ClaimVault","1")` and struct order |
| Chain | `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_SEPOLIA_RPC_URL` | env |

The approver console signs `approvalTypedData(intent, vault)` with wagmi `signTypedData`. If the
contract's struct name, field order or domain differs, update `eip712.ts`. Signatures will otherwise
revert `InvalidApproverSig`.

## 4. ENS → frontend

- Name: `NEXT_PUBLIC_ENS_NAME` (default `ops.alactic.eth`).
- Text-record keys: `lib/ens/records.ts`, prefix `NEXT_PUBLIC_ENS_RECORD_PREFIX` (default `alactic`):
  `alactic.receiptKey`, `alactic.vault`, `alactic.policyHash`, `alactic.modelAllowlist`, `alactic.kbRoot`,
  `alactic.root.INC-001`, `alactic.root.INC-002`.
- `modelAllowlist` is expected to be JSON: `[{ "provider": "0x…", "model": "…" }]`.

## 5. What is mocked today

Everything under `apps/web/lib/api/mock/` is clearly marked `MOCK`. That covers the agent replies,
snapshot leaves, session caps, sample receipts, attack outcomes and approvals. Mock signatures are
**not** ECDSA. The demo wallet and "Sign as demo approver" buttons only appear when
`NEXT_PUBLIC_DATA_SOURCE=mock`.
