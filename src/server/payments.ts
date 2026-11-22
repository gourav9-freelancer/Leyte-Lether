import "server-only";
import Stripe from "stripe";
import { sendOrderConfirmation } from "./notifications";
import { markOrderFailed, markOrderPaid, orderItems, orderRowById, rotateAccessToken, setPaymentRef } from "./orders";
import { sha256 } from "./security";

/*
 * Payment provider boundary.
 *
 *  - "stripe":        STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET configured. Hosted Stripe
 *                     Checkout collects card details (never touches this server), and the
 *                     order is only marked paid by a signature-verified webhook or a
 *                     server-side session lookup.
 *  - "development":   PAYMENTS_MODE=development and NODE_ENV !== production. A clearly
 *                     labelled simulator for local testing. Impossible to enable in production.
 *  - "unconfigured":  anything else. Checkout refuses to take orders and explains why.
 */
export type PaymentMode = "stripe" | "development" | "unconfigured";

export function paymentMode(): PaymentMode {
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) return "stripe";
  if (process.env.PAYMENTS_MODE === "development" && process.env.NODE_ENV !== "production") return "development";
  return "unconfigured";
}

let stripeClient: Stripe | null = null;
function stripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured");
  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeClient;
}

export function appOrigin(headers: Headers): string {
  const configured = process.env.APP_ORIGIN?.split(",")[0]?.trim();
  if (configured) return configured;
  // The Host header is attacker-controlled; trusting it in production would let anyone
  // point password-reset and payment links at their own domain.
  if (process.env.NODE_ENV === "production") throw new Error("APP_ORIGIN must be set in production");
  const host = headers.get("host") ?? "localhost:3000";
  return `http://${host}`; // development only (production returned or threw above)
}

/** Starts payment for a pending order and returns where to send the shopper. */
export async function startPayment(orderId: number, accessToken: string, origin: string): Promise<string> {
  const order = orderRowById(orderId);
  if (!order) throw new Error("order not found");
  const mode = paymentMode();

  if (mode === "development") {
    return `/checkout/dev-payment/${accessToken}`;
  }
  if (mode !== "stripe") throw new Error("payments not configured");

  const items = orderItems(orderId);
  const shippingRates = (process.env.STRIPE_SHIPPING_RATE_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const session = await stripe().checkout.sessions.create(
    {
      mode: "payment",
      currency: "cad",
      customer_email: order.email,
      client_reference_id: String(order.id),
      metadata: { order_id: String(order.id), order_number: order.order_number },
      line_items: items.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: "cad",
          unit_amount: i.unit_price_cents, // server price, never client supplied
          product_data: { name: i.product_name },
        },
      })),
      // Shipping regions, rates and tax are business decisions configured in Stripe;
      // nothing is invented here.
      ...(process.env.STRIPE_SHIPPING_COUNTRIES
        ? {
            shipping_address_collection: {
              allowed_countries: process.env.STRIPE_SHIPPING_COUNTRIES.split(",").map((c) => c.trim()) as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
            },
          }
        : {}),
      ...(shippingRates.length ? { shipping_options: shippingRates.map((id) => ({ shipping_rate: id })) } : {}),
      ...(process.env.STRIPE_AUTOMATIC_TAX === "1" ? { automatic_tax: { enabled: true } } : {}),
      success_url: `${origin}/checkout/confirmation/${accessToken}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?payment=cancelled`,
    },
    // Keyed by the access token too: a new token means a new success_url, and Stripe
    // rejects a reused idempotency key whose parameters changed.
    { idempotencyKey: `order-${order.idempotency_key}-${sha256(accessToken).slice(0, 16)}` },
  );
  setPaymentRef(orderId, session.id);
  if (!session.url) throw new Error("stripe session missing url");
  return session.url;
}

/**
 * Resumes payment for an order that was already created (same idempotency key).
 * If its Stripe session is still open, the shopper is sent back to it — its
 * success_url carries the original access token, which stays valid. Otherwise a
 * fresh token and session are issued.
 */
export async function resumePayment(orderId: number, origin: string): Promise<string> {
  const order = orderRowById(orderId);
  if (!order) throw new Error("order not found");
  if (paymentMode() === "stripe" && order.payment_ref) {
    try {
      const existing = await stripe().checkout.sessions.retrieve(order.payment_ref);
      if (existing.status === "open" && existing.url) return existing.url;
    } catch {
      /* fall through and start a new session */
    }
  }
  return startPayment(orderId, rotateAccessToken(orderId), origin);
}

/** Verifies a Stripe Checkout Session server-side and settles the order. */
export async function settleStripeSession(sessionId: string): Promise<void> {
  const session = await stripe().checkout.sessions.retrieve(sessionId);
  const orderId = Number(session.metadata?.order_id);
  if (!orderId) return;
  const order = orderRowById(orderId);
  if (!order || order.payment_ref !== session.id) return;
  if (session.payment_status === "paid") {
    const changed = markOrderPaid(
      orderId,
      {
        totalCents: session.amount_total ?? order.subtotal_cents,
        shippingCents: session.total_details?.amount_shipping ?? null,
        taxCents: session.total_details?.amount_tax ?? null,
      },
      session.id,
    );
    if (changed) await sendOrderConfirmation(orderId);
  }
}

export function constructStripeEvent(rawBody: string, signature: string): Stripe.Event {
  return stripe().webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
}

/** Development simulator — guarded so it can never run in production. */
export async function simulateDevPayment(orderId: number, outcome: "success" | "failure") {
  if (paymentMode() !== "development") throw new Error("simulator disabled");
  const order = orderRowById(orderId);
  if (!order) return;
  if (outcome === "success") {
    const changed = markOrderPaid(orderId, { totalCents: order.subtotal_cents, shippingCents: null, taxCents: null }, `dev_${order.order_number}`);
    if (changed) await sendOrderConfirmation(orderId);
  } else {
    markOrderFailed(orderId);
  }
}
