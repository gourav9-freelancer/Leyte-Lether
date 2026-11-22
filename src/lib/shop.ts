import type { CategoryId } from "@/data/catalog";

export type SortId = "featured" | "price-asc" | "price-desc" | "name";

export const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "name", label: "Name: A to Z" },
];

export interface ShopFilters {
  q: string;
  category: CategoryId | "all";
  personalisable: boolean;
  sort: SortId;
}

export interface ShopProduct {
  slug: string;
  name: string;
  priceCents: number;
  category: CategoryId;
  personalisable: boolean;
  image: { src: string; alt: string; width: number; height: number };
  featuredRank: number;
}

const CATEGORY_IDS = ["essentials", "personalised", "outdoor"] as const;

export function parseFilters(params: Record<string, string | string[] | undefined>): ShopFilters {
  const one = (k: string) => {
    const v = params[k];
    return (Array.isArray(v) ? v[0] : v) ?? "";
  };
  const category = one("category");
  const sort = one("sort");
  return {
    q: one("q").slice(0, 80),
    category: (CATEGORY_IDS as readonly string[]).includes(category) ? (category as CategoryId) : "all",
    personalisable: one("personalisation") === "1",
    sort: SORT_OPTIONS.some((s) => s.id === sort) ? (sort as SortId) : "featured",
  };
}

export function filtersToQuery(f: ShopFilters): string {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.category !== "all") p.set("category", f.category);
  if (f.personalisable) p.set("personalisation", "1");
  if (f.sort !== "featured") p.set("sort", f.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function applyFilters(products: ShopProduct[], f: ShopFilters): ShopProduct[] {
  const q = f.q.trim().toLowerCase();
  const out = products.filter(
    (p) =>
      (f.category === "all" || p.category === f.category) &&
      (!f.personalisable || p.personalisable) &&
      (!q || p.name.toLowerCase().includes(q)),
  );
  switch (f.sort) {
    case "price-asc":
      return out.sort((a, b) => a.priceCents - b.priceCents || a.featuredRank - b.featuredRank);
    case "price-desc":
      return out.sort((a, b) => b.priceCents - a.priceCents || a.featuredRank - b.featuredRank);
    case "name":
      return out.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return out.sort((a, b) => a.featuredRank - b.featuredRank);
  }
}

export function activeFilterCount(f: ShopFilters): number {
  return (f.category !== "all" ? 1 : 0) + (f.personalisable ? 1 : 0);
}
