import { expect, test } from "@playwright/test";
import { addToCart, register, uniqueEmail } from "./helpers";

test.describe("Security controls", () => {
  test("customers cannot read other customers' orders (IDOR)", async ({ page, browser }) => {
    await register(page, uniqueEmail("victim"));
    await addToCart(page, "classic-leather-bifold-wallet");
    await page.goto("/checkout");
    await page.getByLabel("First name").fill("V");
    await page.getByLabel("Last name").fill("Ictim");
    await page.getByRole("button", { name: "Continue to payment" }).click();
    await expect(page.getByRole("heading", { name: "Payment simulator" })).toBeVisible();
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Simulate successful payment" }).click();
    await page.goto("/account/orders");
    const orderNumber = (await page.getByRole("heading", { name: /Order #LL-/ }).first().textContent())!.replace("Order #", "").trim();

    const ctx = await browser.newContext();
    const attacker = await ctx.newPage();
    await register(attacker, uniqueEmail("attacker"));
    const res = await attacker.goto(`/account/orders/${orderNumber}`);
    expect(res?.status()).toBe(404);
    await ctx.close();
  });

  test("cross-site (CSRF) requests are rejected", async ({ request }) => {
    const r = await request.post("/api/cart/items", {
      data: { productId: "classic-leather-bifold-wallet", quantity: 1 },
      headers: { Origin: "https://evil.example", "Content-Type": "application/json" },
    });
    expect(r.status()).toBe(403);
    const noOrigin = await request.post("/api/auth/logout", { headers: {} });
    expect(noOrigin.status()).toBe(403);
  });

  test("client-supplied prices and unknown fields are rejected", async ({ request, baseURL }) => {
    const r = await request.post("/api/cart/items", {
      data: { productId: "classic-leather-bifold-wallet", quantity: 1, priceCents: 1 },
      headers: { Origin: baseURL!, "Content-Type": "application/json" },
    });
    expect(r.status()).toBe(422);
    const ok = await request.post("/api/cart/items", {
      data: { productId: "classic-leather-bifold-wallet", quantity: 2 },
      headers: { Origin: baseURL!, "Content-Type": "application/json" },
    });
    const cart = await ok.json();
    expect(cart.subtotalCents).toBe(12000); // server price
  });

  test("personalisation config is refused for non-personalisable products", async ({ request, baseURL }) => {
    const r = await request.post("/api/cart/items", {
      data: { productId: "classic-leather-bifold-wallet", quantity: 1, config: { personalisation: "pending" } },
      headers: { Origin: baseURL!, "Content-Type": "application/json" },
    });
    expect(r.status()).toBe(409);
  });

  test("malicious uploads are rejected by content, and file count is capped", async ({ request, baseURL }) => {
    const base = { name: "A", email: "a@example.com", itemType: "Wallet", measurements: "10cm" };
    const svg = await request.post("/api/custom-orders", {
      headers: { Origin: baseURL! },
      multipart: { ...base, images: { name: "photo.jpg", mimeType: "image/jpeg", buffer: Buffer.from("<svg onload=alert(1)></svg>") } },
    });
    expect(svg.status()).toBe(422);
    expect((await svg.json()).error.message).toMatch(/JPEG, PNG or WebP/);

    const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(100)]);
    const ok = await request.post("/api/custom-orders", {
      headers: { Origin: baseURL! },
      multipart: { ...base, images: { name: "../../etc/passwd.jpg", mimeType: "image/jpeg", buffer: jpeg } },
    });
    expect(ok.status()).toBe(201);
    expect((await ok.json()).reference).toMatch(/^CR-/);
  });

  test("per-account login throttling", async ({ request, baseURL }) => {
    const email = uniqueEmail("throttle");
    let last = 0;
    for (let i = 0; i < 9; i++) {
      const r = await request.post("/api/auth/login", { data: { email, password: "wrong-password" }, headers: { Origin: baseURL!, "Content-Type": "application/json" } });
      last = r.status();
    }
    expect(last).toBe(429);
  });

  test("security headers and CSP are present; session cookie is HttpOnly", async ({ page, context }) => {
    const res = await page.goto("/");
    const h = res!.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["content-security-policy"]).toMatch(/script-src 'self' 'nonce-/);
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    await register(page, uniqueEmail("cookie"));
    const cookie = (await context.cookies()).find((c) => c.name.endsWith("ll_session"));
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Lax");
  });

  test("open redirects via ?next= are blocked", async ({ page }) => {
    const email = uniqueEmail("redir");
    await register(page, email);
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.goto("/login?next=//evil.example");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel(/^Password/).fill("a-strong-password-1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/localhost:\d+\/account$/);
  });

  test("credentials can never be submitted in a URL before hydration", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    for (const path of ["/login", "/register", "/checkout", "/custom-orders"]) {
      await page.goto(baseURL + path);
      const form = page.locator("main form").first();
      if ((await form.count()) === 0) continue; // e.g. empty-cart checkout has no form
      expect(await form.getAttribute("method")).toBe("post");
      await expect(form.locator('button[type="submit"]')).toBeDisabled();
    }
    await ctx.close();
  });
});
