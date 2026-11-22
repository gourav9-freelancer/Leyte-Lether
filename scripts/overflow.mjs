import { chromium } from "@playwright/test";
const [, , path, width = "390"] = process.argv;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +width, height: 900 } });
await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
const r = await p.evaluate(() => { const w = document.documentElement.clientWidth; return [...document.querySelectorAll("body *")].filter(e => e.getBoundingClientRect().right > w + 1).slice(0, 8).map(e => `${e.tagName}.${(e.className||"").toString().slice(0,60)} right=${Math.round(e.getBoundingClientRect().right)} "${(e.textContent||"").slice(0,40)}"`); });
console.log(r.join("\n")); await b.close();
