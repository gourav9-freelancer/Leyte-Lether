import "server-only";
import { catalogEntry } from "@/data/catalog";
import type { OrderDetail, OrderStatus, OrderSummary } from "@/lib/types";
import { productConfigSchema } from "@/lib/validation";
import { many, nowIso, one, transaction } from "./db";
import { buildCartView, configKey } from "./cart";
import { randomToken, sha256 } from "./security";

interface OrderRow {
  id: number;
  order_number: string;
  customer_id: number | null;
  email: string;
  first_name: string;
  last_name: string;
  status: OrderStatus;
  subtotal_cents: number;
  shipping_cents: number | null;
  tax_cents: number | null;
  total_cents: number | null;
  payment_provider: string;
  payment_ref: string | null;
  idempotency_key: string;
  created_at: string;
  paid_at: string | null;
  cart_id: string | null;
}

interface ItemRow {
  product_id: string;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  config_json: string;
  line_total_cents: number;
}

export type CreateOrderResult =
  | { ok: true; orderId: number; orderNumber: string; accessToken: string | null; reused: boolean }
  | { ok: false; reason: "empty_cart" | "cart_changed" };

/**
 * Creates a pending order from the server-side cart. Prices and totals are
 * computed exclusively from the database. Re-submitting with the same
 * idempotency key returns the original order instead of creating a duplicate.
 */
