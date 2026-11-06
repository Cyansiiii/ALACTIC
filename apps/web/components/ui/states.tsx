import { cn } from "@/lib/utils";
import { StatusIcon } from "./status";
import { Button } from "./button";

export function EmptyState({ title, description, action, className }: { title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong px-6 py-14 text-center", className)}>
      <StatusIcon tone="neutral" size={20} />
      <p className="mt-3 font-display text-h3 text-fg">{title}</p>
      {description && <p className="mt-2 max-w-sm text-small text-fg-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", error, onRetry, className }: { title?: string; error?: unknown; onRetry?: () => void; className?: string }) {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : undefined;
  return (
    <div role="alert" className={cn("flex flex-col items-start gap-3 rounded-xl border border-danger/30 bg-danger-soft p-5", className)}>
      <div className="flex items-center gap-2">
        <StatusIcon tone="danger" />
        <p className="font-medium text-fg">{title}</p>
      </div>
      {message && <p className="font-mono text-small text-fg-muted">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
