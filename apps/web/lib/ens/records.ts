/**
 * ENS text-record keys for the agent identity (PRD §3 / ENS integration).
 * Prefix comes from NEXT_PUBLIC_ENS_RECORD_PREFIX (default "alactic"),
 * e.g. alactic.receiptKey, alactic.root.INC-001 on ops.alactic.eth.
 */
import { config } from "@/lib/config";

const p = config.ensRecordPrefix;

export const ensRecordKeys = {
  receiptKey: `${p}.receiptKey`,
  vault: `${p}.vault`,
  policyHash: `${p}.policyHash`,
  modelAllowlist: `${p}.modelAllowlist`,
  kbRoot: `${p}.kbRoot`,
  incidentRoot: (incidentId: string) => `${p}.root.${incidentId}`,
} as const;
