# SafiHub

> On-demand laundry & dry-cleaning marketplace in **Bukavu, DRC**.

---

## 1. Domain Overview

- **Model:** Customer selects nearby laundry house $\rightarrow$ courier collects laundry $\rightarrow$ house cleans it $\rightarrow$ courier delivers it back clean.
- **Actors:**
  - `Customer`: Orders laundry, tracks status, approves price adjustments, pays cash on delivery.
  - `Laundry House`: Sets prices per item/fabric/service, opening hours & capacity, confirms reception count, cleans laundry.
  - `Courier`: Executes pickup and delivery missions, counts items on-site, captures condition/proof photos, collects cash, syncs offline.
  - `Admin`: Dispatches missions, manages catalogue/coverage/fees, enters manual phone/WhatsApp orders, reconciles daily cash, settles houses.
- **Currency:** Congolese Francs (**CDF**) integer minor units. USD accepted at an admin-set rate frozen at order creation.

---

## 2. Locked-In Domain Invariants

These domain rules govern all business logic in SafiHub and must never be violated:

1. **Single Canonical Order Validation:** The server recalculates all item prices from `house_items`, delivery fees from `zone_fees`, and commissions from `houses`. Client numbers are never trusted. The same validation function (`src/services/order/validation.ts`) powers customer checkout, admin manual order entry, and future bots.
2. **Idempotency Everywhere:** Checkout submissions require client-minted UUIDs in `orders.idempotency_key` to prevent duplicate orders on unstable 3G networks. Courier offline sync uses client mutation IDs.
3. **Strict Customer Privacy Firewall:** House queries must use restricted projections that **never** include customer phone numbers or street landmarks (first name and neighborhood only). Couriers only see phone/landmarks during active assigned missions.
4. **Opening-Hours Aware Timers:** The 45-minute house acceptance deadline and 1-hour reception conforming window **only tick during house opening hours** (timers pause overnight/closures).
5. **Three-Point Item Count & Approvals:**
   - Declaration (customer) $\rightarrow$ Pickup count (courier + customer) $\rightarrow$ Reception count (house).
   - Count/fabric gaps trigger price adjustments that require explicit customer approval before washing begins.
   - Non-accepted/excluded items are marked `returned`, deducted from total (no cleaning fee), and returned with delivery.
6. **Append-Only Cash Ledger & Courier Ceilings:** Cash on delivery is recorded in `cash_ledger`. Couriers holding unremitted cash above their `cashCeiling` are locked from accepting new delivery missions until settled with admin.
7. **Direct Client Storage (Cloudflare R2):** Condition and delivery photos upload directly from client devices via short-lived presigned URLs (zero server streaming). Photos are compressed on-device (< 1280px, WebP < 300KB).
8. **Courier Offline First:** Courier mission execution (counts, photos, cash) must function offline (Zustand + IndexedDB) and replay safely on reconnection.

---

## 3. High-Level Architecture

```text
src/
  app/          # Next.js App Router (thin routes, server components, role layouts)
    (auth)/     # Login, register, forgot-password
    (customer)/ # Landing, houses, cart, checkout, orders, public /track/[token]
    house/      # Partner portal (role guard): orders, catalogue, hours, coverage, settlements
    courier/    # Courier PWA (role guard): active missions, cash held, offline sync
    admin/      # Operations console (admin guard): dispatch, manual entry, cash, settlements
    api/        # auth/[...all], inngest, storage presigned URLs
  components/   # React components (<= 150-200 lines): ui/ (shadcn), customer/, house/, courier/, admin/
  actions/      # Server actions (Zod validation + auth check -> calls services)
  services/     # Pure business logic & orchestration (order, pricing, coverage, cash, storage, auth)
  dal/          # Data Access Layer (THE ONLY layer importing Drizzle / db)
  inngest/      # Background jobs: acceptance timer, auto-conforming reception, reminders
  lib/          # Result (ok/err), cache tags ("use cache"), validations, Bukavu date/currency utils
  styles/       # Tailwind v4 design system: tokens, base, layout/controls/surfaces utilities
```

---

## 4. Subsystem Documentation Index

For exhaustive schemas, state transitions, algorithms, and workflows, consult [`docs/`](./docs/):

| Topic                         | Document                                                                       | Contents                                                                                                  |
| :---------------------------- | :----------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **Product Specification**     | [`docs/product-spec.md`](./docs/product-spec.md)                               | Complete master product spec (v9.6), Bukavu context, unit economics, actor definitions.                   |
| **Architecture & Layering**   | [`docs/architecture-and-layering.md`](./docs/architecture-and-layering.md)     | Three-tier layering, `Result` types, shared validation engine, Inngest jobs, Cache Components.            |
| **Database & Models**         | [`docs/database-and-models.md`](./docs/database-and-models.md)                 | Drizzle schemas (28 tables), strict DAL isolation, integer currency minor units, migrations.              |
| **Auth & Security**           | [`docs/auth-and-security.md`](./docs/auth-and-security.md)                     | better-auth setup, 4 roles, customer privacy firewall, guest tokens, delivery verification code.          |
| **Order Engine & Lifecycle**  | [`docs/order-engine-and-lifecycle.md`](./docs/order-engine-and-lifecycle.md)   | State machine, transitions matrix, opening-hours timers, 3-point count, price adjustments.                |
| **Coverage & Zones**          | [`docs/coverage-and-zones.md`](./docs/coverage-and-zones.md)                   | 3-level coverage model, zone fee matrix, distance level caps, demand requests backlog.                    |
| **Cash Ledger & Settlements** | [`docs/cash-ledger-and-settlements.md`](./docs/cash-ledger-and-settlements.md) | Cash on delivery, append-only `cash_ledger`, courier ceiling lockouts, daily reconciliation, settlements. |
| **File Storage & Photos**     | [`docs/file-storage-and-photos.md`](./docs/file-storage-and-photos.md)         | Cloudflare R2 presigned URLs, client compression (< 300KB), 90-day retention, offline queue.              |
| **UI & Frontend**             | [`docs/ui-and-frontend.md`](./docs/ui-and-frontend.md)                         | Mobile-first 360px design, shadcn/ui mandate, Server vs Client leaves, courier PWA, bilingual next-intl.  |
| **Testing & Troubleshooting** | [`docs/testing-and-troubleshooting.md`](./docs/testing-and-troubleshooting.md) | Test runner commands (`NODE_OPTIONS='--conditions=react-server'`), quality gates, 16 gotchas & traps.     |
