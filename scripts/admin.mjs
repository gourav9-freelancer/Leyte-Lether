#!/usr/bin/env node
// Leyte Leather — business operations CLI (no admin UI is designed).
//   npm run admin -- orders [--status paid|pending_payment|payment_failed]
//   npm run admin -- order LL-1001
//   npm run admin -- custom-orders
//   npm run admin -- custom-order CR-XXXXXX
//   npm run admin -- products
//   npm run admin -- set-price <product-slug> <amount-in-CAD, e.g. 62.50>
//   npm run admin -- set-active <product-slug> <true|false>
// Uses DATABASE_PATH (default storage/leyte.db) and UPLOAD_DIR like the app.
import fs from "node:fs";
import path from "node:path";

const { DatabaseSync } = process.getBuiltinModule("node:sqlite");
const dbFile = process.env.DATABASE_PATH ? path.resolve(process.env.DATABASE_PATH) : path.join(process.cwd(), "storage", "leyte.db");
if (!fs.existsSync(dbFile)) {
  console.error(`Database not found at ${dbFile}. Start the app once (or set DATABASE_PATH).`);
  process.exit(1);
}
const db = new DatabaseSync(dbFile);
const uploadDir = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(process.cwd(), "storage", "uploads", "custom-orders");
const money = (c) => (c === null || c === undefined ? "—" : `CAD $${(c / 100).toFixed(2)}`);
const [cmd, arg, arg2] = process.argv.slice(2);

function table(rows) {
  if (!rows.length) return console.log("(none)");
  console.table(rows);
}

switch (cmd) {
  case "orders": {
    const i = process.argv.indexOf("--status");
    const status = i > -1 ? process.argv[i + 1] : null;
    const rows = db
      .prepare(
        `SELECT order_number, status, email, first_name || ' ' || last_name AS name, subtotal_cents, total_cents, payment_provider, created_at, paid_at
           FROM orders ${status ? "WHERE status = ?" : ""} ORDER BY id DESC LIMIT 200`,
      )
      .all(...(status ? [status] : []));
    table(rows.map((r) => ({ ...r, subtotal_cents: money(r.subtotal_cents), total_cents: money(r.total_cents) })));
    break;
  }
  case "order": {
    const o = db.prepare("SELECT * FROM orders WHERE order_number = ?").get(arg ?? "");
    if (!o) {
      console.error("Order not found.");
      process.exit(1);
    }
    // Never print access tokens, idempotency keys or cart identifiers.
    const { access_token_hash: _a, idempotency_key: _b, cart_id: _c, ...safe } = o;
    void _a;
    void _b;
    void _c;
    console.log({ ...safe, subtotal: money(o.subtotal_cents), shipping: money(o.shipping_cents), tax: money(o.tax_cents), total: money(o.total_cents) });
    table(
      db
        .prepare("SELECT product_name, quantity, unit_price_cents, line_total_cents, config_json FROM order_items WHERE order_id = ?")
        .all(o.id)
        .map((it) => ({ ...it, unit_price_cents: money(it.unit_price_cents), line_total_cents: money(it.line_total_cents) })),
    );
    break;
  }
  case "custom-orders":
    table(
      db
        .prepare(
          `SELECT r.reference, r.status, r.name, r.email, r.item_type, r.budget_cents, r.deadline, r.created_at,
                  (SELECT COUNT(*) FROM custom_order_files f WHERE f.request_id = r.id) AS images
             FROM custom_order_requests r ORDER BY r.id DESC LIMIT 200`,
        )
        .all()
        .map((r) => ({ ...r, budget_cents: money(r.budget_cents) })),
    );
    break;
  case "custom-order": {
    const r = db.prepare("SELECT * FROM custom_order_requests WHERE reference = ?").get(arg ?? "");
    if (!r) {
      console.error("Request not found.");
      process.exit(1);
    }
    console.log({ ...r, budget: money(r.budget_cents) });
    const files = db.prepare("SELECT stored_name, mime_type, size_bytes FROM custom_order_files WHERE request_id = ?").all(r.id);
    table(files.map((f) => ({ ...f, path: path.join(uploadDir, f.stored_name) })));
    break;
  }
  case "products":
    table(
      db
        .prepare("SELECT id, name, price_cents, category, personalisable, active FROM products ORDER BY sort_order")
        .all()
        .map((p) => ({ ...p, price_cents: money(p.price_cents) })),
    );
    break;
  case "set-price": {
    if (!/^\d{1,6}(\.\d{1,2})?$/.test(arg2 ?? "") || Number(arg2) <= 0) {
      console.error("Usage: set-price <product-slug> <amount in CAD, e.g. 62.50>");
      process.exit(1);
    }
    const cents = Math.round(Number(arg2) * 100);
    const res = db.prepare("UPDATE products SET price_cents = ? WHERE id = ?").run(cents, arg ?? "");
    console.log(res.changes ? `Updated ${arg} to ${money(cents)}. Carts reprice automatically; existing orders keep their recorded prices.` : "Product not found.");
    break;
  }
  case "set-active": {
    if (!["true", "false"].includes(arg2)) {
      console.error("Usage: set-active <product-slug> <true|false>");
      process.exit(1);
    }
    const res = db.prepare("UPDATE products SET active = ? WHERE id = ?").run(arg2 === "true" ? 1 : 0, arg ?? "");
    console.log(res.changes ? `${arg} is now ${arg2 === "true" ? "available" : "hidden from the shop and removed from carts"}.` : "Product not found.");
    break;
  }
  default:
    console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1, 10).join("\n"));
}
