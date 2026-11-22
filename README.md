# Leyte Leather — Storefront

Next.js (App Router) + React + TypeScript implementation of the approved Leyte Leather Figma designs, built on the global design system in [`docs/LEYTE_LEATHER_DESIGN_SYSTEM_README.md`](docs/LEYTE_LEATHER_DESIGN_SYSTEM_README.md).

- **Figma (visual source of truth):** https://www.figma.com/design/fW3tcPzhoTcpT9xA33R68V/Leyte-Leather
- **Extracted specs used for implementation:** [`docs/figma-specs/`](docs/figma-specs) (full layer metadata for all 22 frames + code-level specs for Home and About)
- **Implementation report, gaps and open decisions:** [`docs/IMPLEMENTATION_REPORT.md`](docs/IMPLEMENTATION_REPORT.md)
- **Persistent development checklist (resume point):** [`docs/CHECKLIST.md`](docs/CHECKLIST.md)
- **Deployment and security configuration:** [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

## Requirements

- Node.js **22.13+** (uses the built-in `node:sqlite` driver — no native build step)
- npm 10+

## Quick start

```bash
npm install
```

```bash
cp .env.example .env.local
```

Edit `.env.local` — for local development the defaults plus `PAYMENTS_MODE=development` are enough. Then:

```bash
npm run dev
```

Open http://localhost:3000. The SQLite database is created and migrated automatically in `storage/` on first request, and the verified 8-product catalogue is seeded.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on :3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |
| `npm test` | Unit + component tests (Vitest) |
| `npm run test:e2e` | End-to-end, security and accessibility tests (Playwright; starts its own server on :3100 with an isolated database) |
| `npm run smoke` | Visits every route at 390/768/1024/1280/1440 px and reports overflow / console errors (needs `npm run dev` running) |
| `npm run icons` | Regenerates the Material Symbols icon set |
| `npm run admin -- <command>` | Business CLI: list/inspect orders and custom-order requests, change prices/availability (see `docs/DEPLOYMENT.md §5a`) |

## Project structure

```
src/
  app/                    Routes (App Router). Each page folder owns its CSS module.
    api/                  Route handlers (cart, checkout, payments, auth, account, custom orders)
    account/              Overview, personal information, order history (+ detail), security
    product/[slug]/       Product detail, /personalise (Figma "Product Customiser")
    shop/ gallery/ about/ custom-orders/ cart/ checkout/ login/ register/ …
    not-found.tsx error.tsx loading.tsx   Global system states
  components/
    ui/                   Design-system primitives: Button, Field, Alert, Badge, Spinner, Skeleton, EmptyState, QuantityStepper, Icon
    layout/               AnnouncementBar, Header (+ mobile drawer), Footer
    product/              ProductCard, ProductGallery (+ lightbox), AddToCart, Breadcrumb
    sections/             Section shells, split layout, media frame, CTA band, custom-order process, value strip
    account/ auth/        Account shell + navigation, auth forms
  data/catalog.ts         Verified product reference data + image mapping (seeds the DB)
  lib/                    Shared (client + server): validation schemas (zod), formatting, shop filtering, types
  server/                 Server-only: db + migrations, auth/sessions, cart, orders, payments, uploads, mail, security
  styles/tokens.css       Design tokens copied verbatim from the design-system README §13
docs/                     Design system README, Figma specs/reference renders, report, deployment
tests/unit, tests/e2e     Vitest and Playwright suites
```

## Design-system rules in code

- All colours, spacing, radii, shadows, motion and type sizes come from `src/styles/tokens.css` (README §13). Components never hard-code a new colour.
- Typography: Cormorant Garamond (display) + DM Sans (UI), self-hosted via `@fontsource`.
- Breakpoints: 640 / 900 / 1200 px. Figma frames are 390 (mobile) and 1280 (desktop); type interpolates between them.
- Shared components are used on every page — the header, footer, buttons, cards and form fields exist exactly once.

## Data and integrity

The catalogue contains only verified information (name, CAD price, category grouping, personalisation availability). Materials, dimensions, care, shipping, returns, reviews and stock are **not** shown because they have not been supplied — see `docs/IMPLEMENTATION_REPORT.md`.
# Leyte-Lether
