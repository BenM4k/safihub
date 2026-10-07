# Coverage & Zones Architecture Guide

This document describes SafiHub's geographic coverage model, zone-to-zone matrix routing, distance limits, courier zone assignments, and demand backlog tracking in Bukavu.

---

## 1. Three-Level Coverage Model

Because Bukavu lacks comprehensive, standardized street addresses, SafiHub models geographic coverage using a hierarchy of **neighborhoods** and **delivery zones**:

```text
Level 1: Platform Service Area (Admin Controlled)
  └── Admin marks neighborhoods as `served`, `paused`, or `not_served`.
  └── Houses and customers cannot create or expand platform neighborhoods.
        │
        ▼
Level 2: House Coverage (Facility Scope)
  └── Partner houses select which served neighborhoods they cover (`house_coverage`).
  └── Must fall within the house's maximum distance limit.
        │
        ▼
Level 3: Courier Coverage (Mission Feasibility)
  └── Couriers are assigned to specific delivery zones (`courier_zones`).
  └── A mission can only be dispatched to a courier covering BOTH customer and house zones.
```

---

## 2. Zones, Distance Levels & The Delivery Fee Matrix

Neighborhoods are grouped into delivery zones (e.g. Zone Ibanda, Zone Kadutu, Zone Bagira). 

### The Zone-to-Zone Matrix (`zone_fees`)
The fee matrix defines the delivery economics and distance metrics between every pair of zones:

| Column | Type | Description |
| :--- | :--- | :--- |
| `customerZoneId` | UUID | Zone where the customer's neighborhood is located. |
| `houseZoneId` | UUID | Zone where the laundry house is located. |
| `deliveryFee` | Integer (CDF) | Cost paid by the customer for roundtrip courier logistics. |
| `distanceLevel` | Integer (1–3) | Distance tier: `1` = same zone, `2` = adjacent zone, `3` = far zone. |

### Distance Limit Enforcement
1. **Global Ceiling:** Admin sets a global default maximum distance level in platform settings (e.g. `max_distance_level = 2`).
2. **Per-House Override:** Individual houses can have an explicit `maxDistanceLevel` in `houses`.
3. **Checkout Rejection:** If `zone_fees.distanceLevel > house.maxDistanceLevel`, the house is filtered out from customer listings. If submitted directly, the server rejects checkout.
4. **Dynamic Limit Adjustment:** If the admin lowers the distance limit, house coverage beyond that limit is automatically hidden without altering historical orders. Raising the limit immediately restores coverage.

---

## 3. Neighborhood Statuses & Operational Gating

Every neighborhood record in `neighborhoods` maintains an operational status:

### 1. `served`
- Fully active within SafiHub's operational footprint.
- Eligible houses are listed and customers can place orders.

### 2. `paused`
- Temporarily unavailable due to local conditions (e.g. torrential rains, landslides, civil security alerts, or courier shortages).
- **Rule:** Orders already in progress continue through fulfillment. New orders for this neighborhood are blocked at the server boundary.
- The UI displays `pauseReason` and the anticipated resumption time.

### 3. `not_served`
- Outside the current operational footprint of SafiHub.
- No houses are listed. The customer is guided to submit a coverage request.

---

## 4. Coverage Requests Demand Backlog (`coverage_requests`)

Instead of guessing where to expand next in Bukavu, SafiHub uses data-driven expansion driven by customer interest:

- **Capture:** When a visitor selects an unserved neighborhood on `/` or `/coverage`, they can submit their phone number.
- **Admin Prioritization:** The admin back-office (`/admin/coverage`) aggregates and ranks coverage requests by volume.
- **Notification on Launch:** When the admin transitions an unserved neighborhood to `served`, the back-office provides a pre-filled WhatsApp/SMS link to notify all waiting customers in that neighborhood.

---

## 5. Courier Zone Compatibility

When the admin dispatches a mission in `/admin/dispatch`:
- **Dual-Zone Requirement:** A mission involves travel between the customer's location and the house facility.
- **Filtering Logic:** The system filters eligible couriers using:
  ```sql
  WHERE courier_id IN (
    SELECT courier_id FROM courier_zones WHERE zone_id = :customerZoneId
  )
  AND courier_id IN (
    SELECT courier_id FROM courier_zones WHERE zone_id = :houseZoneId
  )
  AND courier_id IN (
    SELECT courier_id FROM courier_shifts 
    WHERE weekday = :currentDay AND :currentTime BETWEEN start_time AND end_time
  )
  ```
- If no courier covers both zones, the admin receives an explicit alert to adjust assignments or dispatch a cross-zone mission.
