import { describe, expect, it } from "vitest";
import { configKey } from "@/server/cart";
import { hashPassword, verifyPassword } from "@/server/security";
import { sniffImageType } from "@/server/uploads";

describe("passwords", () => {
  it("hashes with scrypt and verifies", async () => {
    const h = await hashPassword("correct horse battery");
    expect(h.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse battery", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
  });
});

describe("upload sniffing", () => {
  it("detects real image types from bytes, not names", () => {
    expect(sniffImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(sniffImageType(Buffer.from("RIFF0000WEBPVP8 "))).toBe("image/webp");
    expect(sniffImageType(Buffer.from("<svg onload=alert(1)>"))).toBeNull();
    expect(sniffImageType(Buffer.from("MZ\x90\x00"))).toBeNull();
  });
});

describe("cart configuration keys", () => {
  it("separates configurations and is order-independent", () => {
    expect(configKey({})).not.toBe(configKey({ personalisation: "pending" }));
    expect(configKey({ personalisation: "pending" })).toBe(configKey({ personalisation: "pending" }));
  });
});
