import { customOrderSchema, CUSTOM_ORDER_MAX_FILE_BYTES, CUSTOM_ORDER_MAX_FILES, fieldErrors, todayInWorkshop } from "@/lib/validation";
import { currentCustomer } from "@/server/auth";
import { nowIso, transaction } from "@/server/db";
import { guardOrigin, handler, jsonError, jsonOk, limit } from "@/server/http";
import { sendMail } from "@/server/mail";
import { sendCustomOrderAcknowledgement } from "@/server/notifications";
import crypto from "node:crypto";
import { logSecurityEvent } from "@/server/security";
import { removeStored, storeUploads, validateUploads } from "@/server/uploads";

export const dynamic = "force-dynamic";

const MAX_BODY = CUSTOM_ORDER_MAX_FILES * CUSTOM_ORDER_MAX_FILE_BYTES + 512 * 1024;

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I confusion

function newReference(): string {
  const bytes = crypto.randomBytes(8);
  return `CR-${Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("")}`;
}

/** Reads the request body, giving up (null) as soon as it exceeds `max` bytes. */
async function readCapped(req: Request, max: number): Promise<Uint8Array<ArrayBuffer> | null> {
  if (!req.body) return new Uint8Array(new ArrayBuffer(0));
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(new ArrayBuffer(total));
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

export const POST = handler(async (req: Request) => {
  const bad = guardOrigin(req);
  if (bad) return bad;
  const limited = limit(req, "custom-order", 5, 3600);
  if (limited) return limited;

  const type = req.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("multipart/form-data")) return jsonError(415, "unsupported_media_type", "Unsupported request format.");
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY) return jsonError(413, "payload_too_large", "Your images are too large. Each image must be 8 MB or smaller.");

  let form: FormData;
  try {
    // Content-Length can be absent (chunked) or wrong, so count the bytes actually read.
    const body = await readCapped(req, MAX_BODY);
    if (!body) return jsonError(413, "payload_too_large", "Your images are too large. Each image must be 8 MB or smaller.");
    form = await new Response(body, { headers: { "content-type": type } }).formData();
  } catch {
    return jsonError(400, "invalid_form", "The request could not be read. Please try again.");
  }

  const fields: Record<string, string> = {};
  for (const key of ["name", "email", "itemType", "measurements", "notes", "budget", "deadline"]) {
    const v = form.get(key);
    if (typeof v === "string") fields[key] = v;
  }
  const parsed = customOrderSchema.safeParse(fields);
  if (!parsed.success) return jsonError(422, "validation_failed", "Please check the highlighted fields.", fieldErrors(parsed.error));
  // Plain string comparison is exact for YYYY-MM-DD; "today" is allowed.
  if (parsed.data.deadline && parsed.data.deadline < todayInWorkshop()) {
    return jsonError(422, "validation_failed", "Please check the highlighted fields.", { deadline: "Choose a date in the future, or leave this empty." });
  }

  const files = form.getAll("images").filter((f): f is File => typeof f !== "string");
  const check = await validateUploads(files);
  if (!check.ok) {
    logSecurityEvent("upload_rejected", req.headers);
    return jsonError(422, "invalid_upload", check.message, { images: check.message });
  }

  const stored = storeUploads(check.files);
  const customer = await currentCustomer();
  let reference = "";
  try {
    transaction((d) => {
      const exists = d.prepare("SELECT 1 FROM custom_order_requests WHERE reference = ?");
      do reference = newReference();
      while (exists.get(reference));
      const res = d
        .prepare(
          `INSERT INTO custom_order_requests (reference, customer_id, name, email, item_type, measurements, notes, budget_cents, deadline, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          reference,
          customer?.id ?? null,
          parsed.data.name,
          parsed.data.email,
          parsed.data.itemType,
          parsed.data.measurements,
          parsed.data.notes || null,
          parsed.data.budget ? Math.round(Number(parsed.data.budget) * 100) : null,
          parsed.data.deadline || null,
          nowIso(),
        );
      const id = Number(res.lastInsertRowid);
      const ins = d.prepare("INSERT INTO custom_order_files (request_id, stored_name, mime_type, size_bytes, created_at) VALUES (?, ?, ?, ?, ?)");
      for (const f of stored) ins.run(id, f.storedName, f.type, f.size, nowIso());
    });
  } catch (err) {
    removeStored(stored.map((s) => s.storedName));
    throw err;
  }

  await sendCustomOrderAcknowledgement(parsed.data.email, parsed.data.name, reference, stored.length);
  if (process.env.BUSINESS_NOTIFICATION_EMAIL) {
    await sendMail({
      to: process.env.BUSINESS_NOTIFICATION_EMAIL,
      subject: `New custom-order request ${reference}`,
      text: `A new custom-order request (${reference}) has been received with ${stored.length} reference image(s).\nView it with: npm run admin -- custom-orders ${reference}`,
    });
  }
  return jsonOk({ reference }, { status: 201 });
});
