/**
 * Only ever redirect to a path on this site. Anything else (another site, a
 * protocol-relative URL, a backslash trick) falls back to the default.
 */
export function safeNextPath(next: string | null | undefined, fallback: string): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
