# SafiHub — Product & Architecture Spec (Bukavu)

> Version 9.6. Status labels: **Decided**, **Proposed** (my recommendation, not yet confirmed) and **Open**. See the Decision Log for the summary.

## 1. Product Overview

**SafiHub** is a web application for a home laundry (dry-cleaning) service in **Bukavu, DRC**. ("Safi" means clean in Swahili.) Customers order online, a courier collects the laundry, a laundry house washes it, and a courier delivers it back clean.

The platform is a **marketplace**: the customer chooses a nearby laundry house, and each house sets its own prices per item, fabric and service. The owner can run their own laundry house and/or work with local partner houses.

**Value proposition:** laundry service without leaving home, with order tracking from pickup to delivery.

---

## 2. Decision Log

| Decision                                                                                                                                               | Status   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| Marketplace: the customer chooses a nearby house; houses set prices per item                                                                           | Decided  |
| Launch in Bukavu as a mobile-first **web app first**; the PWA layers are kept and added later                                                          | Decided  |
| The app is named **SafiHub**                                                                                                                           | Decided  |
| PWA layers by role: courier service worker and offline before the pilot, house push at or after the pilot start, none at first for customers and admin | Proposed |
| Delivery fees paid by the customer                                                                                                                     | Decided  |
| Hybrid ordering: app first, manual entry by the admin, WhatsApp bot later                                                                              | Decided  |
| Stack: Next.js, Drizzle, Postgres (Neon), better-auth; no Supabase                                                                                     | Decided  |
| Email + password is the default sign-in; the `phoneNumber` plugin is optional                                                                          | Decided  |
| All four roles ship in the MVP                                                                                                                         | Decided  |
| Next available slot proposed when none is free                                                                                                         | Decided  |
| Short acceptance delay (default 45 minutes, timer during opening hours)                                                                                | Decided  |
| Three-point count; non-accepted items returned with the delivery                                                                                       | Decided  |
| File storage and photos in the MVP                                                                                                                     | Decided  |
| Cash on delivery at launch with cash controls (amounts open)                                                                                           | Decided  |
| Zones with a zone matrix, master catalogue, guest customers, missions                                                                                  | Decided  |
| The customer app is built first, before the pilot; manual entry by the admin stays available                                                           | Decided  |
| Coverage zones: served neighborhoods, house coverage, courier zones, coverage requests                                                                 | Decided  |
| The admin decides which neighborhoods are served                                                                                                       | Decided  |
| The maximum coverage distance is adjustable by the admin (global default, optional per-house override)                                                 | Decided  |
| Houses choose their coverage within that limit; the admin can override and notifies waiting customers                                                  | Proposed |
| Base currency is CDF                                                                                                                                   | Decided  |
| USD accepted at an admin-set rate frozen on the order, change float                                                                                    | Proposed |
| The house's acceptance confirms every order                                                                                                            | Decided  |
| Optional admin screening of first orders (off by default), delivery confirmation code                                                                  | Proposed |
| Admin on-behalf actions and acceptance escalation                                                                                                      | Proposed |
| Tooling choices and their timing                                                                                                                       | Proposed |
| Photo retention of 90 days                                                                                                                             | Proposed |
| Commission, courier pay, delivery fee grid, cash ceiling, deposit, slot length                                                                         | Open     |

---

## 3. Success Criteria (proposed)

The pilot is successful if, after 8 weeks:

- At least 20 orders per week (excluding friends and family)
- At least 30% of customers reorder within 30 days
- Cash discrepancies stay under 2% of cash collected
- Fewer than 5% of orders end in a dispute or cancellation after pickup
- Average margin per order is positive after courier costs
- At least 80% of orders are accepted by the house within the acceptance delay
- Average admin time per order is measured, and stays under 10 minutes (otherwise prioritize dispatch automation)

Adjust these numbers to your own targets.

---

## 4. Actors

| Actor                              | Role                                                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Customer**                       | Browses nearby houses, builds an order, pays, tracks status                                                |
| **Laundry house** (own or partner) | Receives laundry, confirms the item count, washes it, marks it ready                                       |
| **Courier**                        | Receives pickup and delivery missions, validates each step, collects cash                                  |
| **Admin (owner)**                  | Dispatches couriers, manages houses and catalogues, zones, commissions, settlements, creates manual orders |

---

## 5. Local Context (Bukavu)

- **Mobile first**: users are mostly on phones, with slow, expensive or intermittent data. Build a lightweight **web app first**; PWA layers (manifest, service worker, push) are added by role (see Tech Stack).
- **Addresses**: few reliable street names. The customer picks a **neighborhood** (e.g. Ibanda, Kadutu, Bagira), adds a **landmark** and a reachable phone number. A map pin is optional.
- **Payment**: **cash on delivery** for the MVP. Mobile money (M-Pesa, Airtel Money, Orange Money) comes later.
- **Languages**: French and Swahili.
- **Currency**: the base currency is **CDF** (decided). USD may also be accepted at an admin-set rate. See section 6, "Currency & pricing".
- **Communication**: WhatsApp and SMS are the main channels.

---

## 6. Business Model

The customer pays the item prices set by the house plus a delivery fee. Revenue comes from:

1. **Commission** on each order: roughly 15–25% of the house's item total, configurable per house. On the owner's own laundry, the owner keeps the full margin.
2. **Delivery fees paid by the customer**, based on the distance between the customer's neighborhood and the house's neighborhood. This funds the couriers.
3. **Options (later)**: express service, featured houses, subscriptions.

**Decision:** delivery fees are fully paid by the customer (no free-delivery threshold at launch).

**Safeguards**

- A **minimum order amount** per house so a trip never costs more than it earns.
- Couriers are paid **per leg**: one payment for the pickup, one for the delivery. Pay is not a fixed salary, which limits upfront cash needs.
- **All numbers below are hypotheses** (commission, courier pay, delivery fee). Validate them in a pilot with 2–3 houses and about 20 orders before fixing them.

**Illustrative example (numbers are examples only)**

Customer orders $10 of items at a house. Delivery fee is $3. The customer pays **$13 in cash** to the courier on delivery.

| Flow                      | Amount |
| ------------------------- | ------ |
| Commission (20% of $10)   | +$2    |
| Delivery fee              | +$3    |
| Courier pay (2 legs × $1) | -$2    |
| **Owner margin**          | **$3** |
| Owed to the house         | $8     |

Cash settlement: the courier holds $13, owes $8 to the house and $5 to the owner (which covers the $2 courier pay and the $3 margin).

**Disintermediation risk:** a customer and a house could deal directly after the first order. Mitigations: the house never sees the customer's phone number or street address (enforced by the permissions matrix; the courier and admin handle contact), the customer's convenience (tracking, delivery) is the product, and houses agree to terms at onboarding.

**Unit economics & break-even**

Margin per order = commission % × items total + delivery fee − courier pay (pickup and delivery) − other variable costs (SMS, change, losses).

Break-even delivery fee = courier pay − commission (never below zero). Illustrative figures: 20% commission, courier pay $2 for both legs, delivery fee $3.
All dollar amounts in this section are illustrations only; the real figures will be in CDF.

| Items total | Commission | Break-even delivery fee | Margin with a $3 fee |
| ----------- | ---------- | ----------------------- | -------------------- |
| $5          | $1         | $1                      | $2                   |
| $10         | $2         | $0                      | $3                   |
| $20         | $4         | $0                      | $5                   |

Failed trips cost courier pay with no revenue, so they need a retry fee (see 15). Monthly break-even: orders per month = fixed monthly costs ÷ average margin per order. Illustrative: $300 of fixed costs (admin time, services, internet, marketing) ÷ $3 margin = 100 orders per month, about 23 per week. Replace every figure with real numbers from the pilot (see 27).

