import { resetPasswordSchema } from "@/lib/validation";
import { revokeSessions } from "@/server/auth";
import { nowIso, one, transaction } from "@/server/db";
import { handler, jsonError, jsonOk, limit, readJson } from "@/server/http";
import { hashPassword, logSecurityEvent, sha256 } from "@/server/security";

export const dynamic = "force-dynamic";

/** Single-use, expiring, hashed token. All sessions are revoked after a reset. */
export const POST = handler(async (req: Request) => {
  const limited = limit(req, "reset", 10, 900);
  if (limited) return limited;
  const body = await readJson(req, resetPasswordSchema);
  if (!body.ok) return body.response;
  // Check the token before the (deliberately expensive) hash so bad tokens cost nothing.
  const tokenHash = sha256(body.data.token);
  const valid = one<{ expires_at: string; used_at: string | null }>("SELECT expires_at, used_at FROM password_resets WHERE token_hash = ?", tokenHash);
  if (!valid || valid.used_at || new Date(valid.expires_at).getTime() < Date.now()) {
    return jsonError(400, "invalid_token", "This reset link is invalid or has expired. Request a new one.");
  }
  const hash = await hashPassword(body.data.password);
  const customerId = transaction((d) => {
    const row = d
      .prepare("SELECT customer_id, expires_at, used_at FROM password_resets WHERE token_hash = ?")
      .get(tokenHash) as { customer_id: number; expires_at: string; used_at: string | null } | undefined;
    if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now()) return null;
    const now = nowIso();
    d.prepare("UPDATE password_resets SET used_at = ? WHERE customer_id = ? AND used_at IS NULL").run(now, row.customer_id);
    d.prepare("UPDATE customers SET password_hash = ?, password_changed_at = ?, updated_at = ? WHERE id = ?").run(hash, now, now, row.customer_id);
    return row.customer_id;
  });
  if (!customerId) {
    return jsonError(400, "invalid_token", "This reset link is invalid or has expired. Request a new one.");
  }
  revokeSessions(customerId);
  logSecurityEvent("password_reset_completed", req.headers, customerId);
  return jsonOk({ ok: true });
});
