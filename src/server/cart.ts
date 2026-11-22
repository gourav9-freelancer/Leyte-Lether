import "server-only";
import { cookies } from "next/headers";
import { productConfigSchema, type ProductConfig } from "@/lib/validation";
import type { CartView, CartLine } from "@/lib/types";
import { many, nowIso, one, run, transaction } from "./db";
import { getProduct } from "./products";
import { randomToken, sha256 } from "./security";

const isProd = process.env.NODE_ENV === "production";
export const CART_COOKIE = isProd ? "__Host-ll_cart" : "ll_cart";
const CART_DAYS = 30;
export const MAX_QTY = 10;
export const MAX_LINES = 30;

/** Deterministic key so identical configurations merge and different ones never overwrite. */
export function configKey(config: ProductConfig): string {
  const sorted = Object.keys(config)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = (config as Record<string, unknown>)[k];
      return acc;
    }, {});
  return sha256(JSON.stringify(sorted)).slice(0, 24);
}

export function cartCookieOptions() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: CART_DAYS * 86400,
  };
}

async function readCartToken(): Promise<string | undefined> {
  const store = await cookies();
  const v = store.get(CART_COOKIE)?.value;
  return v && v.length <= 100 ? v : undefined;
}

/** Returns the cart id (hash) for the current visitor, or null if none exists. */
export async function currentCartId(): Promise<string | null> {
  const token = await readCartToken();
  if (!token) return null;
  const id = sha256(token);
  return one<{ id_hash: string }>("SELECT id_hash FROM carts WHERE id_hash = ?", id) ? id : null;
}

/** Ensures a cart exists; returns its id and a token to set if new. */
export async function ensureCart(): Promise<{ id: string; newToken?: string }> {
  const existing = await currentCartId();
  if (existing) return { id: existing };
  const token = randomToken(24);
  const id = sha256(token);
  const now = nowIso();
  run("INSERT INTO carts (id_hash, created_at, updated_at) VALUES (?, ?, ?)", id, now, now);
  return { id, newToken: token };
}

interface ItemRow {
  id: number;
  product_id: string;
  config_json: string;
  quantity: number;
}

/**
 * Builds the cart with prices recalculated from the database every time.
 * Unavailable products are excluded from lines/totals and reported in `issues`.
 * Reads never delete; pass `prune: true` only where the notice is shown to the
 * customer (the cart page), so the removal is never silent.
 */
export function buildCartView(cartId: string | null, opts: { prune?: boolean } = {}): CartView {
  if (!cartId) return { lines: [], itemCount: 0, subtotalCents: 0, currency: "CAD", issues: [] };
  const rows = many<ItemRow>(
    "SELECT id, product_id, config_json, quantity FROM cart_items WHERE cart_id = ? ORDER BY id ASC",
    cartId,
  );
  const lines: CartLine[] = [];
  const issues: string[] = [];
  for (const r of rows) {
    const product = getProduct(r.product_id);
    if (!product || !product.active) {
      issues.push(
        opts.prune
          ? `${product?.name ?? "An item"} is no longer available and was removed from your cart.`
          : `${product?.name ?? "An item"} in your cart is no longer available.`,
      );
      if (opts.prune) run("DELETE FROM cart_items WHERE id = ?", r.id);
      continue;
    }
    let config: ProductConfig = {};
    const parsed = productConfigSchema.safeParse(JSON.parse(r.config_json));
    if (parsed.success) config = parsed.data;
    lines.push({
      id: r.id,
      productId: product.slug,
      name: product.name,
      image: product.gallery[0] ?? product.cardImage, // Figma cart uses the primary product photo
      unitPriceCents: product.priceCents,
      quantity: r.quantity,
      lineTotalCents: product.priceCents * r.quantity,
      config,
      personalisable: product.personalisable,
    });
  }
  return {
    lines,
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    subtotalCents: lines.reduce((n, l) => n + l.lineTotalCents, 0),
    currency: "CAD",
    issues,
  };
}

export async function getCart(opts: { prune?: boolean } = {}): Promise<CartView> {
  return buildCartView(await currentCartId(), opts);
}

export type CartMutationError = "product_unavailable" | "config_not_supported" | "too_many" | "not_found" | "cart_full";

export function addItem(cartId: string, productId: string, quantity: number, config: ProductConfig): CartMutationError | null {
  const product = getProduct(productId);
  if (!product || !product.active) return "product_unavailable";
  if (config.personalisation && !product.personalisable) return "config_not_supported";
  const key = configKey(config);
  return transaction((d) => {
    const existing = d
      .prepare("SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND config_key = ?")
      .get(cartId, productId, key) as { id: number; quantity: number } | undefined;
    if (existing) {
      if (existing.quantity + quantity > MAX_QTY) return "too_many";
      d.prepare("UPDATE cart_items SET quantity = quantity + ? WHERE id = ?").run(quantity, existing.id);
    } else {
      const count = (d.prepare("SELECT COUNT(*) AS n FROM cart_items WHERE cart_id = ?").get(cartId) as { n: number }).n;
      if (count >= MAX_LINES) return "cart_full";
      d.prepare(
        "INSERT INTO cart_items (cart_id, product_id, config_key, config_json, quantity, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      ).run(cartId, productId, key, JSON.stringify(config), quantity, nowIso());
    }
    d.prepare("UPDATE carts SET updated_at = ? WHERE id_hash = ?").run(nowIso(), cartId);
    return null;
  });
}

/** Updates quantity only if the line belongs to this cart (prevents IDOR). */
export function setQuantity(cartId: string, itemId: number, quantity: number): CartMutationError | null {
  const res = run("UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?", quantity, itemId, cartId);
  return res.changes === 0 ? "not_found" : null;
}

export function removeItem(cartId: string, itemId: number): CartMutationError | null {
  const res = run("DELETE FROM cart_items WHERE id = ? AND cart_id = ?", itemId, cartId);
  return res.changes === 0 ? "not_found" : null;
}

export function clearCart(cartId: string) {
  run("DELETE FROM cart_items WHERE cart_id = ?", cartId);
}

export const CART_ERROR_MESSAGES: Record<CartMutationError, string> = {
  product_unavailable: "This product is not available right now.",
  config_not_supported: "Personalisation is not offered for this product.",
  too_many: `You can have up to ${MAX_QTY} of an item in your cart.`,
  not_found: "That item is no longer in your cart. Your cart has been refreshed.",
  cart_full: "Your cart is full. Remove an item before adding another.",
};
