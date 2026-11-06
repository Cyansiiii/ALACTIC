/**
 * Runtime configuration. Every integration point is env-driven so the backend and
 * contracts (built in other sessions) can be wired without touching components.
 * See apps/web/.env.example and apps/web/README.md.
 */
import type { Address } from "viem";

const env = (v: string | undefined, fallback: string) => (v && v.trim() !== "" ? v : fallback);

export const config = {
  /** "mock" = typed fixtures in lib/api/mock. "http" = real backend at apiUrl. */
  dataSource: env(process.env.NEXT_PUBLIC_DATA_SOURCE, "mock") as "mock" | "http",
  apiUrl: env(process.env.NEXT_PUBLIC_API_URL, "http://localhost:8787"),

  chainId: Number(env(process.env.NEXT_PUBLIC_CHAIN_ID, "11155111")), // Ethereum Sepolia
  rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || undefined,
  explorerUrl: env(process.env.NEXT_PUBLIC_EXPLORER_URL, "https://sepolia.etherscan.io"),
  walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "",

  /** Contract addresses. Filled after `forge script` deploys (see contracts/). */
  vaultAddress: (process.env.NEXT_PUBLIC_VAULT_ADDRESS || undefined) as Address | undefined,

  /** ENS identity of the agent (PRD §3, IDN-2). */
  ensName: env(process.env.NEXT_PUBLIC_ENS_NAME, "ops.alactic.eth"),
  ensRecordPrefix: env(process.env.NEXT_PUBLIC_ENS_RECORD_PREFIX, "alactic"),
} as const;

export const txUrl = (hash: string) => `${config.explorerUrl}/tx/${hash}`;
export const addressUrl = (addr: string) => `${config.explorerUrl}/address/${addr}`;
