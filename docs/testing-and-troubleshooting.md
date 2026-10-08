# Testing & Troubleshooting Guide

This document covers SafiHub's testing infrastructure, execution commands, acceptance criteria test scenarios, quality gates, and 16 known architectural traps and gotchas.

---

## 1. Testing Infrastructure & Quality Gates

SafiHub uses **Vitest** for unit and integration testing, centralized under `src/test/`:

- **Unit Tests (`src/test/unit/`):** Fast, isolated tests mocking external calls (e.g. `order-validation.unit.test.ts`, `opening-hours.unit.test.ts`, `cash-ceiling.unit.test.ts`, `delivery-fees.unit.test.ts`).
- **Integration Tests (`src/test/integration/`):** Database-backed and multi-service flows (`*.integration.test.ts`).

### Vitest Runner Commands

Run tests using Vitest:

```bash
# Run all tests once
pnpm vitest run

# Run tests in interactive watch mode
pnpm vitest

# Run targeted test file
pnpm vitest run src/test/unit/order-validation.unit.test.ts

# Run with coverage report
pnpm vitest run --coverage
```

### Server-Only Resolution in Vitest
Modules that import `server-only` (such as `order.service.ts` or `auth.ts`) require React server conditions. Configure Vitest (`vitest.config.ts`) with `resolve.conditions: ['react-server']` or provide `NODE_OPTIONS='--conditions=react-server'`:

```bash
NODE_OPTIONS='--conditions=react-server' pnpm vitest run
```

### Pre-Commit Quality Gates
Before considering any task or PR complete, run:
1. **Typecheck:** `pnpm tsc --noEmit`
2. **Lint:** `pnpm lint`
3. **Tests (Vitest):** `pnpm vitest run` (or targeted test suite for touched code)

---

## 2. Acceptance Criteria Verification Scenarios

Each acceptance criterion from the product specification is mapped to an automated or manual verification test:

### Checkout & Validation
1. **Outside Opening Hours:** Given a slot outside the house's operating hours, when the customer submits checkout, the server refuses it and returns the next available open slot.
2. **Price Changed Mid-Cart:** Given an item price changed after it was added to the cart, when the customer submits checkout, the server rejects with `PRICE_CHANGED` and prompts for confirmation with updated prices.
3. **Double Submission:** Given the same checkout submitted twice with identical `idempotencyKey`, exactly one order record is created in `orders`.
4. **Below Minimum Order:** Given a cart item total below `house.minOrderAmount`, checkout is refused and the missing amount is displayed.
5. **Capacity Exceeded:** Given a house's daily order capacity is reached, that slot is omitted from available selections.

### Acceptance & Expiry
6. **Opening-Hours Timer Expiry:** Given an order waiting for acceptance, the house is reminded at 50% of the delay, the admin is alerted at 75%, and the order transitions to `expired` at 100% of open-hours time, preserving the cart.
7. **On-Behalf Actions:** Given an unreachable house, when the admin accepts on its behalf, `order_events` records `onBehalfOf: houseId`.

### Pickup & Reception
8. **Count Discrepancy Gate:** Given a courier pickup count differing from declared items, a price adjustment is generated and the order cannot transition to `washing` until the customer approves.
9. **Mandatory Condition Photos:** Given an item flagged valuable or damaged, the courier cannot complete the pickup mission without attaching at least one condition photo.
10. **Excluded Items Return:** Given an item the house does not treat, it is marked `returned`, removed from the order total with zero cleaning fee, and scheduled for return delivery.
11. **Auto-Conforming Reception:** Given 1 hour of opening-hours time after reception with no reported discrepancy, Inngest automatically transitions the order to conforming (`washing`).

### Delivery & Cash
12. **Cash Ledger Update & Receipt:** Given a completed delivery, when the courier inputs cash collected, `cash_ledger` records the entry and the customer receives an automated payment confirmation message.
13. **Cash Ceiling Lockout:** Given a courier whose held cash balance exceeds `cashCeiling`, the server blocks them from starting or accepting any new delivery missions until daily cash is remitted to the admin.