**Currency & pricing (proposed)**

- The **base currency is CDF** (decided): catalogue prices, commissions and the ledger are in CDF.
- If USD is also accepted **(proposed)**, the customer sees both amounts. A payment in USD uses the **exchange rate set by the admin** (table `exchange_rates`), **frozen on the order** when it is created.
- Amounts are rounded to a practical unit (for example the smallest note in circulation, to set). Catalogue prices are whole CDF amounts.
- The cash ledger tracks cash **per currency**, and settlements reconcile each currency separately.
- Couriers carry a small **change float**, recorded in the ledger (amount to set).

---

## 7. MVP Scope

All four roles ship together (decided). The scope is ordered by when each part is needed, so the pilot can start early.

**Core (needed for the pilot)**

1. **Order engine**: statuses, transition rules, history, server-side validation, guest customers and tracking link
2. **Admin back-office**: all orders, **manual order entry** (WhatsApp / phone), dispatch, houses, zones, master catalogue, commissions, disputes, settlements, on-behalf actions
3. **House interface**: incoming orders, accept / reject, reception count, "ready", prices and availability, hours, new item requests
4. **Courier interface**: missions, pickup count, step validation, cash collected, offline support
5. **Customer ordering in the app**: neighborhood, houses, cart, slot, checkout, tracking
6. **File storage and photos** (decided for the MVP)
7. **Cash ledger**, delivery fee and commission tracking
8. **Notifications** (in-app and push) and **scheduled jobs**
9. **Coverage zones**: served neighborhoods, house and courier coverage, coverage requests

**Added once the pilot has started:** SMS beyond critical messages, rate limiting beyond basic limits, uptime monitoring, the dispatcher role.

**Later:** reviews, mobile money, automatic dispatch, live GPS, subscriptions, WhatsApp bot (see section 8).

Build order and the pilot plan are described in sections 29 and 28.

---

## 8. Ordering Channels (Hybrid)

**Phase 1**

- Customers order directly in the app.
- Orders received by WhatsApp or phone are entered manually by the admin. Each order has a `source` field (`app`, `whatsapp`, `phone`).
- Status notifications to customers via a pre-filled WhatsApp link (one tap to send).

**Phase 2**

- WhatsApp Business API with a bot that guides the customer (neighborhood, services, slot) and creates the order automatically. Requires Meta verification and a provider (Twilio, 360dialog, etc.).

All orders flow through the **same system** regardless of source, so the bot plugs in later without rework.

---

## 9. Customer Journey

1. Choose neighborhood (if it is not covered, the customer can leave a coverage request)
2. See the houses that cover the neighborhood (with minimum order and prices)
3. Build the order: select service, item, fabric and quantity
4. See the estimated total: items + delivery fee
5. Choose a pickup slot (or accept the next available one), add landmark and phone number
6. Courier collects and counts the items together with the customer
7. If the count or items differ, the price is adjusted and the **customer approves** before washing starts (on the spot with the courier, or later through the tracking link)
8. Track the order; when it is ready, confirm or change the proposed delivery slot
9. Pay cash on delivery

---

## 10. Service Hours & Availability

Availability rules apply to the **pickup slot**, not to the time the order is placed. A customer can order at 11 pm for a pickup the next morning.

**Rules**

- Each house defines its **weekly opening hours** and a **cut-off**: the last time a pickup slot can be booked before closing (e.g. 2 hours before the end of service).
- A slot is valid only if it falls within the opening hours of the **house**, the working hours of the **couriers**, and the slots offered to customers. All three must agree.
- **Exceptions**: closed days, public holidays, and temporary closures (e.g. power cut), set by the house or the admin.
- **Daily capacity** per house (maximum orders or items). When reached, the slot is no longer offered.
- **Turnaround time** per house (e.g. 24h or 48h) determines the estimated delivery date.
- **Delivery slot**: when the order is `ready`, the system proposes the next available delivery slot (inside courier shifts). The customer, or the admin for a guest customer, can confirm or change it. After a failed delivery, a new slot is chosen the same way.
- **Courier shifts**: each courier has weekly shifts (`courier_shifts`). A slot is offered only when at least one courier is on shift. Slot length is a setting (open decision).
- **Time source**: the server's clock only, never the phone's. Store timestamps in UTC and compute slots in the Bukavu time zone (Africa/Lubumbashi).
- **Next available slot (decided):** when no slot is free today, the app proposes the **next available slot** instead of blocking the order. The customer can accept it or choose another.
- **House acceptance delay (decided):** a short delay so the customer is not left waiting and can place another order. Default **45 minutes** (configurable, range 30–45). The house gets a reminder (push or in-app notification) at 50% of the delay, and the admin is alerted at 75% so the house can be called (see Operations & Admin Workload). The timer **runs only during the house's opening hours**, so an order placed at 10 pm does not expire at 11 pm. When it expires, the order moves to `expired` and the customer can choose another house in one tap, **keeping the cart**. The customer can also **cancel at any time before the house accepts**.

---

## 11. Coverage Zones

Coverage decides **where the service works** and **which house can serve which customer**. It is based on neighborhoods rather than street addresses, which fits Bukavu.

**Three levels**

1. **Platform service area**: the neighborhoods where the service operates. Each has a status: `served`, `paused` (temporary, with a reason such as rain, security or no courier available) or `not_served`. **Only the admin decides which neighborhoods are served**; houses and customers cannot add neighborhoods.
2. **House coverage**: the neighborhoods each house chooses to serve (`house_coverage`), within the platform service area. A house can pause its coverage temporarily.
3. **Courier coverage**: the zones each courier works in (`courier_zones`). A mission can be assigned only to a courier who covers both the customer's zone and the house's zone.

**Rules**

- A house is listed for a customer only if the customer's neighborhood is `served`, the house covers it, the house is open, a delivery fee exists for the zone pair (customer's zone → house's zone), and the distance level of that pair is within the house's limit. No fee defined means no coverage.
- Pickup and delivery both take place in the customer's neighborhood, so coverage is checked on that neighborhood.
- **Paused neighborhood**: no new orders; orders already in progress continue. The customer sees the reason and, if known, when service resumes.
- **Not served neighborhood**: the app says the service is not available there yet and offers to **leave a coverage request** (neighborhood and phone). Requests are stored in `coverage_requests` and shown to the admin ranked by demand, so expansion follows real demand. When a neighborhood becomes `served`, the admin can notify the people who asked (WhatsApp link or SMS).
- **Houses choose their coverage** (proposed): within the service area and the distance limit below. The admin can edit any house's coverage.
- **Distance limit (decided)**: the admin adjusts how far a house may serve. Each zone pair has a **distance level** (for example 1 = same zone, 2 = neighboring zone, 3 = far), stored with its delivery fee in the zone matrix. A global **maximum distance level** is set in the admin settings, with an optional override per house. A house can cover a neighborhood only if the distance level between the house's zone and the neighborhood's zone is within its limit.
- **When the limit changes**: coverage beyond a lowered limit stops being offered but is kept, and returns if the limit is raised again. Orders already placed are not affected.
- **Server-side check**: coverage is verified at checkout, not only when houses are listed.
- **No map required**: neighborhoods are picked from a list. Map pins or polygons could refine coverage later.

---

## 12. Cart & Server-Side Validation

The cart behaves like an e-commerce cart. The client sends only identifiers, quantities, the slot and the neighborhood. The **server recalculates everything** (prices, delivery fee, commission) and never trusts the client's numbers.

**Checks at checkout**

1. The house exists, is active, is open for the chosen slot, has capacity left, and covers the customer's neighborhood (see section 11)
2. Every item, fabric and service comes from the master catalogue, is offered by this house, and is active
3. Prices come from the database, not from the cart
4. The items total reaches the house's minimum order
5. The delivery fee comes from the zone-to-zone matrix (zone of the customer's neighborhood → zone of the house's neighborhood)
6. Quantities are within limits: maximum items per order, and a small cap on any free-text "other" line
7. No duplicate order (idempotency key)

