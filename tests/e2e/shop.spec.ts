import { expect, test } from "@playwright/test";

test.describe("Shop", () => {
  test("filters, search, sort, no-results and URL persistence", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByText("Showing 8 products")).toBeVisible();

    await page.getByRole("button", { name: /Lifestyle and Outdoor/ }).click();
    await expect(page.getByText("Showing 2 products")).toBeVisible();
    await expect(page).toHaveURL(/category=outdoor/);

    await page.getByRole("searchbox", { name: "Search products" }).fill("harness");
    await expect(page.getByText("Showing 1 product")).toBeVisible();
    await expect(page).toHaveURL(/q=harness/);

    // Navigate to a product and back — filters persist.
    await page.getByRole("link", { name: "Premium Leather Dog Harness" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Premium Leather Dog Harness" })).toBeVisible();
    await page.goBack();
    await expect(page.getByText("Showing 1 product")).toBeVisible();

    await page.getByRole("searchbox", { name: "Search products" }).fill("zzzz");
    await expect(page.getByRole("heading", { name: "No products found." })).toBeVisible();
    await page.getByRole("button", { name: "View all products" }).click();
    await expect(page.getByText("Showing 8 products")).toBeVisible();

    await page.locator("select").last().selectOption("price-asc");
    await expect(page.locator("ul li article h3").first()).toHaveText("Leather Car Key Fob Cover");
  });

  test("filter drawer applies personalisation filter @mobileonly", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("button", { name: /Filters/ }).click();
    await page.getByRole("dialog").getByLabel("Personalisation available").check();
    await page.getByRole("button", { name: "Show results" }).click();
    await expect(page.getByText("Showing 2 products")).toBeVisible();
    await expect(page).toHaveURL(/personalisation=1/);
  });

  test("mobile navigation drawer opens, navigates and closes @mobileonly", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await drawer.getByRole("link", { name: "Gallery" }).click();
    await expect(page).toHaveURL(/\/gallery$/);
    await expect(drawer).toBeHidden();
  });

  test("unknown product returns 404", async ({ page }) => {
    const res = await page.goto("/product/not-a-real-product");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Looks like this piece is missing." })).toBeVisible();
  });
});