### Privacy & Coverage
14. **House Privacy Firewall:** Given a house staff account, when order details are retrieved, the returned JSON contains no customer phone number, last name, or street landmark.
15. **Unserved Neighborhood:** Given a neighborhood marked `not_served`, no houses are listed and the user can submit a `coverage_requests` record.
16. **Courier Dual-Zone Check:** Given a mission to dispatch, only couriers covering both the customer's zone and the house's zone are offered.

---

## 3. Common Gotchas & Architectural Traps

### 1. Opening-Hours Timer Arithmetic
- **Trap:** Calculating `acceptanceDeadline` using simple addition (`Date.now() + 45 * 60 * 1000`).
- **Fix:** If the order is created near closing time, calculate remaining minutes today and roll the balance over to the house's opening time the next active business day.

### 2. Client-Supplied Totals Are Untrusted
- **Trap:** Storing `itemsTotal` or `deliveryFee` directly from client cart payloads.
- **Fix:** Always recalculate item sums from `house_items` and delivery fees from `zone_fees` on the server inside `validateOrderPlacement()`.

### 3. House Data Leaks (Privacy Firewall)
- **Trap:** Using `db.query.orders.findFirst({ with: { customer: true } })` directly in house-facing routes.
- **Fix:** House queries must use a restricted Drizzle projection omitting `customer.phone`, `customer.name` (projecting first name only), and `orders.landmark`.

### 4. Courier Cash Ceiling Gate
- **Trap:** Allowing dispatch or mission starts without checking courier unremitted cash.
- **Fix:** Verify `getUnremittedCash(courierId) < cashCeiling` before allowing a courier to start a `delivery` mission.

### 5. Missing Checkout Idempotency Keys
- **Trap:** Creating orders without checking `(customer_id, idempotency_key)`.
- **Fix:** Unstable mobile networks in Bukavu cause double taps. Always enforce unique idempotency keys on order creation.

### 6. Floating-Point Currency Math
- **Trap:** Using `0.15 * total` with JavaScript `Number` floats for commissions and prices.
- **Fix:** Store all money as integers in minor units / CDF. Round integer divisions explicitly using `Math.round()` or integer arithmetic.

### 7. Uncompressed Photo Uploads
- **Trap:** Uploading 8MB smartphone photos over mobile 3G.
- **Fix:** Always compress photos in-browser (< 1280px, WebP < 300KB) before requesting presigned URLs and uploading.

### 8. Server File Proxying
- **Trap:** Streaming files through Next.js server actions or API routes.
- **Fix:** Direct uploads to Cloudflare R2 via presigned PUT URLs; direct downloads via presigned GET URLs.

### 9. Synchronous External Calls in Request Paths
- **Trap:** Awaiting SMS dispatch or background expiry timers in checkout Server Actions.
- **Fix:** Emit typed Inngest events and return immediately to the customer.

### 10. `server-only` in Vitest & Unit Tests
- **Trap:** Running `pnpm vitest run src/test/unit/...` on modules importing `server-only` and receiving `Error: This module cannot be imported from a Client Component`.
- **Fix:** Configure Vitest with `resolve.conditions: ['react-server']` in `vitest.config.ts`, or pass `NODE_OPTIONS='--conditions=react-server'` when executing tests importing server modules.

### 11. Hand-Editing Applied Migrations
- **Trap:** Modifying an existing SQL file in `drizzle/` that has already run against the database.
- **Fix:** Always edit schema TypeScript files and generate new migrations with `pnpm drizzle-kit generate`.

### 12. Async Next.js 16 Route Params
- **Trap:** Accessing `params.orderId` directly without `await`.
- **Fix:** In Next.js 16, route parameters are promises: `const { orderId } = await params`.

