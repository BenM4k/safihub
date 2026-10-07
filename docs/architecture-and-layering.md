# Architecture & Layering Guide

This document describes SafiHub's core architectural patterns, execution boundaries, order validation engine, background processing, and caching hierarchy.

---

## 1. Request Flow & Three-Tier Layering

SafiHub strictly enforces a unidirectional three-tier layering architecture:

```text
Server Action (or API Route Handler)
  │  • Validates input schema via Zod (`src/lib/validations/`)
  │  • Authenticates user session & checks authorization role
  ▼
Service Layer (`src/services/`)
  │  • Implements core business logic, domain rules, and orchestration
  │  • Enforces price calculations, opening-hours arithmetic, and distance limits
  │  • Coordinates DAL queries, file storage, and notification dispatch
  ▼
Data Access Layer (DAL) (`src/dal/`)
     • Exclusively executes Drizzle ORM queries and database mutations
     • Isolates PostgreSQL/table specifics from business logic
```

### Critical Rules
- **No Layer Skipping:** Route handlers and server actions never import the Drizzle database client or execute SQL directly; they must call into `src/services/`. The service layer never writes raw SQL queries or calls `db` directly; it must call into `src/dal/`.
- **Interchangeable Entry Points:** Server Actions (`"use server"`) and API route handlers (`route.ts`) are interchangeable entry points into the service layer. Choose whichever fits the caller, but keep all business logic strictly inside services.
- **Validation Boundary:** All input validation (via Zod schemas in `src/lib/validations/`) and authentication checks occur at the server action or route handler boundary before invoking the service layer. Services trust their arguments.
- **Customer Privacy Firewall:** DAL functions returning order details to house staff must select a restricted projection that omits customer phone numbers and street landmarks.

---

## 2. The Ok-Err Result Pattern

SafiHub standardizes on the **ok-err** pattern for handling operational errors across execution boundaries:

```ts
// src/lib/result.ts
export type Result<T, E = string> = 
  | { ok: true; value: T } 
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E = string>(error: E): Result<never, E> {
  return { ok: false, error };
}
```

### Conventions
- **Action & Route Boundary:** Every server action and route handler must return an `ok-err` shape instead of throwing uncaught exceptions to the caller.
- **No Competing Conventions:** Do not introduce secondary exception mechanisms (such as throwing custom `AppError` exceptions across server action boundaries).
- **Client Handling:** Client components calling server actions must explicitly check `result.ok` before accessing `result.value`:
  ```ts
  const res = await createOrderAction(checkoutData);
  if (!res.ok) {
    toast.error(res.error);
    return;
  }
  // Safe to navigate to tracking page with res.value.orderId
  ```
- **Internal Service Handling:** Services and DAL functions may return `Result` types or throw internal errors; however, the entry point (action or route handler) must catch and normalize any error into the standard `Result` response.

---

## 3. Single Canonical Order Validation Engine

The cart in SafiHub behaves like an e-commerce basket where the client sends only identifiers (neighborhood, house, items, quantities, pickup slot). The client's submitted prices or delivery fees are **never trusted**.

### Shared Validation Engine (`src/services/order/validation.ts`)

A single, canonical validation function powers all order creation channels:
1. Customer web app checkout (`/checkout`)
2. Admin manual order entry for WhatsApp/phone orders (`/admin/orders/new`)
3. Future WhatsApp Business Bot

```text
Incoming Payload: { customerId, houseId, neighborhoodId, pickupSlot, items: [{ serviceId, itemId, fabricId, quantity }] }
                      │
                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      validateOrderPlacement()                          │
│                                                                        │
│  1. House Active & Open: Check isOpen, not closed for holiday/outage   │
│  2. Slot Validity: Fits house hours, courier shifts, and cut-off delay │
│  3. House Capacity: Slot orders < house daily capacity                 │
│  4. Coverage Check: Neighborhood is served & covered by house          │
│  5. Distance Level: Zone fee exists and distance <= house limit        │
│  6. Master Items: Verify items/fabrics/services are active in catalog  │
│  7. Exclusions Check: Verify no items fall under house exclusions      │
│  8. Live Price Recalculation: Lookup DB prices from `house_items`       │
│  9. Minimum Order: Sum(item prices) >= house.minOrderAmount            │
│ 10. Delivery Fee Matrix: Lookup zone fee from `zone_fees`              │
│ 11. Freeze Commission: Read house default commission %                 │
└────────────────────────────────────────────────────────────────────────┘
                      │
                      ▼
       { ok: true, validatedOrder } | { ok: false, error }
```

