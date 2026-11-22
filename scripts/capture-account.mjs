// Captures account screens with real data at 390 and 1280 (needs `npm run dev` with PAYMENTS_MODE=development).
// Usage: node scripts/capture-account.mjs <outDir>
import { chromium } from "@playwright/test";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = process.argv[2] ?? ".";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const H = { Origin: base, "Content-Type": "application/json" };

const email = `qa.${Date.now()}@example.com`;
await p.goto(base + "/");
await p.request.post(base + "/api/auth/register", { data: { firstName: "Avery", lastName: "Stone", email, password: "a-strong-password-1", confirmPassword: "a-strong-password-1" }, headers: H });
await p.request.patch(base + "/api/account/profile", { data: { firstName: "Avery", lastName: "Stone", phone: "+1 705 555 0100" }, headers: H });
for (const [productId, config] of [["classic-leather-bifold-wallet", {}], ["personalized-leather-camera-strap", { personalisation: "pending" }]]) {
  await p.request.post(base + "/api/cart/items", { data: { productId, quantity: 1, config }, headers: H });
}
const co = await p.request.post(base + "/api/checkout", {
  data: { email, firstName: "Avery", lastName: "Stone", phone: "", idempotencyKey: `qa-${Date.now()}-abcdefghij` },
  headers: H,
});
const { redirectUrl } = await co.json();
const token = redirectUrl.split("/").pop();
await p.request.post(base + "/api/payments/dev-simulate", { data: { token, outcome: "success" }, headers: H });

// Re-fill the cart so cart/checkout render their active states.
for (const [productId, config] of [["classic-full-grain-leather-belt", {}], ["personalized-leather-guitar-strap", { personalisation: "pending" }]]) {
  await p.request.post(base + "/api/cart/items", { data: { productId, quantity: 2, config }, headers: H });
}
const problems = [];
const widths = (process.env.WIDTHS ?? "390,768,1024,1280").split(",").map(Number);
for (const w of widths) {
  await p.setViewportSize({ width: w, height: 900 });
  for (const [name, path] of [["overview", "/account"], ["personal", "/account/personal-information"], ["orders", "/account/orders"], ["order", "/account/orders/" + (await (await p.request.get(base + "/account/orders")).text()).match(/LL-\d+/)?.[0]], ["security", "/account/security"], ["cart", "/cart"], ["checkout", "/checkout"]]) {
    await p.goto(base + path, { waitUntil: "networkidle" });
    await p.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()));
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (overflow) problems.push(`${w} ${path} OVERFLOW`);
    await p.screenshot({ path: `${out}/${name}-${w}.png`, fullPage: true });
  }
  await p.goto(base + "/account/personal-information", { waitUntil: "networkidle" });
  await p.getByRole("button", { name: /^Edit/ }).click();
  await p.screenshot({ path: `${out}/personal-edit-${w}.png`, fullPage: true });
}
console.log(problems.length ? problems.join("\n") : `no overflow on ${widths.length} widths`);
await b.close();
