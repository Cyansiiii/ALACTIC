/**
 * Real backend adapter. Every response is parsed with the zod schema, so a
 * backend shape change surfaces as an ApiError naming the field, not as a
 * broken component. Endpoints are documented in docs/integration.md.
 */
import { z } from "zod";
import type { AlacticClient } from "../client";
import {
  AgentIdentity,
  Approval,
  AttackResult,
  ChatMessage,
  ClaimResult,
  Receipt,
  SendMessageResult,
  SessionStatus,
  Ticket,
  VerifyResult,
} from "../schema";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function createHttpClient(baseUrl: string): AlacticClient {
  async function request<S extends z.ZodType>(
    schema: S,
    path: string,
    init?: { method?: string; body?: unknown },
  ): Promise<z.infer<S>> {
    let res: Response;
    try {
      res = await fetch(`${baseUrl}${path}`, {
        method: init?.method ?? "GET",
        headers: init?.body ? { "content-type": "application/json" } : undefined,
        body: init?.body ? JSON.stringify(init.body) : undefined,
        credentials: "include", // SIWE session cookie
      });
    } catch (err) {
      throw new ApiError("Backend unreachable", 0, path, err);
    }
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (json && typeof json.error === "string" && json.error) || res.statusText;
      throw new ApiError(msg, res.status, path, json);
    }
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(`Response shape mismatch: ${z.prettifyError(parsed.error)}`, res.status, path);
    }
    return parsed.data;
  }

  return {
    getAgent: () => request(AgentIdentity, "/agent"),
    getSession: () => request(SessionStatus, "/session"),
    sendMessage: (input) => request(SendMessageResult, "/chat", { method: "POST", body: input }),
    getTicket: (id) => request(Ticket, `/tickets/${encodeURIComponent(id)}`),
    getMessages: (id) => request(z.array(ChatMessage), `/tickets/${encodeURIComponent(id)}/messages`),
    submitClaim: (id) => request(ClaimResult, `/claims/${encodeURIComponent(id)}`, { method: "POST" }),
    getReceipt: (id) => request(Receipt, `/receipts/${encodeURIComponent(id)}`),
    verifyReceipt: (receipt) => request(VerifyResult, "/verify", { method: "POST", body: receipt }),
    listSampleReceipts: () =>
      request(z.array(z.object({ id: z.string(), label: z.string() })), "/receipts?sample=1"),
    runAttack: (kind) => request(AttackResult, `/attacks/${kind}`, { method: "POST" }),
    listApprovals: () => request(z.array(Approval), "/approvals"),
    submitApproval: (input) =>
      request(Approval, `/approvals/${encodeURIComponent(input.ticketId)}/sign`, {
        method: "POST",
        body: { signature: input.signature },
      }),
    executeApproval: (id) =>
      request(Approval, `/approvals/${encodeURIComponent(id)}/execute`, { method: "POST" }),
  };
}
