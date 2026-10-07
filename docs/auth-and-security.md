# Auth & Security Guide

This document describes authentication, authorization, role guards, customer privacy protections, guest tracking, and fraud controls in SafiHub.

---

## 1. Authentication Architecture (better-auth)

SafiHub uses **better-auth** for session management, role enforcement, and credential handling:

- **Server Instance (`src/services/auth/auth.ts`):** 
  - Handles credential verification, session creation, Drizzle database adapters, and admin plugins.
  - Marked with `import "server-only"` at the top.
  - Configures `session: { freshAge: 0 }` to prevent premature session invalidation.
- **Client Instance (`src/services/auth/auth-client.ts`):** 
  - Exports client hooks (`useSession`, `signIn`, `signOut`) for use exclusively in Client Components.
- **Auth DAL (`src/dal/auth.dal.ts`):** 
  - Provides direct, type-safe queries for user profiles, roles, and guest account linking.
- **Strict Separation:** Never import `src/services/auth/auth.ts` or `src/dal/auth.dal.ts` into Client Components.
- **Route Handler:** Exposed at `src/app/api/auth/[...all]/route.ts`.

### Default Sign-In & Credentials
- **Email + Password:** Default authentication mechanism for all registered users (customers, house managers, couriers, and admin).
- **Contact Phone:** Stored in `users.contactPhone` and used for operational coordination (courier call, WhatsApp updates). The `phoneNumber` plugin is optional and kept disabled at launch to avoid costly SMS OTP infrastructure until required.
- **Password Resets:** Handled via transactional email link or manual admin password reset in the back-office.

---

## 2. Roles & Authorization Guards

SafiHub defines four distinct system roles:

| Role | Permitted Areas | Key Capabilities |
| :--- | :--- | :--- |
| `customer` | `/(customer)/*` | Create orders, view active orders, approve price adjustments, report disputes, manage saved addresses. |
| `house` | `/house/*` | View incoming orders, accept/reject within 45m, record reception counts, mark laundry ready, set prices and hours. |
| `courier` | `/courier/*` | View assigned missions, record pickup counts and condition notes, upload photos, collect cash, sync offline. |
| `admin` | `/admin/*` | Full operational control: dispatch missions, manual order entry, on-behalf actions, cash reconciliation, settlements, manage catalogues and zones. |

### Server-Side Route Guarding
Protected route layouts (`src/app/house/layout.tsx`, `src/app/courier/layout.tsx`, `src/app/admin/layout.tsx`) inspect the session server-side:
```ts
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user) {
  redirect("/login");
}
if (session.user.role !== "admin") {
  redirect("/");
}
```
Unauthenticated or unauthorized access triggers an immediate server-side `redirect()` to avoid UI flashes of protected layout shells.

### Action-Level Auth Verification
Every server action checks session authenticity and role permissions first:
```ts
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user) {
  return err("Unauthorized");
}
```

---

## 3. Strict Customer Privacy Firewall

To prevent **platform disintermediation** (customers and partner houses transacting directly outside SafiHub) and protect customer privacy in Bukavu:

### The House Privacy Firewall
- **Restricted Projection:** Any DAL query returning orders for a laundry house **must** project a sanitized subset of customer data.
- **Hidden Fields:** Laundry houses **never** see:
  - Customer phone number
  - Customer street landmark or precise address
  - Customer last name
- **Visible Fields:** Houses see only the customer's first name, the neighborhood (e.g. "Ibanda"), and the order code.
- **Courier Contact Isolation:** Couriers only receive the customer's phone number and landmark **while actively executing a mission** (`pickup_in_progress` or `delivery_in_progress`). Once completed, access is removed.

---

## 4. Guest Customer Handling & Public Tracking

Many customers in Bukavu place orders over phone calls or WhatsApp. The admin creates these orders directly in `/admin/orders/new`.

- **Guest Account Creation:** Admin assigns a placeholder email (`guest-<uuid>@guest.invalid`) with `isGuest: true` and the customer's reachable phone number.
- **Unguessable Tracking Token:** Every order generates a secure, random `trackingToken` (UUIDv4).
- **Public Tracking Route (`/track/[token]`):**
  - Guest customers access order status without logging in.
  - Allows full visibility of progress steps and condition photos.
  - **Price Adjustment Approval:** Guests can directly review and approve price adjustments from this page.
- **Account Merging:** If a guest customer subsequently registers an account using their phone number, the admin or system can merge past orders into the authenticated account.

---

## 5. Abuse, Fraud & Delivery Verification

### 1. Delivery Confirmation Code
- When an order reaches `delivery_in_progress`, the customer tracking screen displays a 4-digit numeric `deliveryCode` (e.g. `4829`).
- Upon handing over the clean laundry, the courier asks for the code and enters it into the courier app.
- This cryptographically verifies physical delivery and prevents false completion claims.

### 2. First-Order Screening (Optional Setting)
- Configured via `settings.first_order_screening` (default: `off`).
- When enabled, orders from first-time customers start in `awaiting_confirmation` rather than `created`.
- The admin verifies the phone number or WhatsApp before confirming, which starts the 45-minute house acceptance timer.

### 3. Rate Limits & Ceilings
- Max open orders per customer (default 2) to prevent spamming.
- Courier cash ceiling enforcement: prevents assignment of new deliveries if a courier holds excess unremitted cash.

---

## 6. Secrets Management & Environment Isolation

- **Never Commit Secrets:** Database URLs, `BETTER_AUTH_SECRET`, Cloudflare R2 tokens, and SMS credentials must never be committed to git or logged.
- **No `NEXT_PUBLIC_` on Server Secrets:** Only public flags (like app name or public domain) may use `NEXT_PUBLIC_`.
- **Environment Updates:** Whenever a new environment variable is introduced, immediately document it in `.env.example`.
