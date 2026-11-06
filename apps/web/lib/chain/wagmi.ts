"use client";
/**
 * wagmi + RainbowKit config for Ethereum Sepolia.
 * Without NEXT_PUBLIC_WC_PROJECT_ID only injected wallets (MetaMask, Rabby, …)
 * are offered, so the app still builds and runs with zero setup.
 */
import { connectorsForWallets, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { config } from "@/lib/config";

const transports = { [sepolia.id]: http(config.rpcUrl) };

export const wagmiConfig = config.walletConnectProjectId
  ? getDefaultConfig({
      appName: "ALACTIC",
      projectId: config.walletConnectProjectId,
      chains: [sepolia],
      transports,
      ssr: true,
    })
  : createConfig({
      chains: [sepolia],
      transports,
      ssr: true,
      connectors: connectorsForWallets([{ groupName: "Detected", wallets: [injectedWallet] }], {
        appName: "ALACTIC",
        projectId: "unset", // WalletConnect wallets are not offered without a real id
      }),
    });