**Rules (proposed)**

- Items the house does not treat are shown on the house page **before** the customer orders.
- **One house per cart.** Changing house empties the cart after a warning.
- The cart lives **on the phone** (identifiers only, no prices), kept with Zustand and persisted locally. No cart table on the server for the MVP.
- If a **price changed** between adding to the cart and checkout, the server refuses, shows the new price, and asks the customer to confirm.
- An **idempotency key** prevents double orders when the customer taps twice on an unstable network.
- The total shown is an **estimate**, since the price may be adjusted at pickup.
- **One shared validation function** is used by the app, the admin's manual entry, and the future WhatsApp bot, so the rules are identical everywhere.

---

## 13. Item Verification & Receiving

Goal: the house knows exactly what it will receive, and responsibility changes hands at each count.

**Three-point count**

1. **Customer declaration**: precise items, quantities, fabric and service, chosen from the catalogue. No "one bag of laundry".
2. **Pickup count**: the courier and the customer count together. Any gap triggers the price adjustment, which the customer must approve: on the spot (recorded by the courier) or later through the tracking link.
3. **Reception count**: the house compares what it received with the order and confirms in the app, or reports a discrepancy within **1 hour of opening-hours time** (same rule as the acceptance timer). After that, a scheduled job marks the order as conforming.

**Protections for the house**

- **Excluded items**: each house lists what it does not treat (leather, suede, delicate silk). The customer sees this before ordering.
- **Bag label**: one sack per order, marked with the order code by the courier at pickup.
- **Condition notes**: stains, tears and missing buttons are recorded at pickup, before washing.
- **Order limits**: maximum items per order and a capped free-text line.
- **Photos at pickup (in the MVP)**: required for items flagged as valuable or damaged, optional otherwise. An optional **proof-of-delivery photo** is taken at delivery. Photos are stored in private file storage (see section 20).

**Non-accepted items (decided)**

- An item the house does not treat is **refused and returned** with the delivery. It is removed from the order total, with no price adjustment.
- Price adjustment (with customer approval) is used only for **fabric or quantity errors**.
- An approval can be given in the app, on the spot with the courier, or by phone recorded by the admin. Each approval stores the method and who recorded it.

---

## 14. Order Statuses & Transitions

**Main flow**

```
created → accepted by house → pickup assigned → pickup in progress → picked up
→ received by house (count confirmed) → [price adjusted → approved by customer]
→ washing → ready → delivery slot confirmed → delivery assigned
→ delivery in progress → delivered
```

**The house's acceptance is the confirmation of every order.** Optionally, the admin can screen first orders (a setting, off by default): the order then starts as `awaiting_confirmation` and becomes `created` only after the admin confirms it by phone or WhatsApp. The acceptance timer starts at `created`.

**Missions**: an order has two missions (pickup and delivery), possibly with different couriers. Mission statuses: `assigned → accepted → in_progress → completed | failed`.

**Who can trigger what** (C = customer, H = house, K = courier, A = admin, S = system job)

| Transition                                      | Who                                         | Conditions and effects                                                                     |
| ----------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `awaiting_confirmation` → `created`             | A                                           | Optional screening (off by default): admin confirmed by phone or WhatsApp                  |
| `awaiting_confirmation` → `cancelled`           | A                                           | Optional screening: customer unreachable or refused                                        |
| `created` → `accepted`                          | H, A on behalf                              | Before the acceptance deadline                                                             |
| `created` → `rejected`                          | H, A on behalf                              | Reason required; customer keeps the cart                                                   |
| `created` → `expired`                           | S                                           | Deadline passed (opening hours only)                                                       |
| `created` → `cancelled`                         | C, A                                        | Free before acceptance                                                                     |
| `accepted` → `pickup assigned`                  | A                                           | Courier on shift; slot respected                                                           |
| `pickup assigned` → `pickup in progress`        | K                                           | During the slot                                                                            |
| `pickup in progress` → `picked up`              | K                                           | Count recorded with customer's on-site confirmation; photos for flagged items              |
| `pickup in progress` → `pickup_failed`          | K                                           | Reason required; failed-attempt counter +1                                                 |
| `picked up` → `received`                        | H, A on behalf, S                           | Count compared; discrepancies and non-accepted items flagged; S after the reception window |
| `received` → `price adjusted`                   | H, K, A                                     | Difference recorded                                                                        |
| `price adjusted` → `washing`                    | C (app or link), K (on the spot), A (phone) | Approval method and recorder stored                                                        |
| `price adjusted` → `price_declined`             | C, A                                        | Laundry returned; fee per policy                                                           |
| `received` → `washing`                          | H, A on behalf                              | When there is no adjustment                                                                |
| `washing` → `ready`                             | H, A on behalf                              | Triggers the delivery slot proposal                                                        |
| `ready` → `delivery slot confirmed`             | C, A                                        | Next available slot proposed                                                               |
| `delivery slot confirmed` → `delivery assigned` | A                                           | Courier on shift                                                                           |
| `delivery assigned` → `delivery in progress`    | K                                           | During the slot                                                                            |
| `delivery in progress` → `delivered`            | K                                           | Cash collected entered; amount message sent to the customer                                |
| `delivery in progress` → `delivery_failed`      | K                                           | Reason required; new slot chosen                                                           |
| any active status → `disputed`                  | C, H, A                                     | Dispute record opened                                                                      |
| any status after pickup → `cancelled`           | A only                                      | Fee and return rules apply                                                                 |

**Exit statuses**

| Status            | When                                                                           |
| ----------------- | ------------------------------------------------------------------------------ |
| `rejected`        | The house refuses the order                                                    |
| `expired`         | The house did not respond within the allowed delay                             |
| `cancelled`       | Cancelled before pickup by the customer or admin, or by the admin afterwards   |
| `pickup_failed`   | Customer absent or unreachable at pickup                                       |
| `price_declined`  | Customer refuses the adjusted price; laundry returned, a reduced fee may apply |
| `delivery_failed` | Customer absent at delivery; rescheduled                                       |
| `disputed`        | Loss, damage or payment disagreement                                           |

Every change is stored in `order_events` with timestamp, author and, for on-behalf actions, `on_behalf_of`. Invalid transitions are rejected by the server.

---

## 15. Permissions & Data Visibility

Every query and action is checked on the server. House queries use a **restricted projection** that never includes the customer's phone number or street address.

**Data visibility**

| Data                               | Customer                 | House                  | Courier                | Admin |
| ---------------------------------- | ------------------------ | ---------------------- | ---------------------- | ----- |
| Customer phone                     | Own                      | No                     | Its missions           | Yes   |
| Address and landmark               | Own                      | Neighborhood only      | Its missions           | Yes   |
| Customer name                      | Own                      | First name             | First name             | Yes   |
| Items, quantities, condition notes | Own orders               | Its orders             | Its missions           | All   |
| Photos                             | Own orders               | Its orders             | Its missions           | All   |
| Catalogue prices                   | All houses               | Own                    | Order total only       | All   |
| Commission                         | No                       | Own rate               | No                     | All   |
| Delivery fee                       | Own order                | No                     | Amount to collect only | All   |
| Courier pay                        | No                       | No                     | Own                    | All   |
| Cash ledger                        | No                       | Own settlements        | Own cash               | All   |
| Courier name and phone             | During an active mission | First name at handover | Yes                    | Yes   |

**Who can do what**

