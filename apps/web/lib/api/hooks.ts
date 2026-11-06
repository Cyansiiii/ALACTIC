"use client";
/** React Query bindings for the data client. Components import these, not the client. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getClient } from "./client";
import type { AttackKind, Receipt, SendMessageInput, SignInInput, SubmitApprovalInput } from "./schema";

export const qk = {
  agent: ["agent"] as const,
  session: ["session"] as const,
  ticket: (id: string) => ["ticket", id] as const,
  receipt: (id: string) => ["receipt", id] as const,
  samples: ["receipts", "samples"] as const,
  approvals: ["approvals"] as const,
};

export const useSignIn = () =>
  useMutation({ mutationFn: (input: SignInInput) => getClient().signIn(input) });

export const useAgent = () =>
  useQuery({ queryKey: qk.agent, queryFn: () => getClient().getAgent(), staleTime: 5 * 60_000 });

export const useSession = () =>
  useQuery({ queryKey: qk.session, queryFn: () => getClient().getSession(), staleTime: 15_000 });

export const useSendMessage = () =>
  useMutation({ mutationFn: (input: SendMessageInput) => getClient().sendMessage(input) });

export function useSubmitClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => getClient().submitClaim(ticketId),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.session }),
  });
}

export const useTicket = (id: string | null) =>
  useQuery({ queryKey: qk.ticket(id ?? ""), queryFn: () => getClient().getTicket(id!), enabled: !!id });

export const useReceipt = (id: string | null) =>
  useQuery({ queryKey: qk.receipt(id ?? ""), queryFn: () => getClient().getReceipt(id!), enabled: !!id, retry: false });

export const useSampleReceipts = () =>
  useQuery({ queryKey: qk.samples, queryFn: () => getClient().listSampleReceipts() });

export const useVerifyReceipt = () =>
  useMutation({ mutationFn: (receipt: Receipt) => getClient().verifyReceipt(receipt) });

export const useRunAttack = () =>
  useMutation({ mutationFn: (kind: AttackKind) => getClient().runAttack(kind) });

export const useApprovals = () =>
  useQuery({ queryKey: qk.approvals, queryFn: () => getClient().listApprovals(), refetchInterval: 15_000 });

export function useSubmitApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitApprovalInput) => getClient().submitApproval(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.approvals }),
  });
}

export function useExecuteApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => getClient().executeApproval(ticketId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.approvals }),
  });
}
