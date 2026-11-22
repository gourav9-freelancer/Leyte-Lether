// @vitest-environment node
/*
 * Exercises the real Stripe webhook route handler with locally signed events
 * (Stripe.webhooks.generateTestHeaderString) — no network, no real keys.
 */
import Stripe from "stripe";
import { beforeAll, describe, expect, it, vi } from "vitest";

const SECRET = "whsec_test_secret_for_unit_tests";

beforeAll(() => {
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_dummy_not_used_for_network");
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", SECRET);
  vi.stubEnv("PAYMENTS_MODE", "");
  vi.spyOn(console, "info").mockImplementation(() => {});
});

async function setup() {
  const { db } = await import("@/server/db");
  const { addItem } = await import("@/server/cart");
  const { createPendingOrder, setPaymentRef, orderRowById } = await import("@/server/orders");
  const { POST } = await import("@/app/api/payments/stripe/webhook/route");
  const cartId = `cart_${Math.random().toString(36).slice(2)}`;
  const now = new Date().toISOString();
  db().prepare("INSERT INTO carts (id_hash, created_at, updated_at) VALUES (?, ?, ?)").run(cartId, now, now);
  expect(addItem(cartId, "classic-leather-bifold-wallet", 2, {})).toBeNull();
  const created = createPendingOrder({
    cartId,
    customerId: null,
    email: "buyer@example.com",
    firstName: "Test",
    lastName: "Buyer",
    phone: "",
    idempotencyKey: `idem-${Math.random().toString(36).slice(2)}-abcdefgh`,
    provider: "stripe",
  });
  if (!created.ok) throw new Error("order not created");
  const sessionId = `cs_test_${Math.random().toString(36).slice(2)}`;
  setPaymentRef(created.orderId, sessionId);
  const cartLines = () => (db().prepare("SELECT COUNT(*) AS n FROM cart_items WHERE cart_id = ?").get(cartId) as { n: number }).n;
  return { POST, orderId: created.orderId, sessionId, orderRowById, cartLines };
}

function event(id: string, type: string, session: Record<string, unknown>) {
  return JSON.stringify({ id, object: "event", type, data: { object: { object: "checkout.session", ...session } } });
}

function signed(payload: string, secret = SECRET) {
  const header = Stripe.webhooks.generateTestHeaderString({ payload, secret });
  return new Request("http://localhost/api/payments/stripe/webhook", { method: "POST", body: payload, headers: { "stripe-signature": header } });
}

describe("Stripe webhook (signed locally)", () => {
  it("rejects missing and invalid signatures", async () => {
    const { POST, orderId, sessionId, orderRowById } = await setup();
    const payload = event("evt_bad", "checkout.session.completed", { id: sessionId, payment_status: "paid", metadata: { order_id: String(orderId) } });
    expect((await POST(new Request("http://localhost/x", { method: "POST", body: payload }))).status).toBe(400);
    expect((await POST(signed(payload, "whsec_wrong"))).status).toBe(400);
    expect(orderRowById(orderId)?.status).toBe("pending_payment");
  });

  it("marks the order paid once, records Stripe amounts, clears the cart, and ignores replays", async () => {
    const { POST, orderId, sessionId, orderRowById, cartLines } = await setup();
    expect(cartLines()).toBe(1);
    const payload = event(`evt_${sessionId}`, "checkout.session.completed", {
      id: sessionId,
      payment_status: "paid",
      amount_total: 13560,
      total_details: { amount_shipping: 1000, amount_tax: 560 },
      metadata: { order_id: String(orderId) },
    });
    const res = await POST(signed(payload));
    expect(res.status).toBe(200);
    const row = orderRowById(orderId)!;
    expect(row.status).toBe("paid");
    expect(row.total_cents).toBe(13560);
    expect(row.shipping_cents).toBe(1000);
    expect(row.tax_cents).toBe(560);
    expect(row.subtotal_cents).toBe(12000); // server price, untouched by Stripe payload
    expect(cartLines()).toBe(0);

    const replay = await POST(signed(payload));
    expect(await replay.text()).toBe("Already processed");
  });

  it("does not settle an order whose stored Stripe session differs (forged metadata)", async () => {
    const { POST, orderId, orderRowById } = await setup();
    const payload = event("evt_forged", "checkout.session.completed", {
      id: "cs_test_someone_elses_session",
      payment_status: "paid",
      amount_total: 1,
      metadata: { order_id: String(orderId) },
    });
    expect((await POST(signed(payload))).status).toBe(200);
    expect(orderRowById(orderId)?.status).toBe("pending_payment");
  });

  it("marks async payment failures as failed and keeps the cart", async () => {
    const { POST, orderId, sessionId, orderRowById, cartLines } = await setup();
    const payload = event("evt_fail_" + sessionId, "checkout.session.async_payment_failed", {
      id: sessionId,
      payment_status: "unpaid",
      metadata: { order_id: String(orderId) },
    });
    expect((await POST(signed(payload))).status).toBe(200);
    expect(orderRowById(orderId)?.status).toBe("payment_failed");
    expect(cartLines()).toBe(1);
  });
});

