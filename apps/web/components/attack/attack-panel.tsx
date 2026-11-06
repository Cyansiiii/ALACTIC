"use client";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusIcon } from "@/components/ui/status";
import { ErrorState } from "@/components/ui/states";
import { getClient } from "@/lib/api/client";
import { useSession } from "@/lib/api/hooks";
import type { AttackKind, AttackResult } from "@/lib/api/schema";
import { duration, ease, spring } from "@/lib/motion/tokens";
import { cn, formatCents } from "@/lib/utils";
import { ATTACKS } from "./attacks";
import { ResultCard } from "./result-card";

export function AttackPanel() {
  const [running, setRunning] = useState<AttackKind | null>(null);
  const [current, setCurrent] = useState<AttackResult | null>(null);
  const [history, setHistory] = useState<AttackResult[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [batch, setBatch] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const fire = async (kind: AttackKind) => {
    setRunning(kind);
    setError(null);
    if (matchMedia("(max-width: 1023px)").matches) stage.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      const r = await getClient().runAttack(kind);
      setCurrent(r);
      setHistory((h) => [r, ...h]);
    } catch (e) {
      setError(e);
    } finally {
      setRunning(null);
    }
  };

  const fireAll = async () => {
    setBatch(true);
    for (const a of ATTACKS) await fire(a.kind);
    setBatch(false);
  };

  const attempted = history.reduce((s, r) => s + r.amountAttemptedCents, 0);
  const moved = history.reduce((s, r) => s + r.amountMovedCents, 0);
  const busy = running !== null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <section aria-labelledby="attacks-h">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="attacks-h" className="label-bracket">Six attacks</h2>
          <Button variant="danger" size="sm" onClick={fireAll} disabled={busy}>
            {batch ? "Running all…" : "Run all six"}
          </Button>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {ATTACKS.map((a, i) => {
            const isRunning = running === a.kind;
            const done = history.some((h) => h.kind === a.kind);
            return (
              <li key={a.kind}>
                <motion.button
                  type="button"
                  onClick={() => fire(a.kind)}
                  disabled={busy}
                  whileHover={busy ? undefined : { y: -3 }}
                  whileTap={busy ? undefined : { scale: 0.98 }}
                  transition={spring.snappy}
                  aria-describedby={`atk-${a.kind}`}
                  className={cn(
                    "group relative flex h-full w-full flex-col overflow-hidden rounded-xl border bg-surface/60 p-5 text-left transition-colors disabled:cursor-not-allowed",
                    isRunning ? "border-danger/60" : "border-line hover:border-danger/40",
                    busy && !isRunning && "opacity-60",
                  )}
                >
                  {isRunning && <span aria-hidden className="absolute inset-0 animate-pulse bg-danger-soft" />}
                  <span className="relative flex items-center justify-between">
                    <span className="font-mono text-micro text-fg-subtle">0{i + 1}</span>
                    {done && !isRunning && (
                      <span className="flex items-center gap-1 font-mono text-[0.625rem] uppercase tracking-wider text-verified">
                        <StatusIcon tone="verified" size={12} /> held
                      </span>
                    )}
                    {isRunning && <span className="font-mono text-[0.625rem] uppercase tracking-wider text-danger">firing…</span>}
                  </span>
                  <span className="relative mt-3 font-display text-h3 font-semibold text-fg">{a.title}</span>
                  <span id={`atk-${a.kind}`} className="relative mt-2 text-small text-fg-muted">{a.does}</span>
                  <span className="relative mt-4 border-t border-line pt-3 font-mono text-[0.6875rem] text-fg-subtle">
                    expect <span className="text-danger">{a.expect}</span>
                  </span>
                </motion.button>
              </li>
            );
          })}
        </ul>

        <MaxLoss session={session} attempted={attempted} moved={moved} count={history.length} />
      </section>

      <section ref={stage} aria-labelledby="result-h" className="scroll-mt-24 self-start lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
        <h2 id="result-h" className="label-bracket">Result</h2>
        <div className="mt-4" aria-live="assertive" aria-atomic="true">
          <span className="sr-only">
            {current ? `${ATTACKS.find((a) => a.kind === current.kind)?.title}: ${current.outcome} with ${current.errorName ?? "no error"}. Money moved to attacker ${formatCents(current.amountMovedCents)}.` : ""}
          </span>
          <AnimatePresence mode="wait">
            {running ? (
              <motion.div key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-xl border border-line bg-[#07080d] p-6">
                <p className="font-mono text-small text-[#a0a6bd]">
                  <span className="text-[#ff6b79]">›</span> submitting {ATTACKS.find((a) => a.kind === running)?.title.toLowerCase()} to Sepolia…
                </p>
                <div className="mt-5 space-y-3">
                  <Skeleton className="h-8 w-1/2 bg-white/5" />
                  <Skeleton className="h-4 w-3/4 bg-white/5" />
                  <Skeleton className="h-20 bg-white/5" />
                </div>
              </motion.div>
            ) : error ? (
              <ErrorState key="err" title="Attack request failed" error={error} />
            ) : current ? (
              <ResultCard key={current.at} result={current} />
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[22rem] flex-col items-center justify-center rounded-xl border border-dashed border-line-strong p-8 text-center">
                <StatusIcon tone="neutral" size={20} />
                <p className="mt-3 font-display text-h3 text-fg">Pick an attack</p>
                <p className="mt-2 max-w-xs text-small text-fg-muted">Each one sends a real call to the vault. Watch where it gets stopped.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {history.length > 1 && (
          <div className="mt-6">
            <h3 className="label-bracket">Log</h3>
            <motion.ul layout className="mt-3 divide-y divide-line rounded-lg border border-line">
              <AnimatePresence initial={false}>
                {history.map((h) => (
                  <motion.li key={h.at + h.kind} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: duration.base, ease: ease.out }} className="flex items-center justify-between gap-3 px-4 py-2.5 text-small">
                    <span className="flex items-center gap-2 text-fg">
                      <StatusIcon tone={h.outcome === "paid" ? "warn" : "danger"} size={14} />
                      {ATTACKS.find((a) => a.kind === h.kind)?.title}
                    </span>
                    <span className="font-mono text-micro text-danger">{h.errorName}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </div>
        )}
      </section>
    </div>
  );
}

function MaxLoss({ session, attempted, moved, count }: { session: ReturnType<typeof useSession>["data"]; attempted: number; moved: number; count: number }) {
  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-line bg-[linear-gradient(160deg,#0d0b26,#06070b_75%)] p-6 text-[#eef0f7]">
      <p className="label-bracket !text-[#a0a6bd]">Max-loss invariant</p>
      <p className="mt-3 text-small text-[#a0a6bd]">If the AI, the server and the session key are all compromised, the most this session can ever pay is:</p>
      <p className="mt-2 font-display text-display-xl font-medium leading-none">{session ? formatCents(session.totalCents, { compact: true }) : "…"}</p>
      <p className="mt-2 text-small text-[#a0a6bd]">
        and only to addresses in the committed snapshot, at most {session ? formatCents(session.perClaimCents, { compact: true }) : "…"} each, once each.
      </p>
      <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-5">
        <div>
          <dt className="text-micro text-[#7d839f]">Attacks run</dt>
          <dd className="mt-1 font-display text-h3">{count}</dd>
        </div>
        <div>
          <dt className="text-micro text-[#7d839f]">Attempted</dt>
          <dd className="mt-1 font-display text-h3">{formatCents(attempted, { compact: true })}</dd>
        </div>
        <div>
          <dt className="text-micro text-[#7d839f]">Moved to attacker</dt>
          <dd className={cn("mt-1 font-display text-h3", moved ? "text-[#f5b544]" : "text-[#3ddc97]")}>{formatCents(moved, { compact: true })}</dd>
        </div>
      </dl>
    </div>
  );
}
