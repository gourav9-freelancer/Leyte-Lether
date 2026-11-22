import { after } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation";
import { one, run, nowIso } from "@/server/db";
import { handler, jsonOk, limit, readJson } from "@/server/http";
import { sendMail } from "@/server/mail";
import { appOrigin } from "@/server/payments";
import { logSecurityEvent, randomToken, rateLimit, sha256 } from "@/server/security";

export const dynamic = "force-dynamic";

const RESET_MINUTES = 30;

/** Always returns the same response so account existence is never revealed. */
export const POST = handler(async (req: Request) => {
  const limited = limit(req, "forgot", 5, 900);
  if (limited) return limited;
  const body = await readJson(req, forgotPasswordSchema);
  if (!body.ok) return body.response;
  const email = body.data.email;

  const customer = one<{ id: number }>("SELECT id FROM customers WHERE email = ?", email);
  if (customer && rateLimit(`forgot-acct:${customer.id}`, 3, 3600).ok) {
    const token = randomToken(32);
    const expires = new Date(Date.now() + RESET_MINUTES * 60_000).toISOString();
    run("INSERT INTO password_resets (token_hash, customer_id, created_at, expires_at) VALUES (?, ?, ?, ?)", sha256(token), customer.id, nowIso(), expires);
    const link = `${appOrigin(req.headers)}/reset-password?token=${encodeURIComponent(token)}`;
    // Sent after the response so timing never reveals whether the account exists.
    after(() => sendMail({
      to: email,
      subject: "Reset your Leyte Leather password",
      text: `We received a request to reset your password.\n\nUse this link within ${RESET_MINUTES} minutes:\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
    }));
    logSecurityEvent("password_reset_requested", req.headers, customer.id);
  }
  return jsonOk({ ok: true });
});
