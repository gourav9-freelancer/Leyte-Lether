import { changePasswordSchema } from "@/lib/validation";
import { currentCustomer, currentSessionToken, revokeSessions } from "@/server/auth";
import { one, run, nowIso } from "@/server/db";
import { handler, jsonError, jsonOk, limit, readJson } from "@/server/http";
import { hashPassword, logSecurityEvent, verifyPassword } from "@/server/security";

export const dynamic = "force-dynamic";

/** Requires the current password; signs out all other sessions on success. */
export const POST = handler(async (req: Request) => {
  const limited = limit(req, "password-change", 10, 900);
  if (limited) return limited;
  const body = await readJson(req, changePasswordSchema);
  if (!body.ok) return body.response;
  const c = await currentCustomer();
  if (!c) return jsonError(401, "unauthenticated", "Your session has expired. Please sign in again.");
  const row = one<{ password_hash: string }>("SELECT password_hash FROM customers WHERE id = ?", c.id);
  if (!row || !(await verifyPassword(body.data.currentPassword, row.password_hash))) {
    return jsonError(422, "validation_failed", "Please check the highlighted fields.", { currentPassword: "Your current password is incorrect." });
  }
  const now = nowIso();
  run("UPDATE customers SET password_hash = ?, password_changed_at = ?, updated_at = ? WHERE id = ?", await hashPassword(body.data.newPassword), now, now, c.id);
  revokeSessions(c.id, await currentSessionToken());
  logSecurityEvent("password_changed", req.headers, c.id);
  return jsonOk({ ok: true });
});
