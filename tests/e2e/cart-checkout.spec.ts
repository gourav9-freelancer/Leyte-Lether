import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { addToCart, headerCount, register, uniqueEmail } from "./helpers";

test.describe("Cart and checkout", () => {
  test("empty cart state", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: "Your cart is waiting for something special." })).toBeVisible();
  });

  test("add, change quantity, separate configurations, remove and undo", async ({ page }) => {
    await addToCart(page, "classic-leather-bifold-wallet");
    await expect.poll(() => headerCount(page)).toBe(1);

    await addToCart(page, "personalized-leather-camera-strap");
    await page.goto("/product/personalized-leather-camera-strap/personalise");
    await page.locator(".add-to-cart").click();
    await expect(page.getByText("Added to your cart.")).toBeVisible();

    await page.goto("/cart");
    const lines = page.getByRole("list", { name: "Items in your cart" }).getByRole("listitem");
    await expect(lines).toHaveCount(3); // standard + personalised camera strap are separate lines
    await expect(page.getByText("Personalised configuration saved")).toBeVisible();
    await expect(page.getByText("CAD $210.00").first()).toBeVisible();

    await page.getByRole("button", { name: "Increase quantity of Classic Leather Bifold Wallet" }).click();
    await expect(page.getByText("CAD $270.00").first()).toBeVisible();

    await page.getByRole("button", { name: "Remove Classic Leather Bifold Wallet from cart" }).click();
    await expect(page.getByText("Removed Classic Leather Bifold Wallet from your cart.")).toBeVisible();
    await expect(lines).toHaveCount(2);
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(lines).toHaveCount(3);
  });

  test("development checkout: failure keeps cart, success creates paid order in history", async ({ page }) => {
    const email = uniqueEmail("buyer");
    await register(page, email);
    await addToCart(page, "handmade-leather-watch-strap");

    // Failure path
    await page.goto("/checkout");
    await expect(page.getByLabel(/Email address/)).toHaveValue(email);
    await page.getByLabel("First name").fill("Test");
    await page.getByLabel("Last name").fill("Customer");
    await page.getByRole("button", { name: "Continue to payment" }).click();
    await expect(page.getByRole("heading", { name: "Payment simulator" })).toBeVisible();
    await page.waitForLoadState("networkidle"); // ensure hydration before interacting
    await page.getByRole("button", { name: "Simulate failed payment" }).click();
    await expect(page.getByRole("heading", { name: "Payment was not completed." })).toBeVisible();
    await expect.poll(() => headerCount(page)).toBe(1);

    // Success path
    await page.goto("/checkout");
    await page.getByRole("button", { name: "Continue to payment" }).click();
    await expect(page.getByRole("heading", { name: "Payment simulator" })).toBeVisible();
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Simulate successful payment" }).click();
    await expect(page.getByRole("heading", { name: "Thank you, Test." })).toBeVisible();
    await expect(page.getByText("Payment confirmed.", { exact: true })).toBeVisible();
    // Order-confirmation email was produced (development outbox — never sent in dev).
    const orderNumber = (await page.locator("strong", { hasText: /^LL-\d+$/ }).first().textContent())!;
    const outbox = path.join(process.cwd(), "storage", "dev-outbox");
    await expect
      .poll(() => fs.readdirSync(outbox).some((f) => fs.readFileSync(path.join(outbox, f), "utf8").includes(`Subject: Your Leyte Leather order ${orderNumber}`)))
      .toBe(true);
    await expect.poll(() => headerCount(page)).toBe(0);

    await page.goto("/account/orders");
    await expect(page.getByText("Paid").first()).toBeVisible();
    await page.getByRole("searchbox").fill("watch");
    await expect(page.getByRole("heading", { name: /Order #LL-/ })).toHaveCount(2);
    await page.getByRole("link", { name: /View order details/ }).first().click();
    await expect(page).toHaveURL(/\/account\/orders\/LL-\d+$/);
    await expect(page.getByRole("heading", { level: 1, name: /Order #LL-/ })).toBeVisible();
    await expect(page.getByText("Handmade Leather Watch Strap")).toHaveCount(1);
  });

  test("double-submitting checkout does not create duplicate orders", async ({ page, request }) => {
    await addToCart(page, "leather-car-key-fob-cover");
    const body = { email: "dup@example.com", firstName: "A", lastName: "B", phone: "", idempotencyKey: "dupkey-" + Date.now() + "-abcdefgh" };
    const headers = { Origin: new URL(page.url()).origin, "Content-Type": "application/json" };
    const r1 = await page.request.post("/api/checkout", { data: body, headers });
    const r2 = await page.request.post("/api/checkout", { data: body, headers });
    expect(r1.ok()).toBeTruthy();
    expect(r2.ok()).toBeTruthy();
    expect((await r1.json()).orderNumber).toBe((await r2.json()).orderNumber);
    void request;
  });

  test("sticky mobile checkout bar @mobileonly", async ({ page }) => {
    await addToCart(page, "classic-full-grain-leather-belt");
    await page.goto("/cart");
    await expect(page.getByRole("region", { name: "Checkout" }).getByRole("link", { name: "Proceed to checkout" })).toBeVisible();
  });
});