### 13. Premature Washing Transition
- **Trap:** Transitioning an order from `price_adjusted` to `washing` before receiving customer confirmation.
- **Fix:** Washing must remain blocked until the customer approves via app, on-the-spot courier confirmation, or admin phone confirmation.

### 14. Confusing Non-Accepted Items with Price Adjustments
- **Trap:** Charging or discounting excluded garments that a house cannot treat.
- **Fix:** Excluded garments are marked `status: 'returned'`, subtracted from the total, and returned to the customer with zero fee.

### 15. Courier Dual-Zone Compatibility
- **Trap:** Assigning a mission to a courier who only covers the house's zone but not the customer's zone.
- **Fix:** Couriers must be verified against `courier_zones` for **both** the customer zone and house zone.

### 16. Local-Only Assets in Git
- **Trap:** Committing `.agents/` or `skills-lock.json` to version control.
- **Fix:** Verify these paths are kept strictly in `.gitignore`.

### 17. Better Auth Signed Cookies in Tests
- **Trap:** Manually inserting rows into `schema.session` and setting `cookie: better-auth.session_token=<token>` causes `auth.api.getSession()` to return null because Better Auth signs cookie tokens using `BETTER_AUTH_SECRET`.
- **Fix:** In integration tests, call `auth.api.signInEmail({ body: { email, password }, asResponse: true })` and pass the returned `Set-Cookie` header into subsequent request headers.

### 18. Sentry Next.js Config Import in v11+
- **Trap:** Importing `withSentryConfig` from `@sentry/nextjs` causes type errors or build failures in `@sentry/nextjs` v11+.
- **Fix:** Import `withSentryConfig` from `@sentry/nextjs/config`.

### 19. Sentry Customer Privacy Firewall & Distributed Tracing Scrubbing
- **Trap:** Emitting Sentry errors or distributed tracing spans that accidentally include customer or courier phone numbers in user profiles, tags, extra context, breadcrumbs, or span data.
- **Fix:** Register `scrubPhoneNumbers()` in both `beforeSend` and `beforeSendSpan` across all four Sentry configurations (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `src/services/error/sentry-error-handler.ts`). This scrubs `phone`, `phoneNumber`, `contactPhone`, and `mobile` from users, tags, extra, span attributes, breadcrumbs, request bodies, query strings, and exception values while preserving diagnostic context.

### 20. Production Auth Secret Requirement
- **Trap:** Running in production without `BETTER_AUTH_SECRET` allows session forgery risks.
- **Fix:** SafiHub requires `BETTER_AUTH_SECRET` in production and immediately halts initialization if unset. Always configure `BETTER_AUTH_SECRET` in production environment variables.

### 21. React Server Conditions vs. Client Navigation in Vitest
- **Trap:** Running `NODE_OPTIONS='--conditions=react-server'` on test files that import `next/navigation` fails with `_react.default.createContext is not a function` because the React Server build intentionally omits client context APIs.
- **Fix:** Only pass `--conditions=react-server` when testing pure Server Components or isolated modules that import `server-only`. For tests importing navigation or client-compatible hooks, run Vitest normally without `--conditions=react-server`.

### 22. Empty Form Submissions & Client-Side Validation (`react-hook-form` + Zod)
- **Trap:** Forms using `<form action={formAction} noValidate>` with uncontrolled inputs bypass HTML5 validation without client-side checks. Submitting empty fields dispatches premature server action requests over mobile networks and can surface Next.js dev overlay crashes (`segment-explorer-node.js` module factory unavailable in `ErroredHtml`), resulting in forms that appear to submit with no visible error feedback.
- **Fix:** Use `react-hook-form` with `@hookform/resolvers/zod` and centralized Zod schemas (`src/lib/validations/`). Empty or invalid inputs are caught client-side before any network dispatch, displaying immediate localized inline errors (`next-intl`).
