// Captures signed-out and signed-in account screens + cart + 404 at 1280 for comparison with Figma renders.
import { chromium } from "@playwright/test";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = process.argv[2] ?? ".";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const shot = async (path, name) => {
  await p.goto(base + path, { waitUntil: "networkidle" });
  await p.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()));
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: true });
};
await shot("/login", "login");
await shot("/does-not-exist", "404");
const email = `qa.${Date.now()}@example.com`;
await p.request.post(base + "/api/auth/register", { data: { firstName: "", lastName: "", email, password: "a-strong-password-1", confirmPassword: "a-strong-password-1" }, headers: { Origin: base } }).catch(() => {});
await p.goto(base + "/register");
await p.getByLabel("First name").fill("Avery");
await p.getByLabel("Last name").fill("Stone");
await p.getByLabel("Email address").fill(email);
await p.getByLabel(/^Password/).fill("a-strong-password-1");
await p.getByLabel("Confirm password").fill("a-strong-password-1");
await p.getByRole("button", { name: "Create an account" }).click();
await p.waitForURL(/\/account$/);
await shot("/account", "account");
for (const [productId, config] of [["classic-leather-bifold-wallet", {}], ["personalized-leather-camera-strap", { personalisation: "pending" }]]) {
  await p.request.post(base + "/api/cart/items", { data: { productId, quantity: 1, config }, headers: { Origin: base } });
}
await shot("/cart", "cart");
await shot("/account/orders", "orders");
await shot("/account/personal-information", "personal");
await b.close();
