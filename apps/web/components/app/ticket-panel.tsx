"use client";
import { motion } from "motion/react";
import type { SessionStatus, Ticket, TicketStatus } from "@/lib/api/schema";
import { Hash } from "@/components/ui/hash";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusChip, type StatusTone } from "@/components/ui/status";
import { spring } from "@/lib/motion/tokens";
import { cn, formatCents } from "@/lib/utils";

const STATUS_TONE: Record<TicketStatus, StatusTone> = {
  open: "neutral", triaging: "neutral", answered: "neutral", eligible: "verified", ineligible: "warn",
  awaiting_approval: "accent", approved: "accent", executing: "accent", paid: "verified",
  retry_scheduled: "warn", denied: "danger", closed: "neutral",
};

export const statusLabel = (s: TicketStatus) => s.replace(/_/g, " ");

export function TicketPanel({ ticket, session }: { ticket: Ticket | null; session: SessionStatus | undefined }) {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-line bg-surface/60 p-5">
        <div className="flex items-center justify-between">
          <h2 className="label-bracket">Ticket</h2>
          {ticket && <StatusChip tone={STATUS_TONE[ticket.status]}>{statusLabel(ticket.status)}</StatusChip>}
        </div>
        {ticket ? (
          <>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-small">
              <dt className="text-fg-subtle">ID</dt>
              <dd className="truncate font-mono text-[0.8125rem] text-fg">{ticket.ticketId}</dd>
              <dt className="text-fg-subtle">Category</dt>
              <dd className="font-mono text-[0.8125rem] text-fg">{ticket.category}</dd>
              <dt className="text-fg-subtle">Tier</dt>
              <dd className="text-fg">T{ticket.tier} <span className="text-fg-subtle">· derived from amount</span></dd>
              {ticket.txHash && (
                <>
                  <dt className="text-fg-subtle">Tx</dt>
                  <dd><Hash value={ticket.txHash} /></dd>
                </>
              )}
            </dl>
            <ol className="relative mt-6 space-y-4 border-l border-line pl-5" aria-label="Ticket timeline">
              {ticket.timeline.map((ev, i) => (
                <motion.li key={`${ev.status}-${i}`} layout initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={spring.soft} className="relative">
                  <span className={cn("absolute -left-[25px] top-1.5 size-2.5 rounded-full border-2 border-bg", i === ticket.timeline.length - 1 ? "bg-accent" : "bg-line-strong")} aria-hidden />
                  <p className="text-small font-medium capitalize text-fg">{statusLabel(ev.status)}</p>
                  <p className="text-micro text-fg-subtle">
                    {new Date(ev.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    {ev.note && ` · ${ev.note}`}
                  </p>
                </motion.li>
              ))}
            </ol>
          </>
        ) : (
          <p className="mt-4 text-small text-fg-muted">A ticket opens with your first question. Its status and every transition appear here.</p>
        )}
      </section>

      <section className="rounded-xl border border-line bg-surface/60 p-5">
        <h2 className="label-bracket">Agent session key</h2>
        {session ? (
          <div className="mt-4 space-y-4">
            <Meter label="Session budget left" value={session.totalLeftCents} max={session.totalCents} format={formatCents} />
            <Meter label="Uses left" value={session.usesLeft} max={session.maxUses} format={(n) => String(n)} />
            <dl className="grid grid-cols-2 gap-3 text-small">
              <div><dt className="text-fg-subtle">Per claim cap</dt><dd className="text-fg">{formatCents(session.perClaimCents, { compact: true })}</dd></div>
              <div><dt className="text-fg-subtle">Tier 3</dt><dd className="text-fg">{session.allowT3 ? "Enabled" : "Disabled"}</dd></div>
              <div><dt className="text-fg-subtle">Expires</dt><dd className="text-fg">{new Date(session.expiry).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</dd></div>
              <div><dt className="text-fg-subtle">Key</dt><dd><Hash value={session.sessionKey} head={4} tail={3} /></dd></div>
            </dl>
          </div>
        ) : (
          <div className="mt-4 space-y-3"><Skeleton className="h-8" /><Skeleton className="h-8" /></div>
        )}
      </section>
    </div>
  );
}

function Meter({ label, value, max, format }: { label: string; value: number; max: number; format: (n: number) => string }) {
  const pct = max ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-small">
        <span className="text-fg-muted">{label}</span>
        <span className="font-mono text-fg">{format(value)} / {format(max)}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
        <motion.div className="h-full rounded-full bg-gradient-to-r from-accent-strong to-verified" initial={false} animate={{ width: `${pct}%` }} transition={spring.soft} />
      </div>
    </div>
  );
}