- **Create an order**: customer (self), admin (any customer, including guests).
- **Edit prices and availability**: house (own), admin.
- **Edit the master catalogue** (items, fabrics, services): admin only; houses submit requests.
- **Coverage**: the admin decides the served neighborhoods, sets the distance limit and the courier zones, and can edit any house's coverage; a house edits its own coverage within the service area and its distance limit; any visitor can leave a coverage request.
- **Assign missions, resolve disputes, reset passwords, change settings**: admin only.
- **Change a status**: only as allowed in the transition table.
- **House staff**: several accounts can belong to one house through `house_members`.
- **Customer data rights**: a customer can ask for a copy or deletion of their personal data (see section 31).

---

## 16. Disputes & Policies (to define with houses)

- **Item count at pickup**: the courier records the count with the customer's on-site confirmation; the customer sees it in the app or on the tracking page.
- **Loss or damage**: the house is responsible for items once received. Define a compensation cap (e.g. a multiple of the item price) in the house agreement.
- **Evidence**: pickup photos, condition notes, counts and delivery proof are attached to the order and used to resolve disputes.
- **Cancellation**: free before pickup; fee after pickup (to be set).
- **Failed pickup or delivery**: after one failed attempt, a retry fee may apply.
- The admin can open and resolve a dispute from the back-office, with notes stored on the order.

---

## 17. Cash Controls

Couriers handle cash, so trust is replaced by rules and traceability.

**Recruitment**

- Couriers are known or recommended, with an ID document and a reference person.
- A courier agreement states the cash rules and consequences of discrepancies.

**Limits and frequency**

- Each courier has a **cash ceiling** (amount to be set). Above it, the courier must settle before taking new deliveries.
- **Daily settlement** at the start; move to weekly only once trust is established and discrepancies are near zero.
- A small **security deposit** is withheld from the first missions and returned after an agreed period with no discrepancy (amount and period to be set).

**Traceability**

- The customer receives a message with the **amount paid**, so a courier cannot collect more or less without it showing. Channel **(proposed)**: in-app and push for customers with the app, SMS for guest customers.
- The courier enters the cash collected at delivery; the app computes what is owed to the house and to the owner.
- The house can be a **drop-off point**: the courier hands over the house's share directly, confirmed by both sides in the app.
- Cash is tracked per currency, and the change float is recorded (see 6).

**Reconciliation**

- Daily reconciliation: the admin compares cash received with the ledger for each courier.
- Any discrepancy is logged with the courier and date, deducted from the deposit if confirmed, and tracked against the success criterion.
- The ledger records: cash collected, owed to house, owed to owner, paid out, deposits, and settlement dates.

**Priority after the pilot:** mobile money (M-Pesa, Airtel Money, Orange Money), where the customer pays the platform account directly and the courier no longer handles money.

---

## 18. Abuse & Fraud Controls (proposed)

- **Confirmation by the house**: the house's acceptance confirms every order. Because the house does not see phone numbers, it confirms availability and capacity, not the customer's identity.
- **Optional first-order screening**: a setting, off by default, where a customer with no completed order starts as `awaiting_confirmation` until the admin confirms by phone or WhatsApp. Turn it on if fake orders appear.
- **Limits**: maximum open orders per customer (for example 2), a daily order cap per phone number, and rate limiting on registration, login and checkout.
- **Email and phone verification**: email verification at registration; a one-time phone code only if abuse appears (it needs the optional `phoneNumber` plugin and SMS, which has a cost).
- **No-shows**: after 2 failed pickups, the customer needs admin approval to order again, and the retry fee applies.
- **Blocking**: the admin can block an account; the blocked email and profile phone number cannot register again.
- **Delivery confirmation code**: the customer sees a short code on the tracking page and gives it to the courier, which proves the delivery took place.
- **House fraud**: prices come only from the database, a placed order cannot be repriced by the house, and the reception window and photos give evidence.
- **Courier fraud**: see section 17; the amount message to the customer exposes any difference.
- **Audit log**: every admin override and on-behalf action is stored in `order_events`.

---

## 19. Operations & Admin Workload (proposed)

The admin is the operational center at launch, so the work is made explicit and measured.

| Task                                             | Frequency               | Tool                                        |
| ------------------------------------------------ | ----------------------- | ------------------------------------------- |
| Screen first orders (only if the setting is on)  | Continuous              | Dispatch screen                             |
| Watch orders waiting for acceptance, call houses | Continuous              | Dispatch screen (call and WhatsApp buttons) |
| Assign pickup and delivery missions              | Several times a day     | Dispatch screen                             |
| Handle failed pickups and deliveries, reschedule | As they happen          | Order detail                                |
| Resolve disputes                                 | Target: within 48 hours | Disputes                                    |
| Reconcile courier cash                           | Daily, end of day       | Cash                                        |
| Settle houses                                    | Weekly                  | Settlements                                 |
| Reset passwords, support requests                | On request              | Users                                       |
| Review the dashboard indicators                  | Weekly                  | Dashboard                                   |

**Acceptance escalation**

- At 50% of the acceptance delay, the house is reminded.
- At 75%, the admin is alerted and can call the house.
- At 100% (opening hours only), the order expires.

**On-behalf actions**: the admin can accept, reject, mark received or mark ready for a house that is offline or has no app access, after confirming by phone. The event records `on_behalf_of` and a note.

**Measure it**: in the pilot, record the admin minutes spent per order. If it stays above 10 minutes, build dispatch suggestions before anything else.

**Resilience**: keep at least two admin accounts (owner and a trusted deputy). A limited `dispatcher` role (assign missions, manual entry, no prices or settlements) may come after the pilot.

---

## 20. Tech Stack

| Layer     | Choice                                                       |
| --------- | ------------------------------------------------------------ |
| Front end | **Next.js** web app, mobile-first (PWA layers added by role) |
| Database  | **PostgreSQL** on **Neon** (or another Postgres host)        |
| ORM       | **Drizzle ORM** with drizzle-kit migrations                  |
| Auth      | **better-auth** with the Drizzle adapter                     |
| Hosting   | Vercel to start                                              |

**Authentication**

- **Email + password** is the default sign-in (decided). Every account needs an email address. The customer's phone number is a profile field (`contactPhone`) used for orders and contact.
- The **`phoneNumber` plugin is optional**: enable it later only if phone sign-in or phone verification is needed. SMS codes cost money and arrive unreliably on some networks.
- **Password reset** by email link (needs a transactional email provider, see Services & Tooling), with the admin able to reset any password as a fallback.
- `admin` plugin for roles: customer, courier, house, admin (a limited `dispatcher` role may come after the pilot). Each account has a status: active or blocked.
- **Guest customers**: customers entered by the admin have a phone number and no login. They get a placeholder email (for example `guest-<id>@guest.invalid`) and are marked as guests. The admin can later merge a guest into a registered account after confirming the phone number, or the customer can verify the number by code if the phone plugin is enabled.
- **Accounts without email**: couriers and house staff are created by the admin with an email address. If some have none, either give them an address the admin controls or enable the phone plugin for staff only (open decision).
- Auth tables (user, session, account) are generated by the better-auth CLI. Business tables reference `user`.

**Data access:** all logic runs through Next.js Server Actions or API routes, with role checks on the server.

**Notifications (proposed)**

- **In-app inbox** for every role, refreshed on open and with pull-to-refresh (no continuous polling, to save mobile data).
- **PWA push** for new orders (house), new missions (courier) and status changes (customer). Push works best once the PWA is installed and support varies by device, so test on the phones actually used in Bukavu.
- **SMS** only for critical messages (payment confirmation, guest customers), because it costs money and delivery varies.
- **WhatsApp**: pre-filled links sent manually by the admin or the house in phase 1; automated messages with the WhatsApp Business API in phase 2.
- Every notification is stored in a `notifications` table with channel, status and read time.

**Scheduled jobs (proposed)**

