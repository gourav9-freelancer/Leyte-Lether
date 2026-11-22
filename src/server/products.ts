import "server-only";
import { CATALOG, catalogEntry, type CatalogProduct, type CategoryId } from "@/data/catalog";
import { many, one } from "./db";

export interface Product extends CatalogProduct {
  priceCents: number; // authoritative DB price
  active: boolean;
}

interface Row {
  id: string;
  name: string;
  price_cents: number;
  category: CategoryId;
  personalisable: number;
  active: number;
  sort_order: number;
}

function hydrate(row: Row): Product | null {
  const meta = catalogEntry(row.id);
  if (!meta) return null;
  return {
    ...meta,
    name: row.name,
    priceCents: row.price_cents,
    category: row.category,
    personalisable: row.personalisable === 1,
    active: row.active === 1,
    sortOrder: row.sort_order,
  };
}

export function listProducts(): Product[] {
  return many<Row>("SELECT * FROM products WHERE active = 1 ORDER BY sort_order ASC")
    .map(hydrate)
    .filter((p): p is Product => p !== null);
}

export function getProduct(slug: string): Product | null {
  const row = one<Row>("SELECT * FROM products WHERE id = ?", slug);
  return row ? hydrate(row) : null;
}

export function catalogueSize(): number {
  return listProducts().length || CATALOG.length;
}
