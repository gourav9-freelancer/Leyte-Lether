# Leyte Leather — Implementation report

Status as of the first full implementation pass. Everything below was checked against the running app; anything not verified says so.

## 1. Figma access — what was and was not inspected

| Inspected | Detail |
| --- | --- |
| Full layer metadata, all 22 frames | Every node's name, position, size and text layer name (`docs/figma-specs/metadata-all-frames.xml`, outline in `frame-outline.txt`). |
| Code-level design context (exact fonts, colours, padding, gaps, radii) | Homepage desktop + mobile, About desktop + mobile, the shared header (`docs/figma-specs/*.min.txt`). |
| Rendered references | Homepage, Customiser, Cart, My Account, Global System States (desktop) — `docs/figma-reference/`. |
| Image assets | 23 unique full-resolution photographs downloaded from the file and mapped to their Figma slots. |

**Limitation:** the connected Figma account is on the **Starter plan**, and Figma's MCP call limit was reached mid-inspection. Shop, Customiser, Cart, Gallery, Account, Order History, Personal Information, System States and Loading frames were therefore built from their **exact layer geometry + text** (metadata) and the README tokens, not from per-element code context. Text layers literally named "Text" (e.g. Shop category tab labels) could not be read. Re-running a visual pass on those frames needs a Figma seat with a higher MCP allowance.

The Figma file contains **no components and no variables** (it is a flattened HTML/Stitch import). The component library was derived from repeated patterns and the README.

## 2. Pages

| Route | Figma frame | Status |
| --- | --- | --- |
| `/` | Homepage D/M | Implemented from full spec |
| `/about` | About Us D/M | Implemented from full spec |
| `/shop` | Shop All Products D/M | Implemented (metadata) — search, category tabs, filter drawer, sort, URL-persisted state, no-results |
| `/product/[slug]/personalise` | Product Customiser D/M | Implemented (metadata + render), pending-option states as designed, sticky mobile bar |
| `/cart` | Shopping Cart D/M | Implemented (metadata + render), sticky mobile checkout bar, undo removal |
| `/gallery` | Gallery D/M | Implemented (metadata), editorial grid rhythm, filters, lightbox viewer |
| `/login` | My Account (sign-in state) | Implemented (metadata + render) |
| `/account` | My Account (overview state) | Implemented (metadata + render) |
| `/account/orders` | Order History D/M | Implemented (metadata) with real data: status tabs, search, status badge with icon, qty/detail lines, status sentence, mobile total row + full-width action, empty/no-match states, loading skeleton |
| `/account/personal-information` | Personal Information D/M | Implemented (metadata): read-only details card → Edit state → saving / error / session-expired / success, cancel restores values, loading skeleton |
| Account navigation (mobile) | 3:172 / 1:3963 | Horizontal scrolling section row + divider + Sign Out, active item kept in view |
| 404 / errors / skeletons / empty / spinners | Global System States + Loading States | Implemented as real states (not a showcase page): 404, General Error, Network Offline, Product Unavailable, Order History Error, Session Expired, account/root error boundaries, cart/catalogue/account skeletons, spinners, empty states |
| `/product/[slug]` | **Not designed** | Composed from the Customiser layout and shared components |
| `/custom-orders` | **Not designed** | Composed per README §11 from shared components |
| `/checkout`, confirmation, failure | **Not designed** | Composed from the Cart layout |
| `/register`, `/forgot-password`, `/reset-password` | **Not designed** | Composed from the sign-in card |
| `/account/security`, `/account/orders/[n]` | **Not designed** | Composed from account panels |
| Mobile nav drawer, filter sheet, lightbox, add-to-cart confirmation | **Not designed (open states)** | Composed from tokens |
| Tablet layouts (640–899 px) | **Not designed** | Adapted from the README grid rules |

## 3. Decisions taken where the Figma file and README disagree

1. **UI font:** the Homepage desktop frame uses *Jost*; every other frame and the README use **DM Sans** → DM Sans everywhere (per README and the brief). Line breaks on the homepage therefore differ slightly from the Jost render.
2. **Mobile image placeholders:** mobile frames show grey "Product photo" boxes where desktop frames show photos → the same real photos are used on mobile (README §7: never publish placeholders).
3. **Shop category tabs:** the six tab labels are unreadable text layers → the three verified category groupings from the approved homepage copy are used (All / Everyday Essentials / Personalised Gear / Lifestyle and Outdoor). **Needs confirmation.**
4. **Wallet card image:** the approved homepage places a leather *bag* photo on the "Classic Leather Bifold Wallet" card; the About page uses an actual wallet photo. Both are implemented as designed; the product page gallery uses the wallet photo. **Needs confirmation.**
5. **Title Case labels** (e.g. "Custom Orders", "Account Overview") are kept where the approved Figma uses them; new screens use sentence case per README.

## 4. Content & business information still required