- A job runs every few minutes to: send the acceptance reminder, expire orders not accepted in time, confirm reception automatically after the window, and flag late orders and missions.
- Preferred **(proposed)**: a **delayed job per order** (Inngest or QStash) scheduled at the acceptance and reception deadlines, plus **Vercel Cron** for regular tasks (late-order flags, reminders). Cron frequency is limited on the free plan (to verify). Jobs must be **idempotent**.
- Deadlines (acceptance, reception) are computed and stored when the event happens, taking opening hours into account, so the job only compares timestamps.

**Web app first, PWA layers by role (proposed timing)**

- The product starts as a normal mobile-first web app in the browser. The manifest and icons are added from the start (a home-screen shortcut); a service worker is added only when a role needs it.
- **Customer and admin**: plain web app, no service worker at first.
- **Courier**: service worker, cached app shell and offline action queue, added before the pilot. Offline is core to this role.
- **House**: push notifications at or just after the pilot start. Until then, the admin escalation at 75% of the acceptance delay covers missed orders.
- Build the courier screens on a local data layer (Zustand with IndexedDB, fed by JSON from the server) from the start, so offline can be added without rewriting them.
- Push works in a browser tab on Android Chrome; iPhones need the app added to the home screen. Check which phones couriers and house staff use before relying on push.

**Courier offline mode**

- The courier app caches the mission list and queues status updates and cash entries locally, then syncs when the connection returns. The queue is kept on the device (Zustand with IndexedDB persistence) and includes photo uploads.

**File storage (MVP, decided)**

- **Cloudflare R2** (S3-compatible), private bucket. Phones upload directly with short-lived signed URLs, so files never pass through the Next.js server. Viewing also uses signed URLs.
- **Compression on the phone before upload** **(proposed)**: resize to about 1280 px on the long side and re-encode as JPEG or WebP, to save mobile data.
- **Offline**: the courier's photos join the offline queue and upload when the connection returns.
- Photos are recorded in `order_photos` (order, item, mission, type, storage key, author, date). Types: pickup condition, delivery proof.
- Limits to set: maximum photos per order and per item, maximum file size, retention period (e.g. delete after the dispute window).
- Access: the customer, the house of the order, the admin, and the courier of the mission. Nobody else.

---

## 21. Services & Tooling

Choices are **proposed** except file storage. Check pricing, limits and DRC coverage first. Check how each paid service can be paid for from the DRC, prefer free tiers, and keep the pilot set small.

| Need                 | Tool                                  | Where it is used                                  | When                                           | Notes                                                                |
| -------------------- | ------------------------------------- | ------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------- |
| Delayed jobs         | Inngest or QStash (Upstash)           | Acceptance expiry, reception confirmation         | Pilot                                          | Avoid tools that need a permanent server (BullMQ, pg-boss) on Vercel |
| Regular tasks        | Vercel Cron                           | Late-order flags, reminders                       | Pilot                                          | Frequency limited on the free plan (to verify)                       |
| Client state         | Zustand with `persist`                | Cart, courier offline queue                       | Pilot                                          | Not for server data; IndexedDB for larger queues                     |
| Validation           | Zod                                   | Shared validation function, forms, Server Actions | Pilot                                          | One schema for the app, admin entry and the future bot               |
| Internationalization | next-intl                             | French and Swahili                                | Pilot                                          | Master catalogue stores both names; language in a cookie             |
| File storage         | Cloudflare R2                         | Photos                                            | Pilot (**decided**)                            | Private bucket, signed URLs                                          |
| Push notifications   | `web-push` or OneSignal               | Notifications                                     | Pilot                                          | Test on the phones used in Bukavu                                    |
| Transactional email  | Resend, Postmark or any SMTP provider | Password reset, email verification                | Pilot                                          | Free tier first; check how to pay from the DRC                       |
| Error tracking       | Sentry (or PostHog)                   | All areas                                         | Pilot                                          | Alert on failed jobs                                                 |
| Analytics            | PostHog                               | Core events only                                  | Pilot                                          | Server-side events                                                   |
| SMS                  | Africa's Talking, Infobip or Twilio   | Payment confirmation, guest customers             | Limited at first (manual WhatsApp), full after | Check coverage and cost per operator                                 |
| Rate limiting        | Upstash Redis                         | Registration, login, checkout                     | After the pilot starts                         | Basic limits in the app first                                        |
| Uptime monitoring    | UptimeRobot or Better Stack           | Production                                        | After the pilot starts                         | Alert the admin by WhatsApp or SMS                                   |
| Mobile money         | Payment aggregator                    | Payments                                          | After the pilot                                | Verify DRC coverage                                                  |

---

## 22. Analytics & Monitoring

**Purpose:** measure the success criteria (section 3) and find where customers drop out of the ordering flow.

**Principles**

- Send business events from the **server** (`posthog-node`) and keep the client script very light, to save mobile data.
- Use internal user IDs. **No phone numbers, names or addresses** in event properties.
- No session replay at launch (or fully masked if enabled).
- Margin, cash discrepancies and disputes come from the **database and the admin dashboard**, not from PostHog.

**Events (proposed)**

| Event                               | Properties                      | Measures                        |
| ----------------------------------- | ------------------------------- | ------------------------------- |
| `neighborhood_selected`             | neighborhood                    | Demand by area                  |
| `coverage_unavailable`              | neighborhood                    | Demand outside the service area |
| `coverage_requested`                | neighborhood                    | Expansion demand                |
| `house_viewed`                      | house                           | House popularity                |
| `cart_item_added`                   | house, item                     | Basket building                 |
| `checkout_started`                  | house, estimated total          | Funnel                          |
| `slot_unavailable`                  | house, slot                     | Lost demand                     |
| `order_placed`                      | source, house, amount, currency | Orders per week                 |
| `order_expired`                     | house                           | House acceptance rate           |
| `order_cancelled`                   | stage, reason                   | Cancellation rate               |
| `price_adjusted` / `price_declined` | house, difference               | Count accuracy                  |
| `order_delivered`                   | turnaround time                 | Service speed                   |
| `customer_reordered`                | days since last order           | Reorder rate                    |

**Funnel:** neighborhood → house → cart → checkout → order placed → accepted → delivered.

**Monitoring**

- Error tracking on the app and on every scheduled job.
- Alerts when orders expire repeatedly, when a job fails, or when the site is down.

---

## 23. Non-Functional Requirements (proposed targets)

- **Devices**: low-end Android phones (Chrome, Samsung Internet), recent iOS Safari, screens from 360 px wide.
- **Network**: usable on 3G. Customer pages (houses, cart, checkout) load under about 200 KB transferred and become usable within about 5 seconds on a throttled 3G profile. Photos are under about 300 KB after compression. Lists are paginated.
- **Offline**: the courier's mission list and actions work offline. On reconnection the server applies queued actions in order using server timestamps, rejects invalid transitions, and shows them to the courier for resolution.
- **Availability and recovery**: target 99% during service hours, daily database backups (check the point-in-time restore on the chosen Neon plan), and a written recovery procedure.
- **Security**: HTTPS only, role checks on the server, signed URLs for files, rate limiting, secrets in environment variables, audit log of admin actions, regular dependency updates.
- **Usability**: French and Swahili, touch targets of at least 44 px, readable contrast, plain wording.
- **Time**: timestamps in UTC, displayed in the Bukavu time zone.
- **Data**: orders and financial records are never hard-deleted.
- **Cost**: set a monthly infrastructure budget; use free tiers for the pilot; check how each paid service can be paid from the DRC.

---

## 24. Data Model