export function createPendingOrder(input: {
  cartId: string | null;
  customerId: number | null;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  idempotencyKey: string;
  provider: string;
}): CreateOrderResult {
  return transaction((d) => {
    const existing = d
      .prepare("SELECT id, order_number FROM orders WHERE idempotency_key = ?")
      .get(input.idempotencyKey) as { id: number; order_number: string } | undefined;
    if (existing) {
      return { ok: true, orderId: existing.id, orderNumber: existing.order_number, accessToken: null, reused: true };
    }

    const cart = buildCartView(input.cartId);
    // Unavailable items first: "review your cart" explains more than "your cart is empty".
    if (cart.issues.length > 0) return { ok: false, reason: "cart_changed" };
    if (cart.lines.length === 0) return { ok: false, reason: "empty_cart" };

    const next = (d.prepare("SELECT COALESCE(MAX(id), 0) + 1001 AS n FROM orders").get() as { n: number }).n;
    const orderNumber = `LL-${next}`;
    const accessToken = randomToken(24);
    const now = nowIso();

    const res = d
      .prepare(
        `INSERT INTO orders (order_number, access_token_hash, customer_id, email, first_name, last_name, phone,
           status, currency, subtotal_cents, payment_provider, idempotency_key, created_at, updated_at, cart_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_payment', 'CAD', ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        orderNumber,
        sha256(accessToken),
        input.customerId,
        input.email,
        input.firstName,
        input.lastName,
        input.phone || null,
        cart.subtotalCents,
        input.provider,
        input.idempotencyKey,
        now,
        now,
        input.cartId,
      );
    const orderId = Number(res.lastInsertRowid);
    const insertItem = d.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, unit_price_cents, quantity, config_json, line_total_cents)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const line of cart.lines) {
      insertItem.run(
        orderId,
        line.productId,
        line.name,
        line.unitPriceCents,
        line.quantity,
        JSON.stringify(line.config),
        line.lineTotalCents,
      );
    }
    return { ok: true, orderId, orderNumber, accessToken, reused: false };
  });
}

/** Rotates the access token (used when an existing pending order is re-submitted). */
export function rotateAccessToken(orderId: number): string {
  const token = randomToken(24);
  transaction((d) => {
    d.prepare("UPDATE orders SET access_token_hash = ?, updated_at = ? WHERE id = ?").run(sha256(token), nowIso(), orderId);
  });
  return token;
}

export function orderRowById(id: number): OrderRow | undefined {
  return one<OrderRow>("SELECT * FROM orders WHERE id = ?", id);
}

export function orderItems(orderId: number): ItemRow[] {
  return many<ItemRow>(
    "SELECT product_id, product_name, unit_price_cents, quantity, config_json, line_total_cents FROM order_items WHERE order_id = ? ORDER BY id",
    orderId,
  );
}

export function setPaymentRef(orderId: number, ref: string) {
  transaction((d) => {
    d.prepare("UPDATE orders SET payment_ref = ?, updated_at = ? WHERE id = ?").run(ref, nowIso(), orderId);
  });
}

/**
 * Marks an order paid exactly once (idempotent). Only call after the payment
 * provider has been verified server-side. Clears the originating cart.
 */
export function markOrderPaid(
  orderId: number,
  amounts: { totalCents: number; shippingCents: number | null; taxCents: number | null },
  paymentRef: string | null,
): boolean {
  return transaction((d) => {
    const res = d
      .prepare(
        `UPDATE orders SET status = 'paid', total_cents = ?, shipping_cents = ?, tax_cents = ?,
           payment_ref = COALESCE(?, payment_ref), paid_at = ?, updated_at = ?
         WHERE id = ? AND status IN ('pending_payment', 'payment_failed')`,
      )
      .run(amounts.totalCents, amounts.shippingCents, amounts.taxCents, paymentRef, nowIso(), nowIso(), orderId);
    if (res.changes > 0) {
      const row = d.prepare("SELECT cart_id FROM orders WHERE id = ?").get(orderId) as { cart_id: string | null };
      if (row.cart_id) {
        // Remove only what was bought: anything added to the cart after checkout
        // started (e.g. while the payment page was open) is kept.
        const bought = d
          .prepare("SELECT product_id, config_json, quantity FROM order_items WHERE order_id = ?")
          .all(orderId) as { product_id: string; config_json: string; quantity: number }[];
        const reduce = d.prepare("UPDATE cart_items SET quantity = quantity - ? WHERE cart_id = ? AND product_id = ? AND config_key = ? AND quantity > ?");
        const remove = d.prepare("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ? AND config_key = ? AND quantity <= ?");
        for (const b of bought) {
          const parsed = productConfigSchema.safeParse(JSON.parse(b.config_json));
          const key = configKey(parsed.success ? parsed.data : {});
          // Delete first: reducing first could leave a row the delete would then match.
          remove.run(row.cart_id, b.product_id, key, b.quantity);
          reduce.run(b.quantity, row.cart_id, b.product_id, key, b.quantity);
        }
      }
    }
    return res.changes > 0;
  });
}

export function markOrderFailed(orderId: number): boolean {
  return transaction((d) => {
    const res = d
      .prepare("UPDATE orders SET status = 'payment_failed', updated_at = ? WHERE id = ? AND status = 'pending_payment'")
      .run(nowIso(), orderId);
    return res.changes > 0;
  });
}

function toDetail(row: OrderRow): OrderDetail {
  const items = orderItems(row.id).map((i) => {
    const parsed = productConfigSchema.safeParse(JSON.parse(i.config_json));
    return {
      productId: i.product_id,
      name: i.product_name,
      unitPriceCents: i.unit_price_cents,
      quantity: i.quantity,
      lineTotalCents: i.line_total_cents,
      config: parsed.success ? parsed.data : {},
      image: catalogEntry(i.product_id)?.cardImage ?? null,
    };
  });
  return {
    orderNumber: row.order_number,
    status: row.status,
    createdAt: row.created_at,
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
    subtotalCents: row.subtotal_cents,
    totalCents: row.total_cents,
    firstItemName: items[0]?.name ?? "",
    firstItemImage: items[0]?.image ?? null,
    firstItemQuantity: items[0]?.quantity ?? 0,
    firstItemPersonalised: Boolean(items[0]?.config.personalisation),
    lineCount: items.length,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    shippingCents: row.shipping_cents,
    taxCents: row.tax_cents,
    paymentProvider: row.payment_provider,
    paidAt: row.paid_at,
    items,
  };
}

/** Ownership-enforced lookup: a customer can only ever load their own orders. */
export function getOrderForCustomer(customerId: number, orderNumber: string): OrderDetail | null {
  const row = one<OrderRow>("SELECT * FROM orders WHERE order_number = ? AND customer_id = ?", orderNumber, customerId);
  return row ? toDetail(row) : null;
}

/** Guest/confirmation lookup via an unguessable, hashed access token. */
export function getOrderByAccessToken(token: string): (OrderDetail & { id: number; paymentRef: string | null }) | null {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  const row = one<OrderRow>("SELECT * FROM orders WHERE access_token_hash = ?", sha256(token));
  return row ? { ...toDetail(row), id: row.id, paymentRef: row.payment_ref } : null;
}

export function listOrdersForCustomer(customerId: number, query = ""): OrderSummary[] {
  const rows = many<OrderRow>(
    "SELECT * FROM orders WHERE customer_id = ? AND status != 'cancelled' ORDER BY created_at DESC LIMIT 100",
    customerId,
  );
  const q = query.trim().toLowerCase();
  return rows
    .map(toDetail)
    .filter((o) => !q || o.orderNumber.toLowerCase().includes(q) || o.items.some((i) => i.name.toLowerCase().includes(q)))
    .map((o) => ({
      orderNumber: o.orderNumber,
      status: o.status,
      createdAt: o.createdAt,
      itemCount: o.itemCount,
      subtotalCents: o.subtotalCents,
      totalCents: o.totalCents,
      firstItemName: o.firstItemName,
      firstItemImage: o.firstItemImage,
      firstItemQuantity: o.firstItemQuantity,
      firstItemPersonalised: o.firstItemPersonalised,
      lineCount: o.lineCount,
      paidAt: o.paidAt,
    }));
}
