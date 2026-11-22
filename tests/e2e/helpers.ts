import { expect, type Page } from "@playwright/test";

export const uniqueEmail = (tag: string) => `${tag}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`;

export async function register(page: Page, email: string, password = "a-strong-password-1") {
  await page.goto("/register");
  await page.getByLabel("First name").fill("Test");
  await page.getByLabel("Last name").fill("Customer");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel(/^Password/).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create an account" }).click();
  await expect(page).toHaveURL(/\/account$/);
}

export async function addToCart(page: Page, slug: string) {
  await page.goto(`/product/${slug}`);
  await page.locator(".add-to-cart").click();
  await expect(page.getByText("Added to your cart.")).toBeVisible();
}

export async function headerCount(page: Page) {
  const v = await page.locator("[data-cart-count]").getAttribute("data-cart-count");
  return Number(v);
}