describe("order creation", () => {
  async function cartWith(slug: string | null) {
    const { db } = await import("@/server/db");
    const { addItem } = await import("@/server/cart");
    const cartId = `cart_${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();
    db().prepare("INSERT INTO carts (id_hash, created_at, updated_at) VALUES (?, ?, ?)").run(cartId, now, now);
    if (slug) addItem(cartId, slug, 1, {});
    return cartId;
  }
  const base = { customerId: null, email: "a@b.co", firstName: "A", lastName: "B", phone: "", provider: "development" };

  it("returns the same order for a repeated idempotency key", async () => {
    const { createPendingOrder } = await import("@/server/orders");
    const cartId = await cartWith("leather-car-key-fob-cover");
    const key = `idem-${Math.random().toString(36).slice(2)}-repeat`;
    const a = createPendingOrder({ ...base, cartId, idempotencyKey: key });
    const b = createPendingOrder({ ...base, cartId, idempotencyKey: key });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(b.orderNumber).toBe(a.orderNumber);
      expect(b.reused).toBe(true);
    }
  });

  it("refuses empty carts and carts containing unavailable products", async () => {
    const { createPendingOrder } = await import("@/server/orders");
    const { db } = await import("@/server/db");
    expect(createPendingOrder({ ...base, cartId: await cartWith(null), idempotencyKey: `idem-empty-${Date.now()}x` })).toEqual({ ok: false, reason: "empty_cart" });
    const cartId = await cartWith("handcrafted-leather-axe-sheath");
    db().prepare("UPDATE products SET active = 0 WHERE id = ?").run("handcrafted-leather-axe-sheath");
    try {
      expect(createPendingOrder({ ...base, cartId, idempotencyKey: `idem-unavail-${Date.now()}x` })).toEqual({ ok: false, reason: "cart_changed" });
    } finally {
      db().prepare("UPDATE products SET active = 1 WHERE id = ?").run("handcrafted-leather-axe-sheath");
    }
  });
});

describe("markOrderPaid cart cleanup", () => {
  it("removes only the purchased items, keeping anything added after checkout began", async () => {
    const { db } = await import("@/server/db");
    const { addItem } = await import("@/server/cart");
    const { createPendingOrder, markOrderPaid } = await import("@/server/orders");
    const cartId = `cart_${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();
    db().prepare("INSERT INTO carts (id_hash, created_at, updated_at) VALUES (?, ?, ?)").run(cartId, now, now);
    expect(addItem(cartId, "classic-leather-bifold-wallet", 2, {})).toBeNull();
    const created = createPendingOrder({
      cartId,
      customerId: null,
      email: "buyer@example.com",
      firstName: "Test",
      lastName: "Buyer",
      phone: "",
      idempotencyKey: `idem-${Math.random().toString(36).slice(2)}-abcdefgh`,
      provider: "development",
    });
    if (!created.ok) throw new Error("order not created");
    // While paying, the shopper adds one more wallet and a belt.
    expect(addItem(cartId, "classic-leather-bifold-wallet", 1, {})).toBeNull();
    expect(addItem(cartId, "classic-full-grain-leather-belt", 1, {})).toBeNull();

    expect(markOrderPaid(created.orderId, { totalCents: 12000, shippingCents: null, taxCents: null }, "ref")).toBe(true);
    const rows = db().prepare("SELECT product_id, quantity FROM cart_items WHERE cart_id = ? ORDER BY product_id").all(cartId);
    expect(rows).toEqual([
      { product_id: "classic-full-grain-leather-belt", quantity: 1 },
      { product_id: "classic-leather-bifold-wallet", quantity: 1 },
    ]);
  });
});
