import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { register, uniqueEmail } from "./helpers";

const outbox = path.join(process.cwd(), "storage", "dev-outbox");

function resetLinkFor(email: string): string | null {
  if (!fs.existsSync(outbox)) return null;
  const files = fs
    .readdirSync(outbox)
    .map((f) => path.join(outbox, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  for (const f of files) {
    const text = fs.readFileSync(f, "utf8");
    if (text.startsWith(`To: ${email}\n`) && text.includes("Reset your Leyte Leather password")) {
      return text.match(/https?:\/\/\S+\/reset-password\?token=\S+/)?.[0] ?? null;
    }
  }
  return null;
}

test.describe("Password recovery", () => {
  test("reset link: single use, revokes sessions, old password stops working", async ({ page, browser }) => {
    const email = uniqueEmail("reset");
    await register(page, email);

    const other = await browser.newContext();
    const p2 = await other.newPage();
    await p2.goto("/forgot-password");
    await p2.waitForLoadState("networkidle");
    await p2.getByLabel("Email address").fill(email);
    await p2.getByRole("button", { name: "Send reset link" }).click();
    await expect(p2.getByText("Check your email.")).toBeVisible();

    await expect.poll(() => resetLinkFor(email)).not.toBeNull();
    const link = new URL(resetLinkFor(email)!);
    await p2.goto(link.pathname + link.search);
    await p2.waitForLoadState("networkidle");
    await p2.getByLabel(/^New password/).fill("brand-new-password-9");
    await p2.getByLabel(/^Confirm new password/).fill("brand-new-password-9");
    await p2.getByRole("button", { name: "Set new password" }).click();
    await expect(p2).toHaveURL(/\/login\?notice=reset/);
    await expect(p2.getByText("Password updated.")).toBeVisible();

    // Existing session (first browser) was revoked.
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login/);

    // Old password no longer works; new one does.
    await p2.getByLabel("Email address").fill(email);
    await p2.getByLabel(/^Password/).fill("a-strong-password-1");
    await p2.getByRole("button", { name: "Sign in" }).click();
    await expect(p2.getByText("Please check your details and try again.")).toBeVisible();
    await p2.getByLabel(/^Password/).fill("brand-new-password-9");
    await p2.getByRole("button", { name: "Sign in" }).click();
    await expect(p2).toHaveURL(/\/account$/);

    // The link cannot be used twice.
    await p2.goto(link.pathname + link.search);
    await p2.waitForLoadState("networkidle");
    await p2.getByLabel(/^New password/).fill("yet-another-password-3");
    await p2.getByLabel(/^Confirm new password/).fill("yet-another-password-3");
    await p2.getByRole("button", { name: "Set new password" }).click();
    await expect(p2.getByText("This reset link is invalid or has expired. Request a new one.")).toBeVisible();
    await other.close();
  });
});

test.describe("Keyboard accessibility", () => {
  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("mobile drawer traps focus, closes on Escape and restores focus @mobileonly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const trigger = page.getByRole("button", { name: "Open navigation menu" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    // Focus stays inside the dialog while tabbing.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      expect(await drawer.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("gallery viewer opens from the keyboard and pages with arrow keys", async ({ page }) => {
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "View Classic Leather Bifold Wallet in gallery viewer" }).focus();
    await page.keyboard.press("Enter");
    const viewer = page.getByRole("dialog");
    await expect(viewer.getByRole("heading", { name: /Classic Leather Bifold Wallet — 1 of 8/ })).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(viewer.getByRole("heading", { name: /Personalized Leather Camera Strap — 2 of 8/ })).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(viewer.getByRole("heading", { name: /— 1 of 8/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
  });
});
