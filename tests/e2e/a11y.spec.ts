import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/shop", "/product/personalized-leather-camera-strap", "/product/personalized-leather-camera-strap/personalise", "/gallery", "/about", "/custom-orders", "/cart", "/login", "/register", "/does-not-exist"];

for (const path of PAGES) {
  test(`no serious or critical WCAG 2.2 AA violations on ${path} @mobile`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });
    // Analyse the settled, hydrated page (submit buttons are disabled until hydration
    // and animate 220ms into their enabled colours).
    await page.waitForTimeout(400);
    const results = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]["page"] }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`)).toEqual([]);
  });
}
