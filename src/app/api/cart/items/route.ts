import { addToCartSchema } from "@/lib/validation";
import { addItem, buildCartView, CART_COOKIE, CART_ERROR_MESSAGES, cartCookieOptions, ensureCart } from "@/server/cart";
import { handler, jsonError, jsonOk, limit, readJson } from "@/server/http";

export const dynamic = "force-dynamic";

/** Add a product (with an optional verified configuration) to the visitor's cart. */
export const POST = handler(async (req: Request) => {
  const limited = limit(req, "cart", 60, 60);
  if (limited) return limited;
  const body = await readJson(req, addToCartSchema);
  if (!body.ok) return body.response;

  const { id, newToken } = await ensureCart();
  const err = addItem(id, body.data.productId, body.data.quantity, body.data.config);
  if (err) {
    const status = err === "product_unavailable" ? 404 : 409;
    const res = jsonError(status, err, CART_ERROR_MESSAGES[err]);
    if (newToken) res.cookies.set(CART_COOKIE, newToken, cartCookieOptions());
    return res;
  }
  const res = jsonOk(buildCartView(id), { status: 201 });
  if (newToken) res.cookies.set(CART_COOKIE, newToken, cartCookieOptions());
  return res;
});
