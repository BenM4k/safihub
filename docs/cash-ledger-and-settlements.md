# Cash Ledger & Settlements Guide

This document describes SafiHub's cash on delivery operations, multi-currency ledger, courier cash controls, reconciliation workflows, and partner house settlements.

---

## 1. Cash on Delivery Operations in Bukavu

In the pilot phase, SafiHub operates primarily via **Cash on Delivery (COD)**. Customers pay cash to the courier upon delivery of clean laundry. 

Because couriers handle physical currency on the streets of Bukavu, trust is replaced with **strict financial controls, mathematical tracking, and an append-only ledger**.

---

## 2. Multi-Currency Architecture (CDF Base & USD)

- **Base Currency:** **Congolese Franc (CDF)**. All catalogue prices, delivery fees, commission amounts, and internal ledger entries are stored as integers in CDF.
- **Optional USD Acceptance:** 
  - The admin configures daily USD/CDF rates in `exchange_rates`.
  - When an order is created, the active rate is **frozen** on the order (`orders.exchangeRate`). Fluctuations during the 24–48 hour washing turnaround do not affect the customer's total.
  - The cash ledger tracks cash collected per currency (`CDF` or `USD`), and daily reconciliation reconciles both currencies independently.
- **Change Float:** Couriers carry a small admin-recorded cash float (e.g. small CDF banknotes) recorded in `cash_ledger` under `settlementType: 'float_issued'`.

---

## 3. Append-Only Cash Ledger Architecture (`cash_ledger`)

All cash movements are strictly append-only. **Existing ledger rows are never updated or deleted.**

### Ledger Entry Schema
```ts
export const cashLedger = pgTable("cash_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  missionId: uuid("mission_id").references(() => missions.id),
  courierId: uuid("courier_id").references(() => users.id).notNull(),
  currency: varchar("currency", { length: 3 }).default("CDF").notNull(),
  cashCollected: integer("cash_collected").default(0).notNull(), // Total received from customer
  owedToHouse: integer("owed_to_house").default(0).notNull(),     // House share (items - commission)
  owedToOwner: integer("owed_to_owner").default(0).notNull(),     // Platform margin + delivery fee
  courierPay: integer("courier_pay").default(0).notNull(),       // Courier earned pay for this leg
  depositDeduction: integer("deposit_deduction").default(0).notNull(),
  changeFloat: integer("change_float").default(0).notNull(),
  settlementType: varchar("settlement_type", { length: 30 }).notNull(), 
  // 'delivery_collection' | 'courier_daily_remit' | 'house_settlement' | 'deposit_withheld' | 'float_issued'
  settledAt: timestamp("settled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Unit Economics on Delivery Collection
For an illustrative order with 20,000 CDF item total (20% commission = 4,000 CDF), 6,000 CDF delivery fee, and 2,000 CDF courier delivery pay:
- Customer pays: **26,000 CDF** cash to courier.
- `cashCollected`: +26,000 CDF
- `owedToHouse`: +16,000 CDF (20,000 - 4,000)
- `owedToOwner`: +8,000 CDF (4,000 commission + 4,000 delivery fee net)
- `courierPay`: +2,000 CDF (credited to courier)
- Net cash courier must remit to admin: $26,000 - 2,000 = \mathbf{24,000\text{ CDF}}$ (or 8,000 CDF if the 16,000 CDF house share was handed over directly at drop-off).

---

## 4. Courier Cash Controls & Guardrails

### 1. Courier Cash Ceiling & Delivery Lockout
- Every courier has a maximum cash ceiling (`courier_profiles.cashCeiling`, e.g. 150,000 CDF).
- Before a courier can accept or be dispatched to a new `delivery` mission, the server calculates their current unremitted cash balance:
  $$\text{Held Cash} = \sum (\text{cashCollected}) - \sum (\text{courierDailyRemit})$$
- **Lockout:** If $\text{Held Cash} \ge \text{cashCeiling}$, the system **locks** the courier from accepting further delivery missions until cash is remitted to the admin.

### 2. Daily Courier Reconciliation (`/admin/cash`)
- Couriers settle all collected cash daily at the end of their shift.
- The admin opens the courier's daily summary, counts the cash handed over, and clicks "Confirm Daily Remittance".
- An offsetting `courier_daily_remit` ledger record is created, resetting the courier's held cash to zero.
- Any discrepancy is recorded with timestamp and reason. Discrepancies exceeding 2% trigger review against success criteria.

### 3. Security Deposit
- During onboarding, a small deposit (e.g. 30,000 CDF) is withheld across the courier's first 10 missions (`depositDeduction`).
- Held in reserve to cover verified cash losses, and refunded in full upon conclusion of service.

### 4. Customer Receipt Verification Message
- Immediately when the courier inputs cash collected in `/courier/missions/[id]`, the server triggers a confirmation push notification / SMS to the customer:
  > *"SafiHub: Confirmed payment of 26,000 CDF for order #SF-1042."*
- This immediately surfaces any courier attempt to overcharge the customer.

---

## 5. Partner House Weekly Settlements (`/admin/settlements`)

- **Cadence:** Weekly (every Monday).
- **Calculation:** For each partner laundry house:
  $$\text{Payout} = \sum_{\text{delivered}} (\text{Order Items Total} - \text{Commission Amount})$$
- **Drop-off Point Exception:** If a courier handed over cash directly to the laundry house at the time of clothing handover, both parties must have acknowledged the transfer in-app. The payout calculation deducts those direct cash transfers.
- Admin records payout reference (cash voucher or mobile money transfer) and appends a `house_settlement` ledger event.
