import { nowIso, run, one } from "@/server/db";
import { markOrderFailed, markOrderPaid, orderRowById } from "@/server/orders";
import { sendOrderConfirmation } from "@/server/notifications";
import { constructStripeEvent, paymentMode } from "@/server/payments";
import { logSecurityEvent } from "@/server/security";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook. The signature is verified against the raw body; events are
 * processed at most once (payment_events primary key) and order updates are
 * idempotent. This — not the browser redirect — is the proof of payment.
 */
export async function POST(req: Request) {
  if (paymentMode() !== "stripe") return new Response("Not found", { status: 404 });
  const signature = req.headers.get("stripe-signature");
  const raw = await req.text();
  if (!signature || raw.length > 512 * 1024) return new Response("Bad request", { status: 400 });

  let event;
  try {
    event = constructStripeEvent(raw, signature);
  } catch {
    logSecurityEvent("webhook_signature_invalid", req.headers);
    return new Response("Invalid signature", { status: 400 });
  }

  if (one("SELECT 1 FROM payment_events WHERE provider_event_id = ?", event.id)) {
    return new Response("Already processed", { status: 200 });
  }

  let paidOrderId: number | null = null;
  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded" ||
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired"
    ) {
      const session = event.data.object;
      const orderId = Number(session.metadata?.order_id);
      const order = orderId ? orderRowById(orderId) : undefined;
      if (order && order.payment_ref === session.id) {
        if (session.payment_status === "paid") {
          paidOrderId = markOrderPaid(
            order.id,
            {
              totalCents: session.amount_total ?? order.subtotal_cents,
              shippingCents: session.total_details?.amount_shipping ?? null,
              taxCents: session.total_details?.amount_tax ?? null,
            },
            session.id,
          )
            ? order.id
            : null;
        } else if (event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired") {
          markOrderFailed(order.id);
        }
      }
      run("INSERT OR IGNORE INTO payment_events (provider_event_id, order_id, type, received_at) VALUES (?, ?, ?, ?)", event.id, order?.id ?? null, event.type, nowIso());
    } else {
      run("INSERT OR IGNORE INTO payment_events (provider_event_id, order_id, type, received_at) VALUES (?, NULL, ?, ?)", event.id, event.type, nowIso());
    }
  } catch (err) {
    console.error("[webhook] processing failed", err instanceof Error ? err.message : "unknown");
    return new Response("Processing error", { status: 500 }); // Stripe will retry
  }
  if (paidOrderId) await sendOrderConfirmation(paidOrderId);
  return new Response("ok", { status: 200 });
}
