import "server-only";
import { cookies } from "next/headers";
import { many, nowIso, one, run, transaction } from "./db";
import { randomToken, sha256 } from "./security";

const SESSION_DAYS = 14;
const isProd = process.env.NODE_ENV === "production";

/** `__Host-` prefix requires Secure + Path=/ + no Domain — enforced in production. */
export const SESSION_COOKIE = isProd ? "__Host-ll_session" : "ll_session";

export interface Customer {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
}

export function sessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

export function createSession(customerId: number, userAgent: string | null): { token: string; expires: Date } {
  const token = randomToken(32);
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86400_000);
  run(
    "INSERT INTO sessions (id_hash, customer_id, created_at, last_seen_at, expires_at, user_agent) VALUES (?, ?, ?, ?, ?, ?)",
    sha256(token),
    customerId,
    now.toISOString(),
    now.toISOString(),
    expires.toISOString(),
    (userAgent ?? "").slice(0, 200),
  );
  return { token, expires };
}

export function destroySessionByToken(token: string) {
  run("DELETE FROM sessions WHERE id_hash = ?", sha256(token));
}

/** Revokes every session for a customer except (optionally) the current one. */
export function revokeSessions(customerId: number, exceptToken?: string) {
  if (exceptToken) {
    run("DELETE FROM sessions WHERE customer_id = ? AND id_hash != ?", customerId, sha256(exceptToken));
  } else {
    run("DELETE FROM sessions WHERE customer_id = ?", customerId);
  }
}

export function customerForToken(token: string | undefined): Customer | null {
  if (!token || token.length > 100) return null;
  const row = one<Customer & { expires_at: string; last_seen_at: string }>(
    `SELECT c.id, c.email, c.first_name, c.last_name, c.phone, c.created_at, s.expires_at, s.last_seen_at
       FROM sessions s JOIN customers c ON c.id = s.customer_id
      WHERE s.id_hash = ?`,
    sha256(token),
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    destroySessionByToken(token);
    return null;
  }
  // Record activity at most every 5 minutes so the sessions list is meaningful.
  if (Date.now() - new Date(row.last_seen_at).getTime() > 5 * 60_000) {
    run("UPDATE sessions SET last_seen_at = ? WHERE id_hash = ?", nowIso(), sha256(token));
  }
  return {
    id: row.id,
    email: row.email,
    first_name: row.first_name,
    last_name: row.last_name,
    phone: row.phone,
    created_at: row.created_at,
  };
}

/** Current customer for Server Components / Route Handlers (server-side check). */
export async function currentCustomer(): Promise<Customer | null> {
  const store = await cookies();
  return customerForToken(store.get(SESSION_COOKIE)?.value);
}

export async function currentSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export function sessionCount(customerId: number): number {
  return one<{ n: number }>("SELECT COUNT(*) AS n FROM sessions WHERE customer_id = ? AND expires_at > ?", customerId, nowIso())?.n ?? 0;
}

export function purgeExpired() {
  transaction((d) => {
    d.prepare("DELETE FROM sessions WHERE expires_at < ?").run(nowIso());
    d.prepare("DELETE FROM password_resets WHERE expires_at < ? OR used_at IS NOT NULL").run(nowIso());
  });
}

export function listSessions(customerId: number) {
  return many<{ created_at: string; last_seen_at: string; user_agent: string }>(
    "SELECT created_at, last_seen_at, user_agent FROM sessions WHERE customer_id = ? AND expires_at > ? ORDER BY created_at DESC",
    customerId,
    nowIso(),
  );
}
