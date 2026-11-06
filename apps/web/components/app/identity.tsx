"use client";
/**
 * Who is claiming. Real path: connect wallet → sign a SIWE-style message.
 * Mock path (NEXT_PUBLIC_DATA_SOURCE=mock only): a labelled demo wallet.
 */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { isMock } from "@/lib/api/client";
import { useSignIn } from "@/lib/api/hooks";
import { MOCK_USER } from "@/lib/api/mock/fixtures";
import { config } from "@/lib/config";

type Identity = {
  address: `0x${string}` | null;
  mode: "wallet" | "demo" | null;
  signedIn: boolean;
  signingIn: boolean;
  signInError: Error | null;
  signIn: () => Promise<void>;
  useDemo: () => void;
  reset: () => void;
};

const Ctx = createContext<Identity | null>(null);

export function buildSignInMessage(address: string, nonce: string) {
  return [
    `${location.host} wants you to sign in with your Ethereum account:`,
    address,
    "",
    `Sign in to ALACTIC to ask ${config.ensName} about refunds. This does not authorize any transaction.`,
    "",
    `URI: ${location.origin}`,
    "Version: 1",
    `Chain ID: ${config.chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date().toISOString()}`,
  ].join("\n");
}

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const { address: walletAddress, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const signInMutation = useSignIn();
  const [demo, setDemo] = useState(false);
  const [signedFor, setSignedFor] = useState<string | null>(null);

  const mode = isConnected && walletAddress ? "wallet" : demo ? "demo" : null;
  const address = mode === "wallet" ? walletAddress! : mode === "demo" ? (MOCK_USER as `0x${string}`) : null;

  const signIn = useCallback(async () => {
    if (!walletAddress) return;
    // TODO(backend): fetch the nonce from the API (GET /auth/nonce) instead of generating it here.
    const nonce = crypto.getRandomValues(new Uint32Array(2)).join("");
    const message = buildSignInMessage(walletAddress, nonce);
    const signature = await signMessageAsync({ message });
    await signInMutation.mutateAsync({ address: walletAddress, message, signature });
    setSignedFor(walletAddress);
  }, [walletAddress, signMessageAsync, signInMutation]);

  const value = useMemo<Identity>(
    () => ({
      address,
      mode,
      signedIn: mode === "demo" || (mode === "wallet" && signedFor === walletAddress),
      signingIn: signInMutation.isPending,
      signInError: signInMutation.error,
      signIn,
      useDemo: () => isMock() && setDemo(true),
      reset: () => {
        setDemo(false);
        setSignedFor(null);
      },
    }),
    [address, mode, signedFor, walletAddress, signInMutation.isPending, signInMutation.error, signIn],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useIdentity() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useIdentity must be used inside <IdentityProvider>");
  return v;
}
