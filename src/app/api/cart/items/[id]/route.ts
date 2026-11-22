import { updateCartItemSchema } from "@/lib/validation";
import { buildCartView, CART_ERROR_MESSAGES, currentCartId, removeItem, setQuantity } from "@/server/cart";
import { guardOrigin, handler, jsonError, jsonOk, limit, readJson } from "@/server/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  return /^\d{1,10}$/.test(raw) ? Number(raw) : null;
}

/** Change the quantity of a line in *this visitor's* cart only. */
export const PATCH = handler(async (req: Request, ctx: Ctx) => {
  const limited = limit(req, "cart", 60, 60);
  if (limited) return limited;
  const body = await readJson(req, updateCartItemSchema);
  if (!body.ok) return body.response;
  const itemId = parseId((await ctx.params).id);
  const cartId = await currentCartId();
  if (!itemId || !cartId) return jsonError(404, "not_found", CART_ERROR_MESSAGES.not_found);
  const err = setQuantity(cartId, itemId, body.data.quantity);
  if (err) return jsonError(404, err, CART_ERROR_MESSAGES[err]);
  return jsonOk(buildCartView(cartId));
});

export const DELETE = handler(async (req: Request, ctx: Ctx) => {
  const bad = guardOrigin(req);
  if (bad) return bad;
  const limited = limit(req, "cart", 60, 60);
  if (limited) return limited;
  const itemId = parseId((await ctx.params).id);
  const cartId = await currentCartId();
  if (!itemId || !cartId) return jsonError(404, "not_found", CART_ERROR_MESSAGES.not_found);
  const err = removeItem(cartId, itemId);
  if (err) return jsonError(404, err, CART_ERROR_MESSAGES[err]);
  return jsonOk(buildCartView(cartId));
});
