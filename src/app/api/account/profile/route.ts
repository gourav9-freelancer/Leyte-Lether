import { profileSchema } from "@/lib/validation";
import { currentCustomer } from "@/server/auth";
import { run, nowIso } from "@/server/db";
import { handler, jsonError, jsonOk, limit, readJson } from "@/server/http";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const c = await currentCustomer();
  if (!c) return jsonError(401, "unauthenticated", "Your session has expired. Please sign in again.");
  return jsonOk({ email: c.email, firstName: c.first_name ?? "", lastName: c.last_name ?? "", phone: c.phone ?? "" });
});

/** Only whitelisted profile fields can change (strict schema → no mass assignment). */
export const PATCH = handler(async (req: Request) => {
  const limited = limit(req, "profile", 30, 300);
  if (limited) return limited;
  const body = await readJson(req, profileSchema);
  if (!body.ok) return body.response;
  const c = await currentCustomer();
  if (!c) return jsonError(401, "unauthenticated", "Your session has expired. Please sign in again.");
  run(
    "UPDATE customers SET first_name = ?, last_name = ?, phone = ?, updated_at = ? WHERE id = ?",
    body.data.firstName,
    body.data.lastName,
    body.data.phone || null,
    nowIso(),
    c.id,
  );
  return jsonOk({ firstName: body.data.firstName, lastName: body.data.lastName, phone: body.data.phone ?? "" });
});
