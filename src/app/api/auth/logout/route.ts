import { customerForToken, currentSessionToken, destroySessionByToken } from "@/server/auth";
import { guardOrigin, handler, jsonOk } from "@/server/http";
import { logSecurityEvent } from "@/server/security";
import { clearSessionCookie } from "@/server/session-response";

export const dynamic = "force-dynamic";

export const POST = handler(async (req: Request) => {
  const bad = guardOrigin(req);
  if (bad) return bad;
  const token = await currentSessionToken();
  if (token) {
    logSecurityEvent("logout", req.headers, customerForToken(token)?.id);
    destroySessionByToken(token);
  }
  return clearSessionCookie(jsonOk({ ok: true }));
});
