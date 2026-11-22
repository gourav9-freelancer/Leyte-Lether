import { expect, test } from "@playwright/test";
import { register, uniqueEmail } from "./helpers";

test.describe("Authentication and account", () => {
  test("protected pages redirect to sign-in and return after login", async ({ page }) => {
    await page.goto("/account/orders");
    await expect(page).toHaveURL(/\/login\?next=%2Faccount%2Forders/);
    const email = uniqueEmail("login");
    await register(page, email);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login\?notice=signed-out/);
    await expect(page.getByText("You've been signed out.")).toBeVisible();
    await page.goto("/account/orders");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel(/^Password/).fill("a-strong-password-1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/account\/orders$/);
    await expect(page.getByRole("heading", { name: "No orders yet." })).toBeVisible();
  });

  test("invalid credentials show a generic error; validation messages are shown", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Enter your email address.")).toBeVisible();
    await page.getByLabel("Email address").fill("nobody@example.com");
    await page.getByLabel(/^Password/).fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Please check your details and try again.")).toBeVisible();
  });

  test("account navigation: exactly one active section per route", async ({ page }) => {
    await register(page, uniqueEmail("nav"));
    for (const [path, label] of [
      ["/account", "Account Overview"],
      ["/account/personal-information", "Personal Information"],
      ["/account/orders", "Order History"],
      ["/account/security", "Account Security"],
    ]) {
      await page.goto(path);
      const nav = page.getByRole("navigation", { name: "Account navigation" });
      await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
      await expect(nav.locator('[aria-current="page"]')).toHaveText(label);
    }
  });

  test("personal information: validation, save success, values persisted, XSS rendered as text", async ({ page }) => {
    await register(page, uniqueEmail("profile"));
    await page.goto("/account/personal-information");
    // Read-only state first (Figma 3:63)
    await expect(page.getByText("Not yet provided")).toHaveCount(1); // phone
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /^Edit/ }).click();
    await expect(page.getByRole("form", { name: "Edit personal details" })).toBeVisible();
    await page.getByLabel("Phone number").fill("not a phone!!");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Enter a valid phone number, or leave this empty.")).toBeVisible();
    await page.getByLabel("Phone number").fill("+1 705 555 0100");
    await page.getByLabel("First name").fill('<img src=x onerror="window.__xss=1">');
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Your details have been saved.")).toBeVisible();
    // Back to read-only with the stored values
    await expect(page.getByText("+1 705 555 0100")).toBeVisible();
    await expect(page.getByRole("form", { name: "Edit personal details" })).toHaveCount(0);
    // Cancel discards unsaved edits
    await page.getByRole("button", { name: /^Edit/ }).click();
    await page.getByLabel("Phone number").fill("+1 705 555 9999");
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("+1 705 555 0100")).toBeVisible();
    await page.goto("/account");
    await expect(page.getByText('<img src=x onerror="window.__xss=1"> Customer')).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
  });

  test("password change signs out other sessions; forgot password never reveals accounts", async ({ page, browser }) => {
    const email = uniqueEmail("pw");
    await register(page, email);
    const other = await browser.newContext();
    const p2 = await other.newPage();
    await p2.goto("/login");
    await p2.getByLabel("Email address").fill(email);
    await p2.getByLabel(/^Password/).fill("a-strong-password-1");
    await p2.getByRole("button", { name: "Sign in" }).click();
    await expect(p2).toHaveURL(/\/account$/);

    await page.goto("/account/security");
    await page.getByLabel("Current password").fill("a-strong-password-1");
    await page.getByLabel(/^New password/).fill("another-strong-pass-2");
    await page.getByLabel("Confirm new password").fill("another-strong-pass-2");
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page.getByText("Password updated.")).toBeVisible();

    await p2.goto("/account");
    await expect(p2).toHaveURL(/\/login\?next=%2Faccount&notice=expired/);
    await expect(p2.getByText("Your session has expired.")).toBeVisible();
    await other.close();

    await page.goto("/forgot-password");
    await page.getByLabel("Email address").fill("definitely-not-registered@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText("If an account exists for that address")).toBeVisible();
  });
});
