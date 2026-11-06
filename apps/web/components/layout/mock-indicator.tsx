import { isMock } from "@/lib/api/client";

/** Visible label whenever the UI is running on mock data. Honesty rule. */
export function MockIndicator() {
  if (!isMock()) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[80] hidden rounded-full border border-warn/30 bg-bg/80 px-3 py-1.5 font-mono text-micro uppercase tracking-[0.08em] text-warn backdrop-blur sm:block">
      Mock data · not on-chain
    </div>
  );
}
