const BASE = "https://same-site.invalid";

/** Only allow same-site relative paths (prevents open redirects via ?next=). */
export function safeNext(next: string | null | undefined, fallback = "/account"): string {
  if (!next || typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.length > 200) return fallback;
  // Browsers strip tabs/newlines and treat "\" as "/" while parsing, so "/\t/evil.com"
  // or "/\evil.com" would become protocol-relative. Reject all control chars and backslashes.
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return fallback;
  if (next.startsWith("//")) return fallback;
  try {
    const url = new URL(next, BASE);
    if (url.origin !== BASE) return fallback;
  } catch {
    return fallback;
  }
  return next;
}
