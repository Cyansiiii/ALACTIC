"use client";
import type { ChatMessage } from "@/lib/api/schema";
import { Drawer } from "@/components/ui/drawer";
import { Hash } from "@/components/ui/hash";
import { StatusIcon } from "@/components/ui/status";
import { addressUrl } from "@/lib/config";
import { inferenceState, InferenceBadge } from "./inference-badge";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-small text-fg-muted">{label}</dt>
      <dd className="min-w-0 text-right text-small text-fg">{children}</dd>
    </div>
  );
}

export function VerifyDrawer({ message, onClose }: { message: ChatMessage | null; onClose: () => void }) {
  const inf = message?.inference;
  const state = inferenceState(inf);
  return (
    <Drawer open={!!message} onClose={onClose} title="Verify this answer" description="What produced this reply, and what it was grounded on.">
      {message && (
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between">
              <h3 className="label-bracket">Inference</h3>
              <InferenceBadge inference={inf} />
            </div>
            {inf ? (
              <dl className="mt-3 divide-y divide-line rounded-lg border border-line px-4">
                <Row label="Network">{inf.network === "0g" ? "0G Compute" : "Fallback (not 0G)"}</Row>
                <Row label="Model"><span className="font-mono text-[0.8125rem]">{inf.model}</span></Row>
                <Row label="Provider"><Hash value={inf.provider} href={addressUrl(inf.provider)} /></Row>
                <Row label="Chat ID"><span className="font-mono text-[0.8125rem]">{inf.chatId}</span></Row>
                <Row label="Input hash"><Hash value={inf.inputHash} /></Row>
                <Row label="Output hash"><Hash value={inf.outputHash} /></Row>
                <Row label="TEE status">
                  <span className="inline-flex items-center gap-1.5">
                    <StatusIcon tone={state.tone} size={14} />
                    {inf.teeVerified === true ? "Verified" : inf.teeVerified === false ? "Not verified" : "Unknown"}
                  </span>
                </Row>
              </dl>
            ) : (
              <p className="mt-3 text-small text-fg-muted">No inference receipt attached to this message.</p>
            )}
            <p className="mt-3 text-micro text-fg-subtle">
              TEE attestation shows the declared model ran in attested hardware under the provider&apos;s key. It is not a proof that the output is correct, which is why amounts never come from the model.
            </p>
          </section>

          <section>
            <h3 className="label-bracket">Grounding · {message.citations?.length ?? 0} chunks</h3>
            <ul className="mt-3 space-y-3">
              {message.citations?.map((c) => (
                <li key={c.chunkHash} className="rounded-lg border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-small font-medium text-fg">{c.title}</p>
                    <span className="font-mono text-micro text-fg-subtle">{c.docId}</span>
                  </div>
                  <blockquote className="mt-2 border-l-2 border-line-strong pl-3 text-small text-fg-muted">{c.excerpt}</blockquote>
                  <div className="mt-3 flex items-center gap-2 text-micro text-fg-subtle">
                    keccak256 <Hash value={c.chunkHash} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {message.turnHash && (
            <section>
              <h3 className="label-bracket">Turn</h3>
              <dl className="mt-3 rounded-lg border border-line px-4">
                <Row label="Turn hash"><Hash value={message.turnHash} /></Row>
              </dl>
              <p className="mt-2 text-micro text-fg-subtle">Each turn is hash-chained to the previous one and included in the signed receipt.</p>
            </section>
          )}
        </div>
      )}
    </Drawer>
  );
}
