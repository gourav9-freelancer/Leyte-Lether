import { currentCustomer, currentSessionToken, revokeSessions } from "@/server/auth";
import { guardOrigin, handler, jsonError, jsonOk } from "@/server/http";
import { logSecurityEvent } from "@/server/security";

export const dynamic = "force-dynamic";

/** Sign out of all other devices. */
export const DELETE = handler(async (req: Request) => {
  const bad = guardOrigin(req);
  if (bad) return bad;
  const c = await currentCustomer();
  if (!c) return jsonError(401, "unauthenticated", "Your session has expired. Please sign in again.");
  revokeSessions(c.id, await currentSessionToken());
  logSecurityEvent("sessions_revoked", req.headers, c.id);
  return jsonOk({ ok: true });
});
