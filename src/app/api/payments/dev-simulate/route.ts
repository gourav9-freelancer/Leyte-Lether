import { z } from "zod";
import { handler, jsonError, jsonOk, readJson } from "@/server/http";
import { getOrderByAccessToken } from "@/server/orders";
import { paymentMode, simulateDevPayment } from "@/server/payments";

export const dynamic = "force-dynamic";

const schema = z.object({ token: z.string().min(20).max(64), outcome: z.enum(["success", "failure"]) }).strict();

/** Development-only payment simulator. Returns 404 whenever not in development payment mode. */
export const POST = handler(async (req: Request) => {
  if (paymentMode() !== "development") return jsonError(404, "not_found", "Not found.");
  const body = await readJson(req, schema);
  if (!body.ok) return body.response;
  const order = getOrderByAccessToken(body.data.token);
  if (!order) return jsonError(404, "not_found", "Order not found.");
  if (order.status !== "pending_payment") return jsonError(409, "not_pending", "This order is no longer awaiting payment.");
  await simulateDevPayment(order.id, body.data.outcome);
  return jsonOk({ ok: true });
});
