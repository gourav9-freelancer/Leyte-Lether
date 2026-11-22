# Leyte Leather — development checklist (persistent)

Resume point for any session. Update the status column as work lands. Legend: ✅ done · 🔧 in progress · ⬜ to do · ⛔ blocked (reason given).

Checkpoint before this list: commit `8f92780` — 23/23 unit, 46/46 e2e, typecheck, lint, build, audit all passing.

## Remaining work (identified 2026-11-22 by comparing routes with the Figma metadata in `docs/figma-specs/`)

| # | Area | Task | Figma ref | Status |
|---|------|------|-----------|--------|
| 1 | Account | Mobile account navigation: horizontal scrolling row of section links + divider + full-width Sign Out (currently reuses the vertical desktop sidebar) | 3:172, 1:3963 | ✅ |
| 2 | Personal information | Read-only details card (First name / Last name / Email / Phone, "Not yet provided") with "Edit details" → edit state, saving, error, success, cancel | 3:63, 3:201 | ✅ |
| 3 | Order history | Card refinements: status badge with icon, quantity + detail lines, footer status sentence, full-width "View order details" on mobile | 1:3775, 1:4015 | ✅ |
| 4 | Loading states | Route-level loading for account overview, personal information, order list, security (without wrapping routes that must return HTTP 404) | Loading States §C/E | ✅ |
| 5 | Auth | Signed-out confirmation on the sign-in page after Sign Out | — (prompt §7 "Logout confirmation") | ✅ |
| 6 | Email | Provider boundary (Resend / Postmark via HTTPS, env-configured); order-confirmation and custom-order acknowledgement emails. Real delivery unverifiable without credentials | — | ✅ |
| 7 | Order management | Business-side tooling to list/inspect orders and custom-order requests (CLI; no admin UI is designed) | — | ✅ |
| 8 | Docs | Update implementation report + this checklist; commit milestone | — | ✅ |
| 9 | Security | Forms POST-only + submit disabled until hydrated (found: pre-hydration submit put the password in the URL) | — | ✅ |
| 10 | UI | Icons squeezed to zero width inside narrow flex buttons (global svg rule) | — | ✅ |
| 11 | A11y | Disabled button text contrast raised to ≥ 4.5:1 | — | ✅ |
| 12 | States | Shared `ErrorState` card; Network Offline vs General Error; Product Unavailable (hidden products, noindex); Order History Error; account error boundary; root `global-error.tsx` | Global System States Part C | ✅ |
| 13 | Cart | Reads no longer silently delete unavailable items (header count did); removal only on the cart page with a named notice; checkout blocked with notice | — | ✅ |
| 14 | Layout | Footer pinned to viewport bottom on short pages | — | ✅ |
| 15 | Gallery (mobile) | Custom-order discovery without image + full-width CTA; 32px intro spacing | 1:2807, 1:2662 | ✅ |
| 16 | Shop (mobile) | Control order search → tabs → filters/sort → count → grid on 20px rhythm; Body S intro copy | 1:1464, 1:1456 | ✅ |
| 17 | Customiser (mobile) | Description under price; single-line truncating breadcrumb (all product pages); sticky-bar price never wraps | 1:1894, 1:1883, 1:1989 | ✅ |
| 19 | Payments | Stripe webhook verified with locally signed events: bad/missing signature, paid transition with Stripe amounts, cart cleared, replay ignored, forged session rejected, async failure | — | ✅ |
| 20 | Orders | Idempotent order creation + empty/unavailable cart refusal unit-tested; "review your cart" now takes precedence over "empty cart" (API + checkout page) | — | ✅ |
| 21 | Auth / A11y | E2E: full password-reset journey via dev outbox (single-use link, sessions revoked, old password rejected); keyboard: skip link, drawer focus trap + Escape + focus return, gallery viewer arrow keys | — | ✅ |
| 18 | Responsive QA | Signed-in account, order detail, cart and checkout checked at 390/768/1024/1280 — no overflow (`scripts/capture-account.mjs`) | — | ✅ |

## Blocked / needs verification later

| Item | Reason |
|------|--------|
| Shop/Gallery category tab labels (6 tabs in Figma) | Text layers unnamed; needs Figma access beyond Starter MCP limit |
| Per-element visual specs for Shop, Customiser, Cart, Gallery, Account, Orders, Personal info, States | Figma MCP Starter-plan limit |
| Live Stripe payments | Webhook settlement verified with locally signed events; Checkout Session creation (outbound API call) still needs Stripe test keys |
| Real email delivery | No provider credentials |
| Real product photography and specifications | Not supplied by the business |

## Milestone log

| Date | Commit | Verified |
|------|--------|----------|
| 2026-11-21 | `8f92780` initial implementation | 23 unit · 46 e2e · build · audit |
| 2026-11-22 | milestone 2 (account mobile nav, personal info states, order cards, account loading, sign-out notice, email providers, admin CLI, form hardening) | 27 unit · 47 e2e · typecheck · lint · smoke 85/85 |
| 2026-11-22 | milestone 3 (error-state variants, product unavailable, non-destructive cart reads, sticky footer) | 27 unit · 49 e2e · typecheck · lint · smoke 85/85 |
| 2026-11-22 | milestone 4 (gallery/shop/customiser mobile compositions, breadcrumb, signed-in responsive QA) | 27 unit · 49 e2e · typecheck · lint · build |
| 2026-11-22 | milestone 5 (Stripe webhook verification, order-creation tests, unavailable-only cart UX) | 33 unit · 49 e2e · typecheck · lint |
| 2026-11-22 | milestone 6 (password-reset journey + keyboard e2e) | 33 unit · 53 e2e |

## Known remaining visual differences (need Figma access to resolve)

- Shop mobile cards: "Personalisation available" badge wraps to two lines in 167px cards; Figma fits one line (exact badge spec unknown).
- Customiser mobile: Figma's pending-configuration notice copy is shorter (4 lines) than the desktop copy reused here (text layer unreadable).
- Customiser mobile page is taller than the frame by the 73px spacer that keeps the sticky bar from covering the footer (Figma overlays it).

## Next candidates (not started)

- Cart "Edit configuration" currently opens the customiser, which adds a new line. Once real options exist, make it update the existing line (`?line=<id>` → PATCH config). Today no configurable options exist, so there is nothing to edit.
- Guest order access after leaving the confirmation page: the confirmation email has no order-status link (plain access tokens are not stored). Decide with the business whether guests need one.

- Gallery/Shop category labels and per-frame visual pass — waiting on Figma access.
- Verify Resend/Postmark delivery once credentials exist (send a password reset).
- Verify Stripe Checkout + webhook in Stripe test mode once keys exist (`stripe listen --forward-to localhost:3000/api/payments/stripe/webhook`).
