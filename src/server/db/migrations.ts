/*
 * Ordered, append-only schema migrations. Never edit an applied migration;
 * add a new version instead.
 */
export const MIGRATIONS: { version: number; sql: string }[] = [
  {
    version: 1,
    sql: /* sql */ `
      CREATE TABLE products (
        id TEXT PRIMARY KEY,                 -- slug, e.g. classic-leather-bifold-wallet
        name TEXT NOT NULL,
        price_cents INTEGER NOT NULL CHECK (price_cents > 0),
        currency TEXT NOT NULL DEFAULT 'CAD' CHECK (currency = 'CAD'),
        category TEXT NOT NULL CHECK (category IN ('essentials','personalised','outdoor')),
        personalisable INTEGER NOT NULL DEFAULT 0 CHECK (personalisable IN (0,1)),
        active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        password_changed_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE sessions (
        id_hash TEXT PRIMARY KEY,            -- sha256 of the random session token
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        user_agent TEXT
      );
      CREATE INDEX idx_sessions_customer ON sessions(customer_id);

      CREATE TABLE password_resets (
        token_hash TEXT PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used_at TEXT
      );

      CREATE TABLE carts (
        id_hash TEXT PRIMARY KEY,            -- sha256 of the random cart cookie value
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id TEXT NOT NULL REFERENCES carts(id_hash) ON DELETE CASCADE,
        product_id TEXT NOT NULL REFERENCES products(id),
        config_key TEXT NOT NULL,            -- canonical hash of the configuration
        config_json TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 10),
        created_at TEXT NOT NULL,
        UNIQUE (cart_id, product_id, config_key)
      );

      CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT NOT NULL UNIQUE,
        access_token_hash TEXT NOT NULL UNIQUE,
        customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        email TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        status TEXT NOT NULL CHECK (status IN ('pending_payment','paid','payment_failed','cancelled')),
        currency TEXT NOT NULL DEFAULT 'CAD',
        subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
        shipping_cents INTEGER,
        tax_cents INTEGER,
        total_cents INTEGER,
        payment_provider TEXT NOT NULL,
        payment_ref TEXT,
        idempotency_key TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        paid_at TEXT
      );
      CREATE INDEX idx_orders_customer ON orders(customer_id, created_at);

      CREATE TABLE order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents > 0),
        quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 10),
        config_json TEXT NOT NULL,
        line_total_cents INTEGER NOT NULL
      );

      CREATE TABLE payment_events (
        provider_event_id TEXT PRIMARY KEY,  -- webhook idempotency
        order_id INTEGER REFERENCES orders(id),
        type TEXT NOT NULL,
        received_at TEXT NOT NULL
      );

      CREATE TABLE custom_order_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT NOT NULL UNIQUE,
        customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        item_type TEXT NOT NULL,
        measurements TEXT NOT NULL,
        notes TEXT,
        budget_cents INTEGER,
        deadline TEXT,
        status TEXT NOT NULL DEFAULT 'received',
        created_at TEXT NOT NULL
      );

      CREATE TABLE custom_order_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER NOT NULL REFERENCES custom_order_requests(id) ON DELETE CASCADE,
        stored_name TEXT NOT NULL UNIQUE,    -- server-generated, never client supplied
        mime_type TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE rate_limits (
        key TEXT PRIMARY KEY,
        window_start INTEGER NOT NULL,
        count INTEGER NOT NULL
      );

      CREATE TABLE security_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event TEXT NOT NULL,
        customer_id INTEGER,
        ip_hash TEXT,
        created_at TEXT NOT NULL
      );
    `,
  },
  {
    version: 2,
    sql: /* sql */ `
      ALTER TABLE orders ADD COLUMN cart_id TEXT;
      CREATE INDEX idx_orders_cart ON orders(cart_id);
    `,
  },
];
