import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/format";
import { safeNext } from "@/lib/safe-redirect";
import { applyFilters, filtersToQuery, parseFilters, type ShopProduct } from "@/lib/shop";

const P = (slug: string, priceCents: number, category: ShopProduct["category"], personalisable = false, featuredRank = 0): ShopProduct => ({
  slug, name: slug.replace(/-/g, " "), priceCents, category, personalisable, featuredRank, image: { src: "", alt: "", width: 1, height: 1 },
});
const items = [P("wallet", 6000, "essentials", false, 2), P("camera-strap", 7500, "personalised", true, 1), P("axe-sheath", 5500, "outdoor", false, 0)];

describe("formatPrice", () => {
  it("uses the single CAD format from the design", () => {
    expect(formatPrice(6000)).toBe("CAD $60.00");
    expect(formatPrice(135000)).toBe("CAD $1,350.00");
  });
});

describe("safeNext (open-redirect protection)", () => {
  it.each(["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "/ok\r\nSet-Cookie:x", "/\t/evil.com", "/\n/evil.com", "/a\\..\\evil"])("rejects %s", (v) => {
    expect(safeNext(v)).toBe("/account");
  });
  it("accepts relative paths", () => expect(safeNext("/account/orders")).toBe("/account/orders"));
});

describe("shop filters", () => {
  it("parses and sanitises URL params", () => {
    expect(parseFilters({ category: "nope", sort: "evil" })).toEqual({ q: "", category: "all", personalisable: false, sort: "featured" });
    expect(parseFilters({ category: "outdoor", personalisation: "1", sort: "price-asc", q: "axe" })).toMatchObject({ category: "outdoor", personalisable: true });
  });
  it("combines category, personalisation, search and sort", () => {
    expect(applyFilters([...items], { q: "", category: "all", personalisable: false, sort: "featured" }).map((p) => p.slug)).toEqual(["axe-sheath", "camera-strap", "wallet"]);
    expect(applyFilters([...items], { q: "", category: "all", personalisable: false, sort: "price-desc" }).map((p) => p.slug)).toEqual(["camera-strap", "wallet", "axe-sheath"]);
    expect(applyFilters([...items], { q: "", category: "all", personalisable: true, sort: "featured" }).map((p) => p.slug)).toEqual(["camera-strap"]);
    expect(applyFilters([...items], { q: "WALL", category: "essentials", personalisable: false, sort: "featured" })).toHaveLength(1);
    expect(applyFilters([...items], { q: "zzz", category: "all", personalisable: false, sort: "featured" })).toHaveLength(0);
  });
  it("round-trips to a query string", () => {
    expect(filtersToQuery({ q: "axe", category: "outdoor", personalisable: false, sort: "featured" })).toBe("?q=axe&category=outdoor");
    expect(filtersToQuery({ q: "", category: "all", personalisable: false, sort: "featured" })).toBe("");
  });
});
