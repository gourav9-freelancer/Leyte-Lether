import { loginSchema } from "@/lib/validation";
import { currentSessionToken, destroySessionByToken } from "@/server/auth";
import { one } from "@/server/db";
import { handler, jsonError, jsonOk, limit, readJson } from "@/server/http";
import { dummyPasswordHash, logSecurityEvent, rateLimit, sha256, verifyPassword } from "@/server/security";
import { attachNewSession } from "@/server/session-response";

export const dynamic = "force-dynamic";

const GENERIC = "Please check your details and try again.";

export const POST = handler(async (req: Request) => {
  const limited = limit(req, "login-ip", 20, 900);
  if (limited) return limited;
  const body = await readJson(req, loginSchema);
  if (!body.ok) return body.response;
  const { email, password } = body.data;

  // Per-account throttle as well as per-IP (credential stuffing).
  const perAccount = rateLimit(`login-acct:${sha256(email)}`, 8, 900);
  if (!perAccount.ok) {
    logSecurityEvent("rate_limited", req.headers);
    return jsonError(429, "rate_limited", "Too many sign-in attempts. Please wait 15 minutes and try again.", undefined, { "Retry-After": String(perAccount.retryAfter) });
  }

  const row = one<{ id: number; password_hash: string }>("SELECT id, password_hash FROM customers WHERE email = ?", email);
  // Always run a hash comparison to keep timing consistent for unknown emails.
  const ok = row ? await verifyPassword(password, row.password_hash) : (await verifyPassword(password, await dummyPasswordHash()), false);
  if (!row || !ok) {
    logSecurityEvent("login_failure", req.headers, row?.id);
    return jsonError(401, "invalid_credentials", GENERIC);
  }
  const old = await currentSessionToken();
  if (old) destroySessionByToken(old);
  logSecurityEvent("login_success", req.headers, row.id);
  return attachNewSession(jsonOk({ ok: true }), row.id, req.headers.get("user-agent"));
});
