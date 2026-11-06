# ALACTIC · web

Frontend for ALACTIC, a verifiable refund agent. The AI can be fooled; the vault cannot be made to steal.
Next.js 16 (App Router) · TypeScript · Tailwind v4 · GSAP + Lenis · Motion · React Three Fiber · wagmi/viem/RainbowKit.

## Run

```bash
pnpm install            # from the repo root
pnpm dev:web            # http://localhost:3000  (mock data by default)
pnpm build:web
```

Copy `.env.example` → `.env.local` to configure. With no env at all, the app runs on mock data with
injected wallets only.

## Pages

| Route | What |
|---|---|
| `/` | Landing: 3D vault hero, problem, pinned how-it-works, tier ladder, attack and verify teasers, FAQ |
| `/app` | Sign in → chat with citations → claim card → ticket timeline, Verify drawer |
| `/verify` | Receipt checker: 7 PRD §9 checks (pass / fail / unknown / not applicable) |
| `/attack` | Six attacks → contract revert names, max-loss panel |
| `/approver` | Tier-3 queue, evidence package, EIP-712 sign, delay countdown |

## Swapping mock data for the real API

The UI talks to **one interface**, `AlacticClient` in `lib/api/client.ts`. Components never call fetch,
viem or ENS directly; they use the React Query hooks in `lib/api/hooks.ts`.

1. Implement the endpoints listed in [`docs/integration.md`](../../docs/integration.md) in `apps/api`.
   The shapes are the zod schemas in `lib/api/schema.ts`.
2. Set `NEXT_PUBLIC_DATA_SOURCE=http` and `NEXT_PUBLIC_API_URL=…`.
3. That's it. `lib/api/http/client.ts` already maps every method to its endpoint and validates responses.

When the backend changes a shape: edit `lib/api/schema.ts`, run `pnpm --filter @alactic/web typecheck`,
and fix what TypeScript points at. To change a URL, edit only `lib/api/http/client.ts`.

When the contracts change: run `forge build` and then `pnpm --filter @alactic/web sync:abi`, set
`NEXT_PUBLIC_VAULT_ADDRESS`, add copy for any new custom errors in `lib/chain/errors.ts`, and keep
`lib/chain/eip712.ts` in sync with the vault's EIP-712 domain and struct.

Everything mocked lives in `lib/api/mock/` and is labelled `MOCK`. A "Mock data · not on-chain" pill is
shown on every page while mocks are active.

## Layout

```
app/                 routes (layout, template = page transition, not-found, error)
components/
  landing/           hero + sections
  three/             R3F vault scene + poster/lazy-load wrapper
  app/ verify/ attack/ approver/   page features
  layout/ ens/ wallet/ ui/         shell + primitives (button, status, hash, drawer, toast…)
lib/
  api/               schema (contract), client interface, http + mock adapters, hooks
  chain/             ABI, EIP-712, revert-error catalogue, wagmi config
  ens/               ENS record keys
  motion/            GSAP registration, Lenis provider, reveal/magnetic/counter helpers, tokens
styles/tokens.css    design tokens (colors, radii, shadows, spacing, type scale, easing, durations)
public/hero/         static posters for the 3D hero
scripts/sync-abi.mjs copies the Foundry ABI in
```

## Motion and accessibility rules

- GSAP owns scroll choreography (Lenis via `gsap.ticker`, pins, split text, parallax, counters, marquee).
  Motion (Framer) owns UI state (mount/exit, layout, drawers, gestures). They never animate the same property.
- `prefers-reduced-motion`: Lenis is off, the how-it-works pin becomes a stacked list, the 3D is replaced
  by its poster, and reveals are static.
- Scroll areas that must not be smoothed (chat, JSON, drawers) carry `data-lenis-prevent`.
- The 3D hero shows a poster first. three.js loads on first interaction (or after 6 s), only on desktop,
  and never with Save-Data or reduced motion.
- Status is always icon + text, never color alone. Claim, attack and verify results use `aria-live`.

## Honesty rules (enforced in code)

- "TEE verified" only when `teeVerified === true` on the 0G network. Otherwise "Inference NOT verified"
  or "TEE status unknown".
- "Verified agent" only when ENS was resolved live (`source: "ens"`).
- Sponsor marks are typeset wordmarks, not invented logos. Replace them with official brand-kit SVGs if allowed.

## Fonts

All self-hosted: Clash Display (Fontshare, `app/fonts`), Instrument Serif (`app/fonts`), Geist and
Geist Mono (`geist` package).
