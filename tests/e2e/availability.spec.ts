import path from "node:path";
import { expect, test } from "@playwright/test";
import { addToCart } from "./helpers";

type Db = { prepare(sql: string): { run(...a: unknown[]): unknown } };
const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as { DatabaseSync: new (f: string) => Db & { close(): void } };
const SLUG = "handmade-leather-watch-strap";

function setActive(active: boolean) {
  const db = new DatabaseSync(path.join(process.cwd(), "storage", "e2e.db"));
  db.prepare("UPDATE products SET active = ? WHERE id = ?").run(active ? 1 : 0, SLUG);
  db.close();
}

test("hidden products show the Product Unavailable state and leave carts @mobile", async ({ page }) => {
  await addToCart(page, SLUG);
  setActive(false);
  try {
    await page.goto(`/product/${SLUG}`);
    await expect(page.getByRole("heading", { name: "This piece isn't available right now." })).toBeVisible();
    await expect(page.getByText("Product unavailable")).toBeVisible();

    await page.goto("/shop");
    await expect(page.getByRole("link", { name: "Handmade Leather Watch Strap" })).toHaveCount(0);

    // Checkout explains the problem instead of claiming the cart is empty.
    await page.goto("/checkout");
    await expect(page.getByText("Your cart needs a review.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue to payment" })).toHaveCount(0);

    await page.goto("/cart");
    await expect(page.getByText("Your cart was updated.")).toBeVisible();
    await expect(page.getByText("Handmade Leather Watch Strap is no longer available and was removed from your cart.")).toBeVisible();

    // Unknown products are still a real 404.
    const res = await page.goto("/product/not-a-real-product");
    expect(res?.status()).toBe(404);
  } finally {
    setActive(true);
  }
});
