// Visits every public route at the given widths; reports status, overflow and console errors.
import { chromium } from "@playwright/test";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const routes = ["/", "/shop", "/shop?category=outdoor", "/product/classic-leather-bifold-wallet", "/product/personalized-leather-guitar-strap",
  "/product/personalized-leather-camera-strap/personalise", "/gallery", "/about", "/custom-orders", "/cart", "/checkout",
  "/login", "/register", "/forgot-password", "/reset-password?token=bad", "/account", "/does-not-exist"];
const widths = (process.env.WIDTHS ?? "390,768,1024,1280,1440").split(",").map(Number);
const b = await chromium.launch();
let problems = 0;
for (const w of widths) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  const errs = [];
  let r = "";
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && !(r === "/does-not-exist" && m.text().includes("404")) && errs.push(m.text()));
  for (r of routes) {
    errs.length = 0;
    const res = await p.goto(base + r, { waitUntil: "networkidle" });
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    const status = res?.status();
    const bad = overflow || errs.length || (status >= 500);
    if (bad) problems++;
    console.log(`${bad ? "✗" : "✓"} ${w} ${r} → ${status} ${p.url().replace(base, "")}${overflow ? " OVERFLOW" : ""}${errs.length ? " ERR " + errs.slice(0, 2).join(" | ") : ""}`);
  }
  await p.close();
}
await b.close();
process.exit(problems ? 1 : 0);
