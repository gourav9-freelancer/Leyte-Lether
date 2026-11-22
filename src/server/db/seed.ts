import type { DatabaseSync } from "node:sqlite";
import { CATALOG } from "@/data/catalog";

/**
 * Inserts the verified catalogue if a product row is missing. Existing rows are
 * never overwritten, so prices changed by the business in the database persist.
 */
export function seedCatalog(db: DatabaseSync) {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO products (id, name, price_cents, category, personalisable, active, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
  );
  const now = new Date().toISOString();
  for (const p of CATALOG) {
    insert.run(p.slug, p.name, p.priceCents, p.category, p.personalisable ? 1 : 0, p.sortOrder, now);
  }
}
