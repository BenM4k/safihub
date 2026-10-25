# SafiHub — Engineering & Operations

> **Confidential & Proprietary** — Internal codebase for the SafiHub laundry and dry-cleaning marketplace in Bukavu, DRC.

---

## 📌 Platform Overview

**SafiHub** is an on-demand logistics and laundry marketplace connecting households and businesses in Bukavu with vetted neighborhood laundry houses (*pressings*). A coordinated motorcycle courier fleet handles door-to-door laundry collection, on-site counts, and cash-on-delivery drop-off.

Optimized mobile-first for low-end Android hardware operating over 3G cellular networks.

---

## 👥 Core Workspaces

| Workspace | Route | Responsibility |
| :--- | :--- | :--- |
| **Customer Storefront** | `/`, `/houses`, `/checkout` | Neighborhood coverage, service catalog, 2-hour pickup windows, public tracking. |
| **Partner Portal** | `/partner/[houseSlug]` | Operating hours, load capacity, 3-point count reception, commission ledger. |
| **Courier PWA** | `/courier` | Pickup/delivery missions, on-site custody counts, R2 proof photos, cash ceiling locks. |
| **Operations Console** | `/admin` | Fleet dispatch, partner vetting, manual phone/WhatsApp orders, cash reconciliation. |

---

## 🛠️ Technology Stack

- **Application:** Next.js 16 (App Router, Server Actions), React 19, TypeScript (`strict: true`)
- **Styling & UI:** Tailwind CSS v4, custom token system, shadcn/ui primitives
- **Database & DAL:** PostgreSQL on Neon, Drizzle ORM (strictly isolated in `src/dal/`)
- **Authentication & RBAC:** Better Auth (Customer, Courier, House Staff, Admin)
- **Background Jobs:** Inngest (order timers, auto-conforming, dispatch automation)
- **Object Storage:** Cloudflare R2 (client-compressed WebP photos uploaded via presigned URLs)
- **Localization:** `next-intl` (French, English, Swahili with 100% key parity)

---

## 💻 Developer Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Configuration

```bash
cp .env.example .env.local
```

Ensure the following credentials are configured in `.env.local`:
- `DATABASE_URL` / `DATABASE_URL_POOLED` (Neon PostgreSQL)
- `BETTER_AUTH_SECRET` (32+ character random secret)
- `BETTER_AUTH_URL` (`http://localhost:3000`)
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT` (Cloudflare R2)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (Rate limiting)

### 3. Database Migration & Seed

```bash
# Run pending Drizzle migrations
pnpm db:migrate

# Seed Bukavu zones, initial laundry houses, and services
pnpm db:seed
```

### 4. Start Local Environment

```bash
pnpm dev
```

The app is served at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Quality Gates & CI

Run all checks locally before opening pull requests:

```bash
pnpm tsc --noEmit    # TypeScript type check (zero errors)
pnpm lint            # ESLint static analysis
pnpm test            # Vitest test suite (660+ tests)
```

---

## 📖 Subsystem Specifications

Detailed engineering and domain documentation is maintained in [`docs/`](./docs):

- [Product Specification (`docs/product-spec.md`)](./docs/product-spec.md) — Master product spec, Bukavu context, unit economics.
- [Architecture & Layering (`docs/architecture-and-layering.md`)](./docs/architecture-and-layering.md) — Three-tier boundaries, `Result` types, Inngest jobs.
- [Database & Models (`docs/database-and-models.md`)](./docs/database-and-models.md) — Drizzle relational schemas, DAL isolation, integer currency.
- [Order Lifecycle Engine (`docs/order-engine-and-lifecycle.md`)](./docs/order-engine-and-lifecycle.md) — State machine transitions, opening-hours timers.
- [Cash Ledger & Settlements (`docs/cash-ledger-and-settlements.md`)](./docs/cash-ledger-and-settlements.md) — COD tracking, courier ceilings, daily settlements.
- [Admin Runbook (`docs/admin-runbook.md`)](./docs/admin-runbook.md) — Internal operations, cash reconciliation, partner onboarding.

---

## 🔒 Confidentiality & Terms

Copyright © SafiHub. All rights reserved.  
This source code is confidential, proprietary, and intended solely for authorized SafiHub engineering and operations personnel. Unauthorized copying, distribution, or disclosure is strictly prohibited.
