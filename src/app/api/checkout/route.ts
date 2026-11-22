import { checkoutSchema } from "@/lib/validation";
import { currentCustomer } from "@/server/auth";
import { currentCartId } from "@/server/cart";
import { handler, jsonError, jsonOk, limit, readJson } from "@/server/http";
import { createPendingOrder, orderRowById } from "@/server/orders";
import { appOrigin, paymentMode, resumePayment, startPayment } from "@/server/payments";

export const dynamic = "force-dynamic";

/**
 * Creates (or re-uses, via idempotency key) a pending order from the server-side
 * cart and returns the payment redirect. Totals never come from the client.
 */
export const POST = handler(async (req: Request) => {
  const limited = limit(req, "checkout", 10, 300);
  if (limited) return limited;
  const body = await readJson(req, checkoutSchema);
  if (!body.ok) return body.response;

  const mode = paymentMode();
  if (mode === "unconfigured") {
    return jsonError(503, "payments_unavailable", "Online payment isn't available yet. Your cart has been saved — please try again later.");
  }

  const customer = await currentCustomer();
  const result = createPendingOrder({
    cartId: await currentCartId(),
    customerId: customer?.id ?? null,
    email: customer?.email ?? body.data.email,
    firstName: body.data.firstName,
    lastName: body.data.lastName,
    phone: body.data.phone,
    idempotencyKey: body.data.idempotencyKey,
    provider: mode,
  });
  if (!result.ok) {
    return result.reason === "empty_cart"
      ? jsonError(409, "empty_cart", "Your cart is empty. Add a piece before checking out.")
      : jsonError(409, "cart_changed", "Your cart changed while you were checking out. Please review it and try again.");
  }

  const order = orderRowById(result.orderId);
  if (!order) return jsonError(500, "server_error", "We couldn't complete that. Please try again.");
  if (result.reused && order.status === "paid") {
    return jsonError(409, "already_paid", `Order ${order.order_number} has already been paid.`);
  }
  try {
    const origin = appOrigin(req.headers);
    const redirectUrl = result.accessToken
      ? await startPayment(result.orderId, result.accessToken, origin)
      : await resumePayment(result.orderId, origin);
    return jsonOk({ orderNumber: result.orderNumber, redirectUrl });
  } catch (err) {
    console.error("[checkout] payment start failed", err instanceof Error ? err.message : "unknown");
    return jsonError(502, "payment_start_failed", "We couldn't start the payment. You have not been charged. Please try again.");
  }
});
