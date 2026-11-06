/**
 * Inference trust badge. "TEE verified" appears ONLY when the receipt says
 * teeVerified === true on the 0G network. Everything else is labelled plainly.
 */
import type { InferenceReceipt } from "@/lib/api/schema";
import { StatusChip } from "@/components/ui/status";

export function inferenceState(inf: InferenceReceipt | undefined) {
  if (!inf || inf.teeVerified === null) return { tone: "unknown" as const, label: "TEE status unknown" };
  if (inf.teeVerified && inf.network === "0g") return { tone: "verified" as const, label: "0G · TEE verified" };
  return { tone: "warn" as const, label: "Inference NOT verified" };
}

export function InferenceBadge({ inference, className }: { inference: InferenceReceipt | undefined; className?: string }) {
  const s = inferenceState(inference);
  return (
    <StatusChip tone={s.tone} className={className}>
      {s.label}
    </StatusChip>
  );
}
