// Usage: node scripts/shot.mjs <path> <width> <outfile> [fullPage=1]
import { chromium } from "@playwright/test";
const [, , path = "/", width = "1280", out = "shot.png", full = "1"] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle" });
await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); await document.fonts.ready; });
await page.waitForLoadState("networkidle");
await page.screenshot({ path: out, fullPage: full === "1" });
const h = await page.evaluate(() => document.documentElement.scrollHeight);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
console.log(JSON.stringify({ path, width, height: h, horizontalOverflow: overflow, errors }));
await browser.close();
