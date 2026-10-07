# Order Engine & Lifecycle Guide

This document describes SafiHub's central order state machine, lifecycle transitions, opening-hours aware timers, three-point item verification, and mission dispatching.

---

## 1. Complete Order State Machine

Every order in SafiHub progresses through a strictly validated state machine:

```text
[awaiting_confirmation]  (optional screening toggle)
         │ (admin confirms)
         ▼
     created  ◄────────────────────────────── (Customer places order)
         │
         ├──(house accepts / admin on behalf)──────► accepted
         ├──(house rejects)────────────────────────► rejected [Exit]
         ├──(deadline passes during open hours)────► expired  [Exit: cart preserved]
         └──(cancelled before pickup)──────────────► cancelled [Exit]
                                                        │
                                                        ▼
                                                  pickup assigned
                                                        │
                                                        ▼
                                                pickup in progress
                                                        │
                                                        ├──(customer absent)──► pickup_failed [Exit]
                                                        ▼
                                                    picked up
                                                        │ (courier on-site count)
                                                        ▼
                                                    received
                                                        │ (house inspection)
                                                        ├──(gap flagged)──► price adjusted
                                                        │                         │
                                                        │                         ├──(approved)──► washing
                                                        │                         └──(declined)──► price_declined [Exit]
                                                        │
                                                        └──(conforming / 1h timeout)──► washing
                                                                                          │
                                                                                          ▼
                                                                                        ready
                                                                                          │
                                                                                          ▼
                                                                              delivery slot confirmed
                                                                                          │
                                                                                          ▼
                                                                                  delivery assigned
                                                                                          │
                                                                                          ▼
                                                                                delivery in progress
                                                                                          │
                                                                                          ├──(customer absent)──► delivery_failed [Rescheduled]
                                                                                          ▼
                                                                                      delivered [Complete]
```

*(Any active order can transition to `disputed` if loss, damage, or cash mismatch occurs).*

---

## 2. Status Transitions & Authorization Matrix

| Transition | Allowed Actor | Required Conditions & System Effects |
| :--- | :--- | :--- |
| `awaiting_confirmation` $\rightarrow$ `created` | Admin | Optional screening: admin confirms customer legitimacy via phone/WhatsApp. |
| `awaiting_confirmation` $\rightarrow$ `cancelled` | Admin | Customer unreachable or refused during initial screening. |
| `created` $\rightarrow$ `accepted` | House, Admin (on behalf) | Must be accepted before the 45-minute opening-hours deadline. |
| `created` $\rightarrow$ `rejected` | House, Admin (on behalf) | Mandatory rejection reason. Customer cart is preserved. |
| `created` $\rightarrow$ `expired` | Inngest (System) | 45 minutes of opening-hours elapsed without house response. Customer can switch houses with 1 tap. |
| `created` $\rightarrow$ `cancelled` | Customer, Admin | Free cancellation before acceptance. |
| `accepted` $\rightarrow$ `pickup_assigned` | Admin | Assigned to courier on shift covering both customer & house zones. |
| `pickup_assigned` $\rightarrow$ `pickup_in_progress` | Courier | Courier starts travel during scheduled pickup slot. |
| `pickup_in_progress` $\rightarrow$ `picked up` | Courier | Courier records physical count with customer; captures photos of valuable/damaged items. |
| `pickup_in_progress` $\rightarrow$ `pickup_failed` | Courier | Customer absent or unreachable. Failed attempt counter increments. |
| `picked up` $\rightarrow$ `received` | House, Admin (on behalf) | Laundry bag arrived at facility; house begins count verification. |
| `received` $\rightarrow$ `price_adjusted` | House, Courier, Admin | Count or fabric discrepancy flagged. Freezes adjusted total. |
| `price_adjusted` $\rightarrow$ `washing` | Customer, Courier (on-site), Admin (phone) | Customer approves adjusted price. Logs approval method & recorder. |
| `price_adjusted` $\rightarrow$ `price_declined` | Customer, Admin | Customer rejects price adjustment. Items marked for return delivery. |
| `received` $\rightarrow$ `washing` | House, Inngest (System) | Items match declared count, or 1 hour of open time passes with no gap reported. |
| `washing` $\rightarrow$ `ready` | House, Admin (on behalf) | Laundry cleaned and packaged. Triggers delivery slot proposal. |
| `ready` $\rightarrow$ `delivery_slot_confirmed` | Customer, Admin | Customer confirms proposed delivery slot or chooses next available slot. |
| `delivery_slot_confirmed` $\rightarrow$ `delivery_assigned` | Admin | Delivery mission assigned to active on-shift courier. |
| `delivery_assigned` $\rightarrow$ `delivery_in_progress` | Courier | Courier begins delivery leg. Customer tracking displays 4-digit `deliveryCode`. |
| `delivery_in_progress` $\rightarrow$ `delivered` | Courier | Courier inputs `deliveryCode` and records cash collected in `cash_ledger`. |
| `delivery_in_progress` $\rightarrow$ `delivery_failed` | Courier | Customer absent at delivery. Triggers rescheduling flow. |
| *Any active status* $\rightarrow$ `disputed` | Customer, House, Admin | Opens formal dispute record; halts payout settlements. |

