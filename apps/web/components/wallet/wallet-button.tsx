"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** RainbowKit connect button restyled with ALACTIC tokens. */
export function WalletButton({ className, size = "sm" }: { className?: string; size?: "sm" | "md" }) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        return (
          <div aria-hidden={!ready} className={cn(!ready && "pointer-events-none opacity-0", className)}>
            {!connected ? (
              <Button size={size} variant="primary" onClick={openConnectModal}>
                Connect wallet
              </Button>
            ) : chain.unsupported ? (
              <Button size={size} variant="danger" onClick={openChainModal}>
                Switch to Sepolia
              </Button>
            ) : (
              <Button size={size} variant="ghost" onClick={openAccountModal} className="font-mono">
                <span className="size-2 rounded-full bg-verified" aria-hidden />
                {account.ensName ?? account.displayName}
              </Button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
