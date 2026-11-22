import { describe, expect, it } from "vitest";
import { addToCartSchema, checkoutSchema, customOrderSchema, profileSchema, registerSchema, todayInWorkshop } from "@/lib/validation";

describe("validation", () => {
  it("rejects unknown keys (mass assignment)", () => {
    expect(addToCartSchema.safeParse({ productId: "classic-leather-bifold-wallet", quantity: 1, price: 1 }).success).toBe(false);
    expect(profileSchema.safeParse({ firstName: "A", lastName: "B", email: "x@y.z" }).success).toBe(false);
  });
  it("bounds quantity 1..10 and integers only", () => {
    for (const q of [0, 11, 1.5, -1]) expect(addToCartSchema.safeParse({ productId: "classic-leather-bifold-wallet", quantity: q }).success).toBe(false);
    expect(addToCartSchema.safeParse({ productId: "classic-leather-bifold-wallet", quantity: 10 }).success).toBe(true);
  });
  it("only accepts confirmed configuration fields", () => {
    expect(addToCartSchema.safeParse({ productId: "personalized-leather-camera-strap", quantity: 1, config: { personalisation: "pending" } }).success).toBe(true);
    expect(addToCartSchema.safeParse({ productId: "personalized-leather-camera-strap", quantity: 1, config: { initials: "AB" } }).success).toBe(false);
  });
  it("normalises email and enforces password rules", () => {
    const ok = registerSchema.safeParse({ firstName: "A", lastName: "B", email: "  Me@Example.COM ", password: "longenough1", confirmPassword: "longenough1" });
    expect(ok.success && ok.data.email).toBe("me@example.com");
    expect(registerSchema.safeParse({ firstName: "A", lastName: "B", email: "me@example.com", password: "short", confirmPassword: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ firstName: "A", lastName: "B", email: "me@example.com", password: "longenough1", confirmPassword: "different11" }).success).toBe(false);
  });
  it("requires a well-formed idempotency key at checkout", () => {
    const base = { email: "a@b.co", firstName: "A", lastName: "B" };
    expect(checkoutSchema.safeParse({ ...base, idempotencyKey: "short" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...base, idempotencyKey: "abcdefghijklmnopqrstuvwx" }).success).toBe(true);
  });
  it("validates custom order budget and deadline formats", () => {
    const base = { name: "A", email: "a@b.co", itemType: "Wallet", measurements: "10cm" };
    expect(customOrderSchema.safeParse({ ...base, budget: "150.00" }).success).toBe(true);
    expect(customOrderSchema.safeParse({ ...base, budget: "-5" }).success).toBe(false);
    expect(customOrderSchema.safeParse({ ...base, deadline: "tomorrow" }).success).toBe(false);
    expect(customOrderSchema.safeParse({ ...base, deadline: "2026-13-45" }).success).toBe(false);
    expect(customOrderSchema.safeParse({ ...base, deadline: "2026-02-31" }).success).toBe(false);
    expect(customOrderSchema.safeParse({ ...base, deadline: "2028-02-29" }).success).toBe(true);
  });
  it("computes today in the workshop time zone", () => {
    // 02:00 UTC on Nov 23 is still Nov 22 in Toronto.
    expect(todayInWorkshop(new Date("2026-11-23T02:00:00Z"))).toBe("2026-11-22");
  });
});