| Table                | Purpose                                                                                                                                                                                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`              | Accounts (email login) with role (customer, courier, house, admin), status (active / blocked) and profile contact phone; guest customers have a placeholder email, a phone number and no login                                                                                                             |
| `houses`             | Name, neighborhood, default commission %, minimum order, cut-off delay, turnaround time, daily capacity, optional coverage distance limit, open/closed                                                                                                                                                     |
| `house_members`      | Links a house account to its house                                                                                                                                                                                                                                                                         |
| `house_hours`        | House, weekday, opening and closing time                                                                                                                                                                                                                                                                   |
| `house_exclusions`   | House, item, fabric or category the house does not treat (e.g. leather, suede, delicate silk), note                                                                                                                                                                                                        |
| `house_closures`     | House, date or period, reason (holiday, temporary closure)                                                                                                                                                                                                                                                 |
| `services`           | Wash, iron, dry clean, etc.                                                                                                                                                                                                                                                                                |
| `items`              | Master list of articles (shirt, trousers, bed sheet), names in French and Swahili, category                                                                                                                                                                                                                |
| `item_requests`      | House, requested item or fabric, status (pending / approved / rejected), admin note                                                                                                                                                                                                                        |
| `fabrics`            | Master list of fabrics, names in French and Swahili                                                                                                                                                                                                                                                        |
| `house_items`        | House, service, item, fabric (all from the master lists), price (integer, currency), active                                                                                                                                                                                                                |
| `neighborhoods`      | Neighborhoods, each assigned to a zone, with a status (served / paused / not served) and a pause reason                                                                                                                                                                                                    |
| `zones`              | Delivery zones                                                                                                                                                                                                                                                                                             |
| `house_coverage`     | House, neighborhood, active, paused until                                                                                                                                                                                                                                                                  |
| `courier_zones`      | Courier, zone covered                                                                                                                                                                                                                                                                                      |
| `coverage_requests`  | Phone, neighborhood (chosen or typed), created at, notified at                                                                                                                                                                                                                                             |
| `zone_fees`          | **Matrix between zones**: (customer zone, house zone) → delivery fee and distance level                                                                                                                                                                                                                    |
| `orders`             | Customer, house, source, status, **idempotency key**, **tracking token**, pickup slot (start/end), delivery slot (start/end), estimated delivery, acceptance and reception deadlines, address + landmark, phone, currency, items total, adjusted total, delivery fee, **commission % and amount (frozen)** |
| `missions`           | Order, type (pickup / delivery), courier, slot, status, courier pay, completed at                                                                                                                                                                                                                          |
| `order_items`        | Service, item, fabric, **price frozen at order time**, quantities (declared, counted at pickup, received by house), condition note, status (accepted / returned)                                                                                                                                           |
| `order_events`       | Status history with timestamp, author, `on_behalf_of` when the admin acts for a house, and for approvals the method (app, on the spot, phone) and who recorded it                                                                                                                                          |
| `disputes`           | Order, type, notes, resolution, amount                                                                                                                                                                                                                                                                     |
| `cash_ledger`        | Cash collected per mission, courier and currency; owed to houses and owner; courier pay; deposits; change float; settlements                                                                                                                                                                               |
| `courier_profiles`   | Courier, cash ceiling, security deposit, change float, active                                                                                                                                                                                                                                              |
| `courier_shifts`     | Courier, weekday, start and end time                                                                                                                                                                                                                                                                       |
| `customer_addresses` | Customer, label, neighborhood, landmark, phone                                                                                                                                                                                                                                                             |
| `notifications`      | Recipient, channel, content, status, sent and read times                                                                                                                                                                                                                                                   |
| `order_photos`       | Order, item (optional), mission, type (pickup condition / delivery proof), storage key, author, date                                                                                                                                                                                                       |
| `consents`           | User, document (terms, privacy, photos), version, accepted at                                                                                                                                                                                                                                              |
| `settings`           | Defaults: commission, acceptance delay, reception window, slot length, cash ceiling, maximum coverage distance level, first-order screening on/off (default off)                                                                                                                                           |
| `exchange_rates`     | Date, currency pair, rate, set by                                                                                                                                                                                                                                                                          |

Rules: store money as integers in minor units; always store the currency on the order; freeze prices, commission and delivery fee on the order at creation or adjustment.

---

## 25. Screens by Role

**Customer**

- Neighborhood (with coverage check and coverage request) → house list → catalogue and basket → summary (items + delivery) → approve price adjustment → order tracking

**Courier**

- Mission list (pickup / delivery), item count at pickup, step validation, cash collected and balance owed (works offline)

**Admin**

- Dispatch (missions to assign, couriers on shift, orders waiting for acceptance), all orders, manual order entry, on-behalf actions
- Master catalogue and item requests, houses, neighborhoods and zones, fee matrix, commission rates, exchange rate
- Disputes, cash reconciliation and settlements

**House**

- Incoming orders (accept / reject), reception count, "ready" button, prices and availability, request for new items, opening hours and closures, excluded items

---

## 26. Pages & Routes

Next.js App Router. Routes are in English, grouped by role. A server-side guard checks the role on every area (`/house`, `/courier`, `/admin`). The language (French or Swahili) is stored in a cookie rather than in the URL **(proposed)**.

**Public & authentication**

| Route              | Page                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `/`                | Landing page with neighborhood selection                                                  |
| `/login`           | Sign in with email and password                                                           |
| `/register`        | Customer sign-up (email, password, phone number, consent)                                 |
| `/forgot-password` | Request a password reset link by email; the admin can also reset a password               |
| `/track/[token]`   | Public order tracking for guest customers (no login), including price adjustment approval |
| `/coverage`        | Check whether a neighborhood is covered; leave a coverage request                         |

**Customer**

| Route                       | Page                                                                          |
| --------------------------- | ----------------------------------------------------------------------------- |
| `/houses`                   | Nearby houses for the chosen neighborhood (hours, minimum order, open/closed) |
| `/houses/[houseId]`         | House catalogue by service, item and fabric, with excluded items              |
| `/cart`                     | Cart (single house) with estimated total                                      |
| `/checkout`                 | Slot, landmark, phone, server validation, confirmation                        |
| `/orders`                   | Order history                                                                 |
| `/orders/[orderId]`         | Tracking, photos, price adjustment approval, cancellation                     |
| `/orders/[orderId]/dispute` | Open a dispute                                                                |
| `/account`                  | Profile, saved addresses, language                                            |
| `/notifications`            | Inbox (also shown inside the house and courier dashboards)                    |

**House**

| Route                     | Page                                                                      |
| ------------------------- | ------------------------------------------------------------------------- |
| `/house`                  | Dashboard: orders waiting for acceptance, today's workload                |
| `/house/orders`           | Incoming and ongoing orders                                               |
| `/house/orders/[orderId]` | Accept or reject, view pickup photos, reception count, mark ready         |
| `/house/catalogue`        | Prices and availability for catalogue items; request a new item           |
| `/house/hours`            | Opening hours, closures, daily capacity, turnaround time                  |
| `/house/coverage`         | Neighborhoods the house serves within its distance limit, temporary pause |
| `/house/settings`         | Minimum order, excluded items, contact                                    |
| `/house/settlements`      | Amounts owed and paid                                                     |

**Courier**

| Route                           | Page                                                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `/courier`                      | Today's missions (pickups and deliveries)                                                                      |
| `/courier/missions/[missionId]` | Pickup: count, condition notes, photos, on-site price approval. Delivery: slot, delivery photo, cash collected |
| `/courier/cash`                 | Cash held, ceiling, settlements                                                                                |
| `/courier/history`              | Past missions and earnings                                                                                     |

Courier routes are cached by the courier-area service worker (a PWA layer) so they work offline, and updates sync later.

**Admin**

| Route                         | Page                                                                                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin`                      | Dashboard: orders by status, delays, disputes, cash                                                                                                       |
| `/admin/dispatch`             | Missions to assign, couriers on shift, orders waiting for acceptance with call and WhatsApp buttons                                                       |
| `/admin/orders`               | All orders with filters                                                                                                                                   |
| `/admin/orders/new`           | Manual order entry (WhatsApp / phone), uses the same validation as the app                                                                                |
| `/admin/orders/[orderId]`     | Order detail, photos, assign couriers to missions, edit status, notes                                                                                     |
| `/admin/houses`               | List of houses                                                                                                                                            |
| `/admin/houses/[houseId]`     | House profile, commission, catalogue, hours, exclusions                                                                                                   |
| `/admin/couriers`             | List of couriers                                                                                                                                          |
| `/admin/couriers/[courierId]` | Courier detail: shifts, zones, cash, deposit, discrepancies                                                                                               |
| `/admin/customers`            | Customer list                                                                                                                                             |
| `/admin/catalogue`            | Master lists of items and fabrics, house item requests                                                                                                    |
| `/admin/neighborhoods`        | Neighborhoods and their zones                                                                                                                             |
| `/admin/coverage`             | Neighborhood status (served / paused / not served), distance limit (global and per house), house and courier coverage, coverage requests ranked by demand |
| `/admin/delivery-fees`        | Fee matrix and distance levels between zones                                                                                                              |
| `/admin/disputes`             | List of disputes                                                                                                                                          |
| `/admin/disputes/[disputeId]` | Dispute detail and resolution                                                                                                                             |
| `/admin/cash`                 | Daily cash reconciliation                                                                                                                                 |
| `/admin/settlements`          | Payouts to houses and couriers                                                                                                                            |
| `/admin/users`                | Accounts, roles, password resets                                                                                                                          |
| `/admin/settings`             | Defaults: commission, acceptance delay, reception window, maximum coverage distance, first-order screening, daily exchange rate                           |

