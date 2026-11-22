# Deployment & security configuration

## 1. Hosting model

The app is a single Next.js server (`npm run build && npm start`). It needs:

- **Node.js 22.13+**
- **Persistent disk** for `DATABASE_PATH` (SQLite) and `UPLOAD_DIR` (custom-order images). A container platform with a mounted volume (Fly.io, Render, Railway, a VM) works as-is.
- **HTTPS** terminated in front of the app. In production the session and cart cookies use the `__Host-` prefix with `Secure`, and HSTS is sent.

> **Serverless hosts (e.g. Vercel):** the filesystem is ephemeral, so SQLite and local uploads are not suitable. Before deploying there, move the repository functions in `src/server/*` to Postgres (all SQL is parameterised and isolated in that folder) and uploads to private object storage (e.g. S3 with server-side access only).

## 2. Environment

Copy `.env.example`. Required in production:

| Variable | Purpose |
| --- | --- |
| `APP_ORIGIN` | Public origin, e.g. `https://leyteleather.ca`. Used for CSRF origin checks and payment redirect URLs. |
| `DATABASE_PATH` | SQLite file on persistent storage. |
| `UPLOAD_DIR` | Private directory for reference images (outside `public/`). |
| `IP_HASH_SALT` | Random string; IPs are only stored hashed. |
| `TRUST_PROXY` | `1` only behind a trusted proxy/CDN that sets `X-Forwarded-For` (needed for accurate per-IP rate limiting). |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Enables payments. Without both, checkout shows "Online payment isn't available yet" — it never fakes success. |

`PAYMENTS_MODE=development` and `RATE_LIMIT_SCALE` are ignored when `NODE_ENV=production`.

## 3. Database

Migrations live in `src/server/db/migrations.ts` (append-only, versioned) and run automatically on first connection inside a transaction. The verified catalogue is seeded with `INSERT OR IGNORE`, so price changes made by the business in the database are never overwritten.

Back up the database file (with its `-wal` file) regularly. Example:

```bash
sqlite3 storage/leyte.db ".backup storage/backup-$(date +%F).db"
```

## 4. Payments (Stripe)

1. Create a Stripe account in CAD. Configure **shipping rates**, **shipping countries** and **Stripe Tax** only after Leyte Leather confirms these business rules, then set `STRIPE_SHIPPING_RATE_IDS`, `STRIPE_SHIPPING_COUNTRIES`, `STRIPE_AUTOMATIC_TAX`.
2. Add a webhook endpoint: `https://<domain>/api/payments/stripe/webhook` with events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.
3. Flow: checkout creates a `pending_payment` order from **server prices** (idempotency key prevents duplicates) → Stripe Checkout (card data never touches this server) → the **signed webhook** (or a server-side session lookup on the confirmation page) marks it paid exactly once and clears the cart. A browser redirect alone never marks an order paid.

## 5. Email

`src/server/mail.ts` integrates **Resend** or **Postmark** over HTTPS (no SDK). Set:

| Variable | Value |
| --- | --- |
| `MAIL_PROVIDER` | `resend` or `postmark` |
| `MAIL_API_KEY` | Resend API key / Postmark server token |
| `MAIL_FROM` | A sender verified with the provider |
| `BUSINESS_NOTIFICATION_EMAIL` | Inbox for new paid orders and custom-order requests |

Messages sent: password-reset link, order confirmation (on the paid transition only, once), custom-order acknowledgement, and business notifications. Message content is limited to stored facts — no delivery dates or policies.

Without a provider, development writes messages to `storage/dev-outbox/`; production **does not send** and logs a warning. The provider calls are unit-tested against mocked HTTP but **have not been verified with real credentials** — send a test password reset after configuring.

## 5a. Order & catalogue management (CLI)

No admin UI is designed, so business operations use a CLI against the same database:

```bash
npm run admin -- orders --status paid
```

```bash
npm run admin -- order LL-1001
```

```bash
npm run admin -- custom-orders
```

```bash
npm run admin -- custom-order CR-XXXXXX
```

```bash
npm run admin -- set-price classic-leather-bifold-wallet 62.50
```

```bash
npm run admin -- set-active handcrafted-leather-axe-sheath false
```

Price changes reprice open carts immediately; existing orders keep the prices recorded at purchase. Reference images for custom orders are listed with their private file paths.

## 6. Security controls implemented

| Area | Control |
| --- | --- |
| Authentication | scrypt (N=2^15) password hashing; constant-time verification with a dummy hash for unknown emails; generic login errors. |
| Sessions | 256-bit random tokens, stored hashed (SHA-256); HttpOnly, SameSite=Lax, Secure + `__Host-` in production; rotated on login; all sessions revoked on password reset; other sessions revoked on password change; "sign out other devices". |
| Authorization | Every protected page/API checks the session server-side. Orders are queried with `customer_id = current customer` (IDOR-safe); cart lines are mutated only `WHERE cart_id = visitor's cart`. |
| CSRF | Origin/Referer verification on every state-changing endpoint + SameSite cookies + JSON-only bodies. |
| Validation | Strict zod schemas on the server for every input (unknown keys rejected → no mass assignment); quantities bounded; prices never accepted from the client. |
| Injection / XSS | All SQL parameterised; React escaping, no `dangerouslySetInnerHTML`; nonce-based CSP with `strict-dynamic`, `frame-ancestors 'none'`, `object-src 'none'`. |
| Uploads | Max 5 files × 8 MB; type detected from magic bytes (JPEG/PNG/WebP only); server-generated names; stored outside `public/` with 0600 permissions; never served publicly. |
| Rate limiting | Per-IP buckets (login, register, reset, checkout, cart, uploads) + per-account login throttling. |
| Payments | Webhook signature verification; idempotent event processing; idempotent order creation; server-side amount from Stripe. |
| Headers | CSP, HSTS (prod), X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, COOP. |
| Errors / logging | Generic error responses; no stack traces to clients; security events logged with hashed IPs and no secrets. |
| Redirects | `?next=` restricted to same-site relative paths. |

## 7. Pre-launch checklist

- [ ] Real product photography and product information supplied (see implementation report).
- [ ] Stripe live keys + webhook configured; shipping/tax rules confirmed by the business.
- [ ] Email provider credentials set (`MAIL_PROVIDER`, `MAIL_API_KEY`, `MAIL_FROM`) and a test password reset received.
- [ ] `APP_ORIGIN`, `IP_HASH_SALT`, `TRUST_PROXY` set; persistent volume mounted and backed up.
- [ ] Policies (shipping, returns, privacy) and contact details supplied before adding footer links.
- [ ] Run `npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build`.
- [ ] Independent penetration test before taking real payments.
