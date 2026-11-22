import { registerSchema } from "@/lib/validation";
import { one, run, nowIso } from "@/server/db";
import { handler, jsonError, jsonOk, limit, readJson } from "@/server/http";
import { hashPassword, logSecurityEvent } from "@/server/security";
import { attachNewSession } from "@/server/session-response";

export const dynamic = "force-dynamic";

export const POST = handler(async (req: Request) => {
  const limited = limit(req, "register", 5, 3600);
  if (limited) return limited;
  const body = await readJson(req, registerSchema);
  if (!body.ok) return body.response;
  const { email, password, firstName, lastName } = body.data;

  if (one("SELECT 1 FROM customers WHERE email = ?", email)) {
    return jsonError(409, "email_taken", "An account already exists for this email. Sign in or reset your password.", {
      email: "An account already exists for this email.",
    });
  }
  const hash = await hashPassword(password);
  const now = nowIso();
  const res = run(
    "INSERT INTO customers (email, password_hash, first_name, last_name, password_changed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    email,
    hash,
    firstName,
    lastName,
    now,
    now,
    now,
  );
  const id = Number(res.lastInsertRowid);
  logSecurityEvent("register", req.headers, id);
  return attachNewSession(jsonOk({ ok: true }, { status: 201 }), id, req.headers.get("user-agent"));
});
