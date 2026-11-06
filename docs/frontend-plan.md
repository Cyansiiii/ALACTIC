# ALACTIC — Frontend Plan

## Repo layout (monorepo, frontend isolated)

```
ALACTIC/
  apps/web/            <- this session: Next.js frontend (self-contained, own package.json)
  apps/api/            <- later session: orchestrator (sign-in, RAG, 0G, policy, receipts)
  contracts/           <- later session: Foundry ClaimVault + MockUSDC
  packages/receipt/    <- later: receipt schema + hashing + verifier (shared web/CLI)
  docs/                <- design brief, plan, integration contract
  pnpm-workspace.yaml  <- lists apps/* and packages/*; web builds alone today
```

The frontend touches nothing outside `apps/web` except `docs/` and the workspace file.

## Integration seams (why backend/contract changes stay cheap)

The UI never calls `fetch`, viem or ENS directly. Everything goes through four seams inside `apps/web/lib/`:

| Seam | File(s) | Swapped how | When the backend/contracts change... |
|---|---|---|---|
| **Domain types + zod schemas** | `lib/api/schema.ts` | n/a. This is the contract. | Edit the schema. The TS compiler points at every affected component. |
| **Data client** | `lib/api/client.ts` (interface), `lib/api/mock/*` (**MOCK**), `lib/api/http/*` (live) | `NEXT_PUBLIC_DATA_SOURCE=mock\|http`, `NEXT_PUBLIC_API_URL` | Only the http adapter changes. Responses are zod-parsed, so drift fails loudly at the boundary, not deep in the UI. |
| **Chain config** | `lib/chain/addresses.ts` (env-driven), `lib/chain/abi/ClaimVault.ts` | Paste the Foundry `out/ClaimVault.json` ABI (or run `pnpm sync:abi`, which reads `../../contracts/out` if present) | New errors and events are picked up from the ABI. |
| **Revert-error catalog** | `lib/chain/errors.ts` | Keyed by Solidity error name (`InvalidProof`, `AlreadyClaimed`, ...) to a human title, layer and explanation | Add or rename one entry. Unknown errors still render generically by name. |
| **ENS identity** | `lib/ens/records.ts` | `NEXT_PUBLIC_ENS_NAME`, record keys as constants (`veriops.receiptKey` etc. per PRD, prefix configurable) | Change the prefix or name in env. |

Plus `docs/integration.md`: the endpoint list the backend must implement (shape = zod schemas), so the other session or PC has a written contract.

Planned API surface (mirrors PRD flows): `POST /auth/siwe`, `POST /chat` (answer + citations + inference receipt + ticket), `GET /tickets/:id`, `POST /claims/:ticketId` (tx), `GET /receipts/:id`, `POST /verify` (check results), `POST /attacks/:kind`, `GET /approvals`, `POST /approvals/:id/sign`, `GET /agent` (ENS-resolved identity), `GET /session` (caps and usage).

Wallet: wagmi + viem + RainbowKit on Sepolia. If `NEXT_PUBLIC_WC_PROJECT_ID` is missing, it falls back to injected-only, so the build never breaks.

## Phases (commit after each, browser-checked at 375px and 1440px)

1. **Shell:** pnpm workspace, Next.js App Router + TS + Tailwind v4, tokens file, fonts (Clash Display local, Geist, Geist Mono), theme toggle, navbar/footer, Lenis + GSAP provider (ticker-driven, lagSmoothing(0), cleanup, reduced-motion off-switch), page transitions, data layer skeleton + mocks, ENS badge.
2. **Hero + 3D:** R3F vault-orb, poster fallback, mouse/scroll parallax, split-text headline, magnetic CTAs.
3. **Landing sections:** trust strip, problem cards, pinned 5-step how-it-works, tier ladder, attack terminal teaser, verify teaser, FAQ, CTA, footer with limitations.
4. **/app:** chat, citations, Verify drawer (model/provider/TEE/chunk hashes), ticket timeline, claim confirmation + tx link.
5. **/verify:** paste or load a receipt, 7 checks animate with pass/fail/unknown.
6. **/attack:** 6 attacks, result cards with contract error names, aria-live, max-loss panel.
7. **/approver:** T3 queue, evidence package, EIP-712 sign (wagmi `signTypedData`, mock fallback), delay countdown.
8. **Polish:** responsive 320–1920, reduced motion, Lighthouse, console clean, `apps/web/README.md` on swapping mocks.

## Decisions I made (tell me if you disagree)

- **pnpm** workspace. You have pnpm installed.
- **Tailwind v4** (CSS-first `@theme`) mapped from the single tokens file.
- **Clash Display** woff2 is committed under `apps/web/public/fonts` (Fontshare's free license permits this).
- **Accent iris `#7C6CFF`, verified mint `#3DDC97`.**
- **ENS name is `ops.alactic.eth`** (user decision), env-configurable.
- Mock data includes both a TEE-verified and a NOT-verified inference, so both UI states are exercised.
