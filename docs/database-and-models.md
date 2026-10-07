# Database & Models Guide

This document describes SafiHub's database architecture, Drizzle ORM conventions, table schemas, relationships, financial data conventions, and DAL design.

---

## 1. Drizzle ORM Architecture & Layering

SafiHub uses **Drizzle ORM** with PostgreSQL (hosted on Neon). Schema definitions are organized modularly by domain under `src/services/db/schema/` and re-exported from `src/services/db/schema/index.ts`.

### Strict DAL Isolation
- **All database queries live in `src/dal/`:** Neither server actions, route handlers, nor the service layer may import the Drizzle database client (`src/services/db/index.ts`) directly.
- **Why:** Isolating queries inside the DAL makes the service layer cleanly testable, enables mock adapters for unit testing, and prevents SQL/schema leaks across feature boundaries.
- **Query APIs:**
  - Use Drizzle's **Relational Query API** (`db.query.table.findMany({ with: { ... } })`) for read paths requiring nested relations (e.g. orders with order items, house profile with opening hours, missions with courier details).
  - Use the **SQL-like Query Builder** (`db.select()`, `db.insert()`, `db.update()`) for mutations, atomic upserts, and complex conditional queries.

---

## 2. Canonical Database Schemas

SafiHub's 28 core domain tables are modularized across seven schema files:

### 1. Auth & Profiles (`schema/auth.ts`)
| Table | Key Columns | Purpose |
| :--- | :--- | :--- |
| `users` | `id`, `name`, `email`, `role`, `status`, `contactPhone`, `isGuest` | better-auth user entity extended with SafiHub roles (`customer`, `courier`, `house`, `admin`), active/blocked status, and contact phone. Guest users have placeholder emails (`guest-<id>@guest.invalid`). |
| `sessions` | `id`, `userId`, `token`, `expiresAt`, `ipAddress`, `userAgent` | better-auth active session records. |
| `accounts` | `id`, `userId`, `accountId`, `providerId`, `password` | better-auth credential storage. |
| `customer_addresses`| `id`, `userId`, `label`, `neighborhoodId`, `landmark`, `phone` | Saved delivery locations for registered customers. |
| `consents` | `id`, `userId`, `document`, `version`, `acceptedAt` | User acceptance audit log for Terms of Service, Privacy Policy, and Photo Release. |

### 2. Master Catalogue (`schema/catalog.ts`)
| Table | Key Columns | Purpose |
| :--- | :--- | :--- |
| `services` | `id`, `code`, `nameFr`, `nameSw`, `active` | Laundry service types (`wash_fold`, `iron_only`, `dry_clean`, `express`). |
| `items` | `id`, `code`, `category`, `nameFr`, `nameSw`, `active` | Master list of laundry garments/textiles (shirt, suit, bedsheet, dress, blanket). |
| `fabrics` | `id`, `code`, `nameFr`, `nameSw`, `active` | Master list of fabric materials (cotton, wool, silk, synthetic, denim). |
| `item_requests` | `id`, `houseId`, `itemName`, `fabricName`, `status`, `adminNotes` | House requests for new garments or fabrics to be added to the master catalogue by the admin. |

### 3. Laundry Houses (`schema/house.ts`)
| Table | Key Columns | Purpose |
| :--- | :--- | :--- |
| `houses` | `id`, `name`, `neighborhoodId`, `commissionRate`, `minOrderAmount`, `cutoffMinutes`, `turnaroundHours`, `dailyCapacity`, `maxDistanceLevel`, `isOpen`, `active` | Laundry facility entity with operational rules, minimums, and capacity limits. |
| `house_members` | `id`, `houseId`, `userId`, `role` | Links staff accounts to a specific laundry house. |
| `house_hours` | `id`, `houseId`, `weekday`, `openTime`, `closeTime` | Weekly opening hours schedule per house (weekday 0=Sunday to 6=Saturday). |
| `house_closures` | `id`, `houseId`, `startDate`, `endDate`, `reason` | Temporary closures (public holidays, scheduled maintenance, power outages). |
| `house_exclusions` | `id`, `houseId`, `itemId`, `fabricId`, `category`, `note` | Items or fabrics the house refuses to clean (e.g. delicate silk, leather, carpets). |
| `house_items` | `id`, `houseId`, `serviceId`, `itemId`, `fabricId`, `price`, `active` | Custom price (in integer CDF) charged by a house for a specific service/item/fabric combination. |

### 4. Geographic Coverage & Zones (`schema/coverage.ts`)
| Table | Key Columns | Purpose |
| :--- | :--- | :--- |
| `zones` | `id`, `name`, `code`, `active` | Delivery zones grouping neighborhoods (e.g. Zone Ibanda, Zone Kadutu, Zone Bagira). |
| `neighborhoods` | `id`, `zoneId`, `name`, `status`, `pauseReason` | Neighborhood entities with status (`served`, `paused`, `not_served`). |
| `house_coverage` | `id`, `houseId`, `neighborhoodId`, `active`, `pausedUntil` | Explicit neighborhoods a partner house agrees to serve within its allowed distance limit. |
| `courier_zones` | `id`, `courierId`, `zoneId` | Geographic zones assigned to a courier for pickup and delivery missions. |
| `zone_fees` | `id`, `customerZoneId`, `houseZoneId`, `deliveryFee`, `distanceLevel` | Matrix defining delivery fee (integer CDF) and distance level (1=same, 2=neighbor, 3=far) between zones. |
| `coverage_requests` | `id`, `phone`, `neighborhoodName`, `createdAt`, `notifiedAt` | Visitor demand signal records for unserved neighborhoods. |