### Price Change Detection
If a laundry house changed an item price between when the customer added it to the cart and when checkout was submitted, the server rejects the checkout with `{ ok: false, error: "PRICE_CHANGED", updatedPrices: [...] }`. The UI prompts the customer with the new price for confirmation before proceeding.

---

## 4. Idempotency Everywhere

Mobile networks in Bukavu (Airtel, Vodacom, Orange) can experience packet loss or high latency, causing users to tap buttons multiple times or clients to retry network requests.

### 1. Checkout Idempotency (`orders.idempotency_key`)
- The client generates a unique UUID when entering checkout.
- The server performs an atomic insert with a unique constraint on `(customer_id, idempotency_key)`.
- If an order with that key already exists:
  - If already created, return the existing order tracking information `{ ok: true, value: existingOrder }`.
  - Prevent duplicate creation and double-billing.

### 2. Courier Offline Action IDs
- When a courier operates offline, each mission action (e.g. pickup count, condition photo upload, cash collection) generates a local `clientMutationId`.
- On reconnection, the sync engine checks whether the mutation was already applied in `order_events`, ensuring exactly-once application.

---

## 5. Background Queue & Async Processing (Inngest)

Background jobs in SafiHub are orchestrated with **Inngest v4** (`src/inngest/`), exposed via `/api/inngest`.

### Core Rules
- **Zero Request-Path Blocking:** External operations (SMS delivery, push notifications, expiry calculations) must never block customer checkout or courier transitions.
- **Opening-Hours Aware Delayed Steps:** 
  - When an order transitions to `created`, Inngest schedules a delayed event:
    - At 50% of the acceptance delay (default ~22m): trigger house push reminder.
    - At 75% of the acceptance delay (default ~34m): trigger admin dispatch alert.
    - At 100% of the acceptance delay (default 45m): if still `created`, transition order to `expired` and notify customer.
  - When an order transitions to `received`, Inngest schedules a delayed job for 1 hour (opening hours). If no discrepancy is reported, transition order to conforming (`washing`).
- **Periodic System Crons:**
  - Regular task checking for late courier pickups or delayed deliveries.
  - Daily cleanup of expired presigned URLs and temporary files.
- **Local Dev Mode:** Ensure `INNGEST_DEV=1` is set in local development to run without production signing keys.

---

## 6. Cache Components & Revalidation Tag Hierarchy

SafiHub uses Next.js 16.3+ Cache Components with `"use cache"` and fine-grained cache tags:

- **Centralized Tags (`src/lib/cache-tags.ts`):**
  - `catalog:items`: Master items, fabrics, and services list.
  - `coverage:zones`: Geographic zones, neighborhoods, and service statuses.
  - `houses:list`: Active laundry houses and coverage listings.
  - `house:<houseId>`: Specific house profile, prices, opening hours, and exclusions.
  - `order:<orderId>`: Single order tracking data and timeline.
  - `courier:missions:<courierId>`: Active mission list for a courier.
  - `admin:dispatch`: Admin dispatch board and courier shift statuses.
  - `admin:cash`: Daily cash reconciliation records.
- **Cached Fetchers (`src/lib/cached-data.ts`):** Top-level functions annotated with `"use cache"` and `cacheTag(...)`.
- **Targeted Mutations:** Server actions use `revalidateTag(tag, "max")` to invalidate only the affected entities without busting entire route trees or using deprecated `revalidatePath`.