---

## 27. Acceptance Criteria

Each criterion becomes an automated or manual test.

**Checkout**

1. Given a slot outside the house's opening hours, when the customer submits, then the server refuses it and proposes the next available slot.
2. Given an item price changed after it was added to the cart, when the customer checks out, then the server refuses, shows the new price and asks for confirmation.
3. Given the same checkout is submitted twice with the same idempotency key, then exactly one order exists.
4. Given a total below the house's minimum, then the order is refused and the missing amount is shown.
5. Given the house's daily capacity is reached, then the slot is no longer offered.

**Acceptance** 6. Given an order waiting for acceptance, then the house is reminded at 50% of the delay, the admin is alerted at 75%, and the order becomes `expired` at 100% (opening hours only), with the cart kept for another house. 7. Given an unreachable house, when the admin accepts on its behalf, then the event stores `on_behalf_of`.

**Pickup and reception** 8. Given a courier count that differs from the order, then a price adjustment is created and washing cannot start until it is approved (app, on the spot or admin-recorded). 9. Given an item flagged valuable or damaged, then the pickup cannot be completed without at least one photo. 10. Given an item the house does not treat, then it is marked `returned`, removed from the total and listed on the delivery mission. 11. Given 1 hour of opening-hours time after reception with no reported discrepancy, then the job marks the order conforming exactly once.

**Delivery and cash** 12. Given a completed delivery, when the courier enters the cash collected, then the ledger is updated and the customer receives the amount message; if the amount differs from the total due, a discrepancy is flagged. 13. Given a courier whose held cash exceeds the ceiling, then no new delivery mission can be started until the courier settles.

**Offline, privacy and abuse** 14. Given an offline courier, then actions are queued and synced in order without duplicate events, and invalid ones are shown for resolution. 15. Given a house user, when an order is requested, then the response contains no phone number and no street address. 16. Given first-order screening is turned on (off by default), when a customer with no completed order places an order, then it stays `awaiting_confirmation` until the admin confirms it.

**Coverage** 17. Given a neighborhood that is not served, then no houses are listed and the customer can leave a coverage request, which appears in the admin's list. 18. Given a house that does not cover the customer's neighborhood, when a checkout is submitted for it anyway, then the server refuses it with an explanation. 19. Given a paused neighborhood, then new orders are refused with the reason, and orders already in progress continue. 20. Given a mission to assign, then only couriers covering both the customer's zone and the house's zone are offered. 21. Given the admin lowers the distance limit, then house coverage beyond it stops being offered (orders already placed are unaffected) and returns if the limit is raised again.

---

## 28. Pilot & Launch Plan (proposed)

**Phase 1: app pilot** (8 weeks, starts once the core tools work end to end)

- Customers order in the app; the admin enters WhatsApp and phone orders manually.
- 1 to 2 neighborhoods (coverage limited to them), 2 to 3 houses, 2 couriers.
- Target: 20 orders per week.
- **Checkpoint after the first 10 completed orders**: review cash discrepancies, house acceptance rate, admin minutes per order and failed pickups. Fix these before pushing growth.
- Measure against the success criteria in section 3.

**Phase 2: expansion** (when the success criteria are met)

- Open new neighborhoods, guided by coverage requests, and add houses.
- Then mobile money, reviews and the WhatsApp bot.

**Recruiting and training**

- Houses: visit each one, check quality and hours, sign the partner agreement.
- Couriers: reference check, courier agreement, deposit, a 30-minute training with a one-page guide in French and Swahili.
- First customers: referrals from early customers, WhatsApp groups, flyers at partner houses, and local businesses, guesthouses and organizations as early regular accounts.
- Support: one WhatsApp number, with a response target (to set).

---

## 29. Development Order

1. Database schema (Drizzle), authentication (better-auth), role guards, error tracking (Sentry)
2. **Order engine**: statuses, transition rules, shared validation function, `order_events`, with tests for the acceptance criteria
3. **Admin back-office**: master catalogue, houses, zones and fees, coverage, manual order entry, dispatch, on-behalf actions
4. **House interface**: prices, hours, coverage, incoming orders, reception count
5. **Customer app**: coverage check, houses, cart, checkout, tracking, guest tracking link
6. **Courier interface**: missions, pickup and delivery steps, cash entry, offline queue and service worker (PWA layer for couriers)
7. **File storage (R2)** and photo upload, added to the courier and house screens
8. **Cash ledger**, commissions, exchange rate, reconciliation
9. **Notifications** (including web push for houses) and scheduled jobs
10. Abuse controls and analytics events
11. **Phase 1 pilot** with 2 to 3 houses, then review the success criteria

**Decided:** the customer app is built before the pilot. Manual entry by the admin stays available for WhatsApp and phone orders.

---

## 30. Risks

| Risk                                                          | Impact        | Likelihood    | Mitigation                                                                                                   |
| ------------------------------------------------------------- | ------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| Cash loss or theft by couriers                                | High          | Medium        | Cash controls, deposit, daily settlement, mobile money later                                                 |
| Low demand                                                    | High          | Unknown       | Small initial coverage, early interviews, referrals, coverage requests as a demand signal                    |
| Courier trips cost more than they earn                        | Medium        | Medium        | Minimum order, zone fees, retry fee, break-even tracking                                                     |
| Houses lose or damage items                                   | High          | Medium        | Counts, photos, compensation cap, house agreement                                                            |
| Customers and houses bypass the platform                      | Medium        | Medium        | Hidden contact details, convenience, terms                                                                   |
| Power cuts and unstable network                               | Medium        | High          | Offline courier mode, light web app, closures, on-behalf actions                                             |
| Admin overload or single point of failure                     | Medium        | High          | Workload measurement, second admin, dispatcher role, automation                                              |
| Fake or abusive orders                                        | Medium        | Medium        | Limits, no-show blocking, phone verification, optional first-order screening                                 |
| Customers or staff without an email address                   | Medium        | Medium        | Orders entered by the admin as guest customers, optional phone sign-in, admin-controlled addresses for staff |
| Currency and exchange-rate swings                             | Medium        | Medium        | Base currency, frozen rate, admin daily rate                                                                 |
| Courier safety (evenings, some areas)                         | High          | Low to medium | Daytime slots, shift rules, check-ins, local security advice                                                 |
| Legal or tax non-compliance                                   | High          | Unknown       | See section 31; consult a local advisor                                                                      |
| Third-party service outage or payment difficulty from the DRC | Medium        | Medium        | Free tiers, small service set for the pilot, alternatives                                                    |
| Data breach (phones, photos)                                  | High          | Low           | Access control, signed URLs, retention limits, minimal data                                                  |
| Rain and traffic delaying pickups                             | Low to medium | High          | Slot buffers, delay policy, customer messages                                                                |

