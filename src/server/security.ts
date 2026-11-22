import "server-only";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { one, run, nowIso } from "./db";

const scrypt = promisify(crypto.scrypt) as (
  password: crypto.BinaryLike,
  salt: crypto.BinaryLike,
  keylen: number,
  options: crypto.ScryptOptions,
) => Promise<Buffer>;

/* ---------------- Tokens & hashing ---------------- */

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/* ---------------- Passwords (scrypt, OWASP-recommended parameters) ---------------- */

const SCRYPT = { N: 2 ** 15, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 };

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password.normalize("NFKC"), salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
    maxmem: SCRYPT.maxmem,
  });
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltB64, keyB64] = parts;
  const expected = Buffer.from(keyB64, "base64");
  const key = await scrypt(password.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: SCRYPT.maxmem,
  });
  return crypto.timingSafeEqual(key, expected);
}

/** A precomputed hash used to keep login timing constant when the email is unknown. */
let dummyHash: Promise<string> | null = null;
export function dummyPasswordHash() {
  dummyHash ??= hashPassword(randomToken(16));
  return dummyHash;
}

/* ---------------- Request helpers ---------------- */

export function clientIp(headers: Headers): string {
  // Only trust proxy headers when explicitly configured (behind a known proxy/CDN).
  if (process.env.TRUST_PROXY === "1") {
    const fwd = headers.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    const real = headers.get("x-real-ip");
    if (real) return real.trim();
  }
  return "direct";
}

export function ipHash(headers: Headers): string {
  return sha256(`${process.env.IP_HASH_SALT ?? "leyte"}:${clientIp(headers)}`).slice(0, 32);
}

function expectedOrigins(headers: Headers): string[] {
  const configured = (process.env.APP_ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (configured.length) return configured;
  // Development fallback: same host the request was sent to.
  const host = headers.get("host");
  if (!host) return [];
  return [`http://${host}`, `https://${host}`];
}

/**
 * CSRF defence for cookie-authenticated, state-changing requests (OWASP:
 * "Verifying Origin With Standard Headers"). Combined with SameSite=Lax cookies
 * and JSON-only bodies this blocks cross-site form and fetch submissions.
 */
export function isSameOrigin(headers: Headers): boolean {
  const origin = headers.get("origin");
  const allowed = expectedOrigins(headers);
  if (origin) return allowed.includes(origin);
  const referer = headers.get("referer");
  if (referer) {
    try {
      return allowed.includes(new URL(referer).origin);
    } catch {
      return false;
    }
  }
  return false;
}

/* ---------------- Rate limiting (fixed window, persisted) ---------------- */

export function rateLimit(key: string, limit: number, windowSeconds: number): { ok: boolean; retryAfter: number } {
  const now = Math.floor(Date.now() / 1000);
  const row = one<{ window_start: number; count: number }>(
    "SELECT window_start, count FROM rate_limits WHERE key = ?",
    key,
  );
  if (!row || now - row.window_start >= windowSeconds) {
    run(
      "INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = 1",
      key,
      now,
    );
    return { ok: true, retryAfter: 0 };
  }
  if (row.count >= limit) {
    return { ok: false, retryAfter: windowSeconds - (now - row.window_start) };
  }
  run("UPDATE rate_limits SET count = count + 1 WHERE key = ?", key);
  return { ok: true, retryAfter: 0 };
}

/* ---------------- Security event log (never logs secrets or raw PII) ---------------- */

export type SecurityEvent =
  | "login_success"
  | "login_failure"
  | "logout"
  | "register"
  | "password_reset_requested"
  | "password_reset_completed"
  | "password_changed"
  | "sessions_revoked"
  | "rate_limited"
  | "csrf_rejected"
  | "upload_rejected"
  | "webhook_signature_invalid"
  | "order_access_denied";

export function logSecurityEvent(event: SecurityEvent, headers: Headers, customerId?: number | null) {
  try {
    run(
      "INSERT INTO security_events (event, customer_id, ip_hash, created_at) VALUES (?, ?, ?, ?)",
      event,
      customerId ?? null,
      ipHash(headers),
      nowIso(),
    );
  } catch {
    // Logging must never break the request.
  }
}
