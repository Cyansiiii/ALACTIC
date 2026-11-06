# ALACTIC

A verifiable refund agent. An AI answers claim questions, but the money rules live in a smart
contract, so it can be fooled but cannot steal. Built with **0G** (verifiable inference) and **ENS**
(agent identity).

```
apps/web/          Next.js frontend (built; runs on mock data)   → apps/web/README.md
apps/api/          orchestrator: SIWE, RAG, 0G client, policy engine, receipts (to build)
contracts/         Foundry: ClaimVault, MockUSDC, tests (to build)
packages/receipt/  receipt schema, hashing, verifier shared by web + CLI (to build)
docs/              design brief, frontend plan, integration contract
```

The frontend ⇄ backend ⇄ contracts handshake is specified in [`docs/integration.md`](docs/integration.md).

```bash
pnpm install
pnpm dev:web
```

Testnet only (Sepolia, 0G testnet). Unaudited. TEE attestation is not a proof of output.
