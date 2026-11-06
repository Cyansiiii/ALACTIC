/**
 * The ONE interface the UI talks to. Components never call fetch/viem directly.
 * Implementations:
 *   - lib/api/mock  → typed fixtures with simulated latency (MOCK DATA)
 *   - lib/api/http  → real backend (apps/api), zod-validated
 * Switch with NEXT_PUBLIC_DATA_SOURCE=mock|http.
 */
import { config } from "@/lib/config";
import type {
  AgentIdentity,
  Approval,
  AttackKind,
  AttackResult,
  ClaimResult,
  ChatMessage,
  Receipt,
  SendMessageInput,
  SendMessageResult,
  SessionStatus,
  SignInInput,
  SignInResult,
  SubmitApprovalInput,
  Ticket,
  VerifyResult,
} from "./schema";
import { createHttpClient } from "./http/client";
import { createMockClient } from "./mock/client";

export interface AlacticClient {
  /** Verify a signed sign-in message and start a session (sets a cookie on the real backend). */
  signIn(input: SignInInput): Promise<SignInResult>;
  /** ENS-resolved agent identity (receiptKey, vault, policyHash, roots…). */
  getAgent(): Promise<AgentIdentity>;
  /** Current session-key caps and usage. */
  getSession(): Promise<SessionStatus>;

  /** Ask the agent. Returns the updated ticket and the agent's reply. */
  sendMessage(input: SendMessageInput): Promise<SendMessageResult>;
  getTicket(ticketId: string): Promise<Ticket>;
  getMessages(ticketId: string): Promise<ChatMessage[]>;
  /** Execute the payout for an eligible ticket (session key submits). */
  submitClaim(ticketId: string): Promise<ClaimResult>;

  getReceipt(idOrHash: string): Promise<Receipt>;
  /** Run the /verify algorithm (PRD §9) over a receipt. */
  verifyReceipt(receipt: Receipt): Promise<VerifyResult>;
  /** IDs or hashes of example receipts to preload on /verify. */
  listSampleReceipts(): Promise<{ id: string; label: string }[]>;

  runAttack(kind: AttackKind): Promise<AttackResult>;

  listApprovals(): Promise<Approval[]>;
  submitApproval(input: SubmitApprovalInput): Promise<Approval>;
  executeApproval(ticketId: string): Promise<Approval>;
}

let singleton: AlacticClient | null = null;

export function getClient(): AlacticClient {
  if (!singleton) {
    singleton = config.dataSource === "http" ? createHttpClient(config.apiUrl) : createMockClient();
  }
  return singleton;
}

export const isMock = () => config.dataSource !== "http";
