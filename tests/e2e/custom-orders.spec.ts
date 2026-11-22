import { expect, test } from "@playwright/test";

const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(2048)]);

test("custom order: validation, image limit, upload and success @mobile", async ({ page }) => {
  await page.goto("/custom-orders");
  await page.getByRole("button", { name: "Submit request" }).click();
  await expect(page.getByText("Enter your name.")).toBeVisible();

  await page.getByLabel("Name").fill("Sam Maker");
  await page.getByLabel("Email address").fill("sam@example.com");
  await page.getByLabel("What would you like made?").fill("A tool roll");
  await page.getByLabel(/Measurements and specifications/).fill("About 40 x 30 cm");
  await page.getByLabel(/Budget/).fill("150");

  const files = Array.from({ length: 6 }, (_, i) => ({ name: `ref-${i}.jpg`, mimeType: "image/jpeg", buffer: jpeg }));
  await page.locator("#images-input").setInputFiles(files);
  await expect(page.getByText("You can upload up to 5 reference images.")).toBeVisible();
  await expect(page.getByRole("list", { name: "Selected reference images" }).getByRole("listitem")).toHaveCount(5);
  await page.getByRole("button", { name: "Remove ref-0.jpg" }).click();
  await expect(page.getByRole("list", { name: "Selected reference images" }).getByRole("listitem")).toHaveCount(4);

  await page.getByRole("button", { name: "Submit request" }).click();
  await expect(page.getByText("Your request has been received.")).toBeVisible();
  await expect(page.getByText(/Reference CR-/)).toBeVisible();
});