### 5. Orders & Lifecycle (`schema/order.ts`)
| Table | Key Columns | Purpose |
| :--- | :--- | :--- |
| `orders` | `id`, `orderNumber`, `customerId`, `houseId`, `source`, `status`, `idempotencyKey`, `trackingToken`, `pickupSlotStart`, `pickupSlotEnd`, `deliverySlotStart`, `deliverySlotEnd`, `acceptanceDeadline`, `receptionDeadline`, `address`, `landmark`, `phone`, `currency`, `itemsTotal`, `adjustedTotal`, `deliveryFee`, `commissionRate`, `commissionAmount`, `deliveryCode` | Central order record tracking statuses, deadlines, frozen prices, and delivery verification codes. |
| `order_items` | `id`, `orderId`, `serviceId`, `itemId`, `fabricId`, `price`, `declaredQuantity`, `pickupQuantity`, `receivedQuantity`, `conditionNote`, `status` | Line items with three-point count tracking and non-accepted item return status. |
| `order_events` | `id`, `orderId`, `fromStatus`, `toStatus`, `authorId`, `onBehalfOf`, `approvalMethod`, `notes`, `createdAt` | Immutable chronological state-transition and on-behalf audit log. |
| `disputes` | `id`, `orderId`, `type`, `notes`, `resolution`, `refundAmount`, `openedById`, `resolvedById` | Dispute claims regarding lost, damaged, or miscounted laundry items. |

### 6. Missions & Couriers (`schema/mission.ts`)
| Table | Key Columns | Purpose |
| :--- | :--- | :--- |
| `missions` | `id`, `orderId`, `type`, `courierId`, `slotStart`, `slotEnd`, `status`, `courierPay`, `completedAt` | Granular courier missions (`pickup` or `delivery`) with pay per leg. |
| `courier_profiles` | `id`, `userId`, `cashCeiling`, `securityDeposit`, `changeFloat`, `active` | Courier operational limits, cash ceiling thresholds, and deposit balances. |
| `courier_shifts` | `id`, `courierId`, `weekday`, `startTime`, `endTime` | Weekly working shift schedule for couriers. |

### 7. Financials, Files & Ops (`schema/ops.ts`)
| Table | Key Columns | Purpose |
| :--- | :--- | :--- |
| `cash_ledger` | `id`, `missionId`, `courierId`, `currency`, `cashCollected`, `owedToHouse`, `owedToOwner`, `courierPay`, `depositDeduction`, `changeFloat`, `settlementType`, `settledAt` | Append-only multi-currency ledger tracking cash on delivery flows and settlements. |
| `order_photos` | `id`, `orderId`, `itemId`, `missionId`, `type`, `storageKey`, `authorId`, `createdAt` | Cloudflare R2 image metadata (`pickup_condition` or `delivery_proof`). |
| `settings` | `id`, `key`, `value`, `updatedAt` | Global platform parameters (acceptance delay, reception window, default commission, cash ceiling). |
| `exchange_rates` | `id`, `currencyPair`, `rate`, `setById`, `validFrom` | Daily exchange rates (e.g. USD/CDF) set by the admin and frozen onto orders at creation. |
| `notifications` | `id`, `userId`, `channel`, `content`, `status`, `sentAt`, `readAt` | Log of in-app, push, WhatsApp link, and SMS notifications. |

---

## 3. Financial & Monetary Conventions

- **Integer Minor Units:** All monetary columns (`price`, `itemsTotal`, `deliveryFee`, `commissionAmount`, `cashCollected`, `courierPay`) are stored as **integers** representing Congolese Francs (CDF minor units / whole francs). Never use floating point or JavaScript `Number` decimals for money.
- **Frozen Pricing on Orders:**
  - `orders.itemsTotal`: Sum of item prices recalculated from `house_items` at checkout.
  - `orders.deliveryFee`: Looked up from `zone_fees` and frozen onto the order.
  - `orders.commissionRate` & `orders.commissionAmount`: Frozen from the house's rate at checkout.
  - `orders.exchangeRate`: Frozen if paying in USD, using the admin's active rate at order time.
- **Adjusted Totals:** When the courier count or house reception count discovers quantity/fabric differences, `orders.adjustedTotal` records the new sum after customer approval, while `orders.itemsTotal` retains the original checkout estimate for auditability.

---

## 4. Key Schema Conventions

- **UUID Primary Keys:** Every table defines `id: uuid("id").defaultRandom().primaryKey()`.
- **Automatic Timestamps:** Every table defines `createdAt: timestamp("created_at").defaultNow().notNull()` and `updatedAt: timestamp("updated_at").defaultNow().notNull()`.
- **Soft Delete / Active Toggles:** Core operational tables (`houses`, `items`, `fabrics`, `house_items`, `courier_profiles`) use `active: boolean("active").default(true).notNull()` instead of hard deletions.
- **Foreign Key Constraints:** Foreign keys strictly reference parent tables with appropriate `onDelete: "cascade"` or `onDelete: "restrict"` (e.g. orders restrict deletion of active houses or customers).

---

## 5. Migration Workflow

1. Update or create modular schema files in `src/services/db/schema/`.
2. Ensure new tables and relations are exported via `src/services/db/schema/index.ts`.
3. Generate the SQL migration:
   ```bash
   pnpm drizzle-kit generate
   ```
4. Apply the migration to your database:
   ```bash
   pnpm db:migrate
   ```
5. **Never hand-edit previously applied migration SQL files.**