- **Product photography:** the supplied images appear to be AI-generated (embossed fake logos, garbled sign text). README §7 forbids AI approximations of products — real photographs are needed. The Customiser's "GS" monogram images could not be downloaded before the Figma limit.
- **Product details:** materials, dimensions, care, lead times — product pages show a "pending confirmation" notice instead of inventing them.
- **Personalisation options** (leather colours, thread, hardware, sizing, text rules, fees) — the configurator schema only accepts confirmed fields.
- **Shipping regions/rates, tax handling, returns policy, contact details, social links.**
- **Payment provider credentials** (Stripe recommended), **email provider**, hosting.

## 5. Verification results (actual runs)

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm test` (Vitest — validation, filters, redirects, password hashing, upload sniffing, config keys, components) | **23 / 23 pass** |
| `npm run test:e2e` (Playwright — desktop 1280 + Pixel 7) | **46 / 46 pass** |
| `npm run build` (production) | Pass |
| `npm audit --omit=dev` | 0 vulnerabilities (PostCSS pinned via `overrides`) |
| Route smoke test on the production build: 17 routes × 390/768/1024/1280/1440 px | **85 / 85** — no horizontal overflow, no console/CSP errors, correct redirects and 404 |
| axe-core WCAG 2.2 AA (serious + critical) on 11 pages, desktop + mobile | 0 violations (2 real issues found and fixed: cart link label-in-name, unlabelled file input) |

### Visual QA (`docs/visual-qa/`, page height vs Figma frame — refreshed after milestone 4)

| Page | 1280 desktop | 390 mobile |
| --- | --- | --- |
| Homepage | +0.9 % | +1.2 % |
| About | −0.1 % | +3.0 % |
| Shop | +1.9 % | +4.8 % |
| Customiser | +3.7 % | +8.1 % (73px sticky-bar spacer + longer notice copy) |
| Cart | +1.3 % | +0.7 % |
| Gallery | +0.9 % | +2.0 % |

Screenshots of every page at 390/768/1024/1280/1440 are in `docs/visual-qa/`. Side-by-side checks were made against the Figma renders for Homepage and Customiser (near-identical composition). Remaining differences come from DM Sans vs Jost line wrapping, real photos placed where mobile frames had placeholders, and screens that could only be built from metadata. **This is close visual fidelity, not a verified pixel-perfect match** — a pixel-diff pass needs per-frame Figma exports, which the Starter-plan limit prevented.

### End-to-end coverage

Shop filtering/search/sort/persistence/no-results · mobile drawer and filter sheet · product 404 · cart add/quantity/separate configurations/remove/undo/subtotal · checkout failure (cart kept) and success (cart cleared, paid order in history) · duplicate checkout submission → one order · sign-in redirect and return · generic login errors · one active account section per route · profile validation/save/persist · stored XSS rendered as text · password change revokes other sessions ("session expired" state) · enumeration-safe forgot password · IDOR (other customer's order → 404) · CSRF rejection · client price/unknown fields rejected · personalisation refused for non-personalisable products · malicious upload rejected by content · upload count cap · per-account login throttling · CSP/security headers · HttpOnly/SameSite session cookie · open-redirect protection · custom-order submission with upload progress.

### Milestone 2 (2026-11-22)

- 27/27 unit tests (4 new: Resend/Postmark request format, header-injection stripping, provider failure, no fake send in production).
- 47/47 e2e tests (new: read-only → edit → save → cancel on Personal Information, signed-out confirmation, order-confirmation email produced on payment, forms cannot submit before hydration).
- Smoke 85/85 (17 routes × 5 widths), typecheck, lint.
- **Security fix found by the suite:** submitting a sign-in form before hydration used the browser's default GET and put the password in the URL. All forms are now `method="post"` and keep submit disabled until hydrated; covered by a JavaScript-disabled regression test.

## 6. Security review summary

Controls are listed in `docs/DEPLOYMENT.md §6`. Residual risks, honestly stated:

- **Email delivery unverified:** Resend/Postmark integrations exist (`MAIL_PROVIDER`), unit-tested with mocked HTTP only. Until credentials are set, production does not send (password reset unusable) and never pretends to.
- **Stripe partly verified:** the webhook route (the only proof of payment) is unit-tested with Stripe-signed test events — signature rejection, paid transition using Stripe amounts, cart clearing, replay protection, forged-session rejection, async failure. Creating a Checkout Session (outbound call to Stripe) still needs Stripe test keys to verify.
- **SQLite + local disk:** fine for a single server with a persistent volume; it does not scale horizontally. Migrate `src/server/*` to Postgres for multi-instance hosting.
- **Rate limiting is per-instance and fixed-window.** Behind a CDN, set `TRUST_PROXY=1` or every visitor shares one bucket.
- **CSP allows inline styles** (`style-src 'unsafe-inline'`), needed for dynamic style values. Scripts are nonce-locked.
- **`node:sqlite` is marked experimental** in Node 22 (stable API, prints a warning).
- No independent penetration test has been performed. One is recommended before taking real payments.

## 7. Commands

```bash
npm install
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

```bash
npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build
```
