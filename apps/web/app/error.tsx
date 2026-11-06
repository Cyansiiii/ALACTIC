"use client";
import { Button } from "@/components/ui/button";
import { StatusIcon } from "@/components/ui/status";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container-x flex min-h-[80svh] flex-col items-start justify-center pt-[var(--nav-h)]" role="alert">
      <p className="label-bracket flex items-center gap-2"><StatusIcon tone="danger" size={14} /> Something failed closed</p>
      <h1 className="mt-5 max-w-2xl font-display text-h1 font-semibold text-fg">This view hit an error. No funds moved.</h1>
      <p className="mt-4 max-w-lg font-mono text-small text-fg-muted">{error.message}{error.digest && ` · ${error.digest}`}</p>
      <Button variant="outline" className="mt-8" onClick={reset}>Try again</Button>
    </section>
  );
}
