"use client";
import { motion } from "motion/react";
import { WalletButton } from "@/components/wallet/wallet-button";
import { Button } from "@/components/ui/button";
import { StatusIcon } from "@/components/ui/status";
import { isMock } from "@/lib/api/client";
import { duration, ease } from "@/lib/motion/tokens";
import { useIdentity } from "./identity";

export function SignInGate() {
  const id = useIdentity();
  const step = id.mode === "wallet" ? 2 : 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.slow, ease: ease.out }}
      className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center"
    >
      <p className="label-bracket">Step 0{step} of 02</p>
      <h1 className="mt-4 font-display text-h2 font-semibold text-fg">{step === 1 ? "Connect the wallet you'd be paid to" : "Prove it's your wallet"}</h1>
      <p className="mt-3 text-fg-muted">
        {step === 1
          ? "Refunds can only go to addresses already in the committed snapshot, so the agent needs to know which one is yours."
          : "Sign a message (no transaction, no gas). The agent only answers for the address that signed."}
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        {step === 1 ? (
          <>
            <WalletButton size="md" />
            {isMock() && (
              <Button variant="ghost" onClick={id.useDemo}>
                Continue with demo wallet
              </Button>
            )}
          </>
        ) : (
          <Button variant="accent" size="lg" onClick={() => id.signIn().catch(() => {})} disabled={id.signingIn}>
            {id.signingIn ? "Waiting for signature…" : "Sign in with Ethereum"}
          </Button>
        )}
      </div>
      {id.signInError && (
        <p role="alert" className="mt-4 flex items-center gap-2 text-small text-danger">
          <StatusIcon tone="danger" size={14} /> {id.signInError.message.split("\n")[0]}
        </p>
      )}
      {isMock() && step === 1 && <p className="mt-6 font-mono text-micro text-warn">Demo wallet uses mock data. Nothing is signed or sent on-chain.</p>}
    </motion.div>
  );
}
