/**
 * Inline script that runs before first paint on full page loads. Rendered as
 * text/plain on the client so React doesn't warn (pattern from the Next.js
 * "preventing flash before hydration" guide).
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
