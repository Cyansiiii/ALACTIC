"use client";
import { motion } from "motion/react";
import { Fragment } from "react";
import type { ChatMessage } from "@/lib/api/schema";
import { spring } from "@/lib/motion/tokens";
import { cn, shortHex } from "@/lib/utils";
import { InferenceBadge } from "./inference-badge";

/** Tiny formatter: **bold**, _italic_, line breaks. Agent text is never rendered as HTML. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((part, i) =>
            part.startsWith("**") ? (
              <strong key={i} className="font-semibold text-fg">{part.slice(2, -2)}</strong>
            ) : part.startsWith("_") && part.endsWith("_") && part.length > 2 ? (
              <em key={i} className="text-fg-muted">{part.slice(1, -1)}</em>
            ) : (
              <Fragment key={i}>{part}</Fragment>
            ),
          )}
        </Fragment>
      ))}
    </>
  );
}

export function Message({ message, onVerify }: { message: ChatMessage; onVerify?: (m: ChatMessage) => void }) {
  const isUser = message.role === "user";
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring.soft}
      className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}
    >
      <span className="sr-only">{isUser ? "You said:" : "Agent replied:"}</span>
      <div
        className={cn(
          "max-w-[min(36rem,92%)] rounded-lg px-4 py-3 text-[0.9375rem] leading-relaxed",
          isUser ? "rounded-br-sm bg-accent-strong text-accent-fg" : "rounded-bl-sm border border-line bg-surface text-fg",
        )}
      >
        <RichText text={message.content} />
      </div>

      {!isUser && (
        <div className="flex max-w-[min(36rem,92%)] flex-wrap items-center gap-2 pl-1">
          <InferenceBadge inference={message.inference} />
          {message.citations?.map((c) => (
            <button
              key={c.chunkHash}
              type="button"
              onClick={() => onVerify?.(message)}
              className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.6875rem] text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
              title={`${c.title} · chunk ${c.chunkHash}`}
            >
              {c.docId} · {shortHex(c.chunkHash, 4, 3)}
            </button>
          ))}
          <button type="button" onClick={() => onVerify?.(message)} className="ml-1 text-small font-medium text-accent underline-offset-4 hover:underline">
            Verify
          </button>
        </div>
      )}
    </motion.li>
  );
}

export function TypingIndicator() {
  return (
    <motion.li initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
      <div className="flex gap-1.5 rounded-lg rounded-bl-sm border border-line bg-surface px-4 py-3.5" role="status" aria-label="Agent is thinking">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 animate-pulse rounded-full bg-fg-muted" style={{ animationDelay: `${i * 160}ms` }} />
        ))}
      </div>
      <span className="font-mono text-micro text-fg-subtle">retrieving · 0G inference</span>
    </motion.li>
  );
}