---

## 31. Legal, Privacy & Compliance

This section lists topics to verify with a local lawyer or accountant. It is not legal advice, and local rules in the DRC have not been checked here.

**Business**

- Registration and licences needed to operate the platform, and tax obligations on commission and delivery income (to verify).
- The name **SafiHub**: check that it is free to use as a business name and trademark, and secure the domain name and social media handles (to verify).
- Courier status (employee or contractor), contracts, protective equipment and insurance for cash and accidents (to verify).
- **Partner house agreement**: prices, commission, service levels, compensation cap, liability for loss and damage, no direct dealing with platform customers, termination.

**Terms and consent**

- Terms of service and privacy policy in French and Swahili: cancellation, fees, compensation, disputes, photos.
- Acceptance is recorded in `consents` with the document version and date.

**Personal data**

- Collected: name, phone, neighborhood, landmark, order contents, photos, courier cash records. Collect the minimum.
- Access follows the permissions matrix. Files are private. No phone numbers go to analytics.
- Applicable data-protection rules in the DRC (to verify).

**Photos**

- Only clothes: no faces, ID documents or home interiors. The customer is told that photos are taken at pickup.
- Retention (proposed): 90 days after delivery, or until a dispute closes, then deleted.

**Retention and deletion (proposed)**

- Orders and financial records are kept as long as accounting and tax rules require (to verify).
- Contact data of inactive customers is deleted after a period to set. A customer can request a copy or deletion of personal data, and financial records are then anonymized.

**Payments**

- Cash handling is recorded in the ledger. Mobile money later needs a provider agreement and compliance checks (to verify).

---

## 32. Open Decisions (Resolved & Fixed for Launch)

**Business**

- **USD Acceptance & Exchange Rate:** Decided. Base currency is CDF. USD accepted cash-on-delivery. Daily admin rate set on `/admin/settings` (frozen on order creation). Rounding unit: 500 CDF (no small change bills below 500 CDF in Bukavu).
- **Commission, Minimums, Pay & Delivery Fees:** Decided. Default commission: 20% (2000 bps). Minimum order amount: 10,000 CDF. Courier pay per leg: 2,500 CDF per completed mission. Delivery fee grid: Zone 1 (same zone): 3,000 CDF; Zone 2 (adjacent): 5,000 CDF; Zone 3: 8,000 CDF.
- **Compensation & Cancellation:** Decided. Maximum compensation cap: 10x the item cleaning price (capped at 50,000 CDF / item). Cancellation before courier dispatch: free (0 CDF). Failed pickup due to customer absence: 2,000 CDF retry fee added on next order.

**Operations**

- **Cash Ceiling & Security Deposit:** Decided. Cash ceiling: 140,000 CDF (~50 USD) locks new delivery missions. Courier security deposit: 50 USD held upon contract signing, released 30 days after contract termination. Daily change float: 20,000 CDF issued each morning. Settlement frequency: Bi-weekly (1st and 15th of each month).
- **House Hours, Turnaround & Capacity:** Decided. Default partner opening hours: Monday to Saturday 08:00 - 18:00 (Sunday closed). Cut-off delay: 60 minutes before closing. Standard turnaround: 24 to 48 hours. Daily capacity: 30 items per house per day.
- **Courier Shifts & Slot Length:** Decided. Slots are 2 hours (08:00-10:00, 10:00-12:00, 14:00-16:00, 16:00-18:00). Shifts: Morning shift (08:00 - 13:00), Afternoon shift (13:00 - 18:00).
- **Owner Laundry Listing:** Decided. Owner pressing listed alongside partner houses with equal priority and identical 20% internal accounting commission.
- **Operational Timers Confirmed:** Decided. Acceptance delay: 45 minutes (ticks only during opening hours; reminder at 50%, admin escalation at 75%). Reception conforming window: 60 minutes. First-order screening: Off by default (configurable by admin). Delivery confirmation code: 4-digit numeric code generated by server upon delivery mission assignment.
- **Zones & Catalogue:** Decided. Bukavu divided into 3 zones: Zone 1 (Ibanda: Ndendere, Muhumba, Nyalukemba, Panzi), Zone 2 (Kadutu: Nyamugo, Kasali, Mosala, Cimpunda), Zone 3 (Bagira: Lumumba, Kasha). Master catalogue: 15 core clothing items across 4 fabric types and 3 services.
- **Item Limits & Photo Rules:** Decided. Maximum items per order: 50 items. Mandatory photos for items flagged damaged or valuable prior to pickup. Maximum 5 photos per order, compressed locally to <1280px WebP (<300 KB), EXIF scrubbed.

**Technical**

- **Job Service, Push, SMS:** Decided. Delayed jobs: Inngest (`src/inngest/`). Push notifications: Web Push API (`web-push` VAPID) for partner houses and couriers. Critical SMS: Africa's Talking / Twilio fallback.
- **Auth & Accounts:** Decided. Email + password default via better-auth with customer contact phone. House and courier staff accounts provisioned by admin via `/admin/users` or `/admin/couriers`.
- **Analytics Privacy:** Decided. PostHog EU cloud with zero PII (no phone numbers, no names, no exact addresses sent). Session replay disabled.
- **Coverage Policy:** Decided. Admin sets served neighborhoods and zone fee matrix. Global distance level cap default: 2. Houses can decline coverage for specific remote neighborhoods if desired.

**Legal and launch**

- **Legal Compliance:** Decided. Terms of service, privacy policy, and photo consent screen live in French, English, and Swahili. 90-day automatic photo purge on Cloudflare R2.
- **Pilot Scope:** Decided. Phase 1 (8 weeks) starts in Ibanda (Ndendere, Muhumba) with 2 partner laundries (Pressing du Lac, Pressing Kivu Clean), 2 trained couriers with safety equipment, targeting 20 orders/week.

---

## 33. Version History

| Version | Main changes                                                                                                                                                                              |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | Product definition, stack, data model, screens                                                                                                                                            |
| 2       | Price adjustment, exit statuses, disputes, cash controls, success criteria                                                                                                                |
| 3 to 4  | MVP merged; expanded cash controls                                                                                                                                                        |
| 5 to 6  | Service hours, cart validation, acceptance delay, item verification, pages and routes                                                                                                     |
| 7       | Notifications, scheduled jobs, guest customers, missions, zones, master catalogue                                                                                                         |
| 8       | File storage in the MVP, services and analytics                                                                                                                                           |
| 9       | Decision log, transition table, permissions, abuse controls, operations, non-functional requirements, acceptance criteria, pilot plan, risks, legal, currency, unit economics, phased MVP |
| 9.1     | Base currency set to CDF; the house's acceptance confirms every order (admin screening optional, off by default)                                                                          |
| 9.2     | The customer app is built before the pilot; coverage zones added; pilot plan simplified                                                                                                   |
| 9.3     | The admin decides served neighborhoods; adjustable coverage distance limit with distance levels between zones                                                                             |
| 9.4     | Email + password is the default sign-in; the phone number plugin becomes optional                                                                                                         |
| 9.5     | Web app first; PWA layers kept and added by role                                                                                                                                          |
| 9.6     | The app is named SafiHub                                                                                                                                                                  |
