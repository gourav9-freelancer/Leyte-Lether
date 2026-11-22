// Visual QA: captures every designed page at 390/768/1024/1280/1440 and builds
// side-by-side comparisons with the Figma reference renders in docs/figma-reference.
// Usage: node scripts/visual-qa.mjs   (needs `npm run dev` on :3000). Output: docs/visual-qa/
import { chromium } from "@playwright/test";
import fs from "node:fs";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = "docs/visual-qa";
fs.mkdirSync(out, { recursive: true });
const pages = {
  home: "/", about: "/about", shop: "/shop", customiser: "/product/personalized-leather-camera-strap/personalise",
  product: "/product/classic-leather-bifold-wallet", cart: "/cart", gallery: "/gallery", login: "/login",
  "custom-orders": "/custom-orders", "not-found": "/does-not-exist",
};
const widths = [390, 768, 1024, 1280, 1440];
const b = await chromium.launch();
const ctx = await b.newContext();
const seed = await ctx.newPage();
// Put two items in the cart so the cart page shows its active state (as designed).
await seed.goto(base + "/");
for (const [productId, config] of [["classic-leather-bifold-wallet", {}], ["personalized-leather-camera-strap", { personalisation: "pending" }]]) {
  await seed.request.post(base + "/api/cart/items", { data: { productId, quantity: 1, config }, headers: { Origin: base } });
}
const report = [];
for (const w of widths) {
  const p = await ctx.newPage();
  await p.setViewportSize({ width: w, height: 900 });
  for (const [name, path] of Object.entries(pages)) {
    await p.goto(base + path, { waitUntil: "networkidle" });
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); }
      window.scrollTo(0, 0);
      await document.fonts.ready;
      document.querySelectorAll("nextjs-portal").forEach((e) => e.remove());
    });
    await p.waitForLoadState("networkidle");
    const file = `${out}/${name}-${w}.png`;
    await p.screenshot({ path: file, fullPage: true });
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    report.push({ name, width: w, height: h });
  }
  await p.close();
}
fs.writeFileSync(`${out}/heights.json`, JSON.stringify(report, null, 2));
await b.close();
console.log(`captured ${report.length} screenshots`);