---

## 3. Opening-Hours Aware Timers & Deadlines

Standard Unix timestamp math (`Date.now() + 45min`) is **strictly forbidden** for operational deadlines in SafiHub. All operational timers pause outside of a laundry house's verified opening hours.

### The 45-Minute Acceptance Timer (`orders.acceptanceDeadline`)
- **Opening Hours Only:** If an order is created at 5:30 PM and the house closes at 6:00 PM, 30 minutes expire today. The remaining 15 minutes roll over to the next morning starting at the house's opening time (e.g. 8:00 AM $\rightarrow$ deadline is 8:15 AM).
- **Escalation Milestones (Inngest Delayed Events):**
  - **50% of delay (~22.5 mins):** Inngest dispatches a reminder push notification and in-app alert to the house.
  - **75% of delay (~33.75 mins):** Inngest alerts the admin dispatch board with WhatsApp/call action buttons to prompt the house.
  - **100% of delay (45 mins):** Inngest automatically transitions the order to `expired`.
- **Customer Recovery:** When an order expires, the customer is notified immediately and can re-route their cart to another nearby house in a single tap without rebuilding their laundry list.

### The 1-Hour Reception Window (`orders.receptionDeadline`)
- Once laundry is received by the house (`received`), a 1-hour opening-hours timer begins.
- The house must record discrepancies (damaged items, wrong fabrics, item count gaps) within this window.
- If 1 hour passes without reported discrepancies, an Inngest background job automatically marks the order as conforming and transitions it to `washing`.

---

## 4. Three-Point Item Verification System

Responsibility for clothing transfers cleanly across three custody checkpoints:

```text
Point 1: Customer Declaration
  └── Items, services, fabrics & declared quantities selected in cart.
Point 2: Courier Pickup Count
  └── Courier counts items physically with the customer.
  └── Condition notes (stains, tears, loose buttons) recorded.
  └── Photos required for valuable or damaged garments.
  └── Bag sealed with unique order label.
Point 3: House Reception Count
  └── House inspects incoming laundry sack against order items.
  └── Non-accepted items flagged as `returned`.
  └── Count differences trigger price adjustment.
```

### Non-Accepted Items vs. Price Adjustments
- **Excluded / Non-Accepted Items:** If a customer sends an item the house does not treat (e.g. leather, silk, rug), it is marked as `status: 'returned'`. It is completely **removed from the order total** (no cleaning charge) and packed to be returned with the clean laundry.
- **Price Adjustments:** Applied exclusively for fabric or quantity discrepancies. The order cannot enter `washing` until the customer approves the updated price.
- **Approval Auditability:** `order_events` records the approval method (`app`, `on_the_spot`, or `phone`) and the user ID who captured the confirmation.

---

## 5. Discrete Missions per Order

Every order comprises two independent missions executed by couriers:
1. **Pickup Mission (`missions.type = 'pickup'`):** Assigned when the house accepts the order. Completed when laundry is delivered to the house.
2. **Delivery Mission (`missions.type = 'delivery'`):** Assigned when the order reaches `delivery_slot_confirmed`. Completed when clean laundry and cash are exchanged.

Couriers receive per-leg pay (`missions.courierPay`) credited directly upon completion of each individual mission. A single order may have different couriers for pickup and delivery.

---

## 6. Admin On-Behalf-Of Actions

Because some partner laundry facilities in Bukavu may experience network downtime or lack smartphone connectivity:
- The admin back-office can execute actions on behalf of a house (accept, reject, record reception count, mark ready) after phone or WhatsApp communication.
- Every on-behalf action explicitly sets `order_events.onBehalfOf = houseId` and records admin rationale notes.
