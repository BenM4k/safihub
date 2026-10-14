import { describe, it, expect } from "vitest";
import type { OrderListItemRecord } from "@/dal";
import {
  enrichOrders,
  groupOrdersByPressing,
  filterAndSortGroups,
  filterAndSortOrders,
  type RelanceEventSummary,
} from "../dispatch-grouping";

describe("dispatch-grouping utility", () => {
  const now = new Date("2026-10-14T14:00:00Z");

  const sampleOrders: OrderListItemRecord[] = [
    {
      id: "ord-1",
      code: "SAF-1001",
      trackingToken: "trk-1",
      customerId: "cust-1",
      customerName: "Aimé Mukamba",
      customerPhone: "+243810000001",
      houseId: "house-a",
      houseName: "Pressing Étoile",
      housePhone: "+243810000010",
      neighborhoodId: "neigh-1",
      neighborhoodName: "Gombe",
      status: "created",
      source: "app",
      totalDue: 18000,
      currency: "CDF",
      itemsTotal: 15000,
      deliveryFee: 3000,
      commissionAmount: 2250,
      pickupSlotStart: new Date("2026-10-14T15:00:00Z"),
      pickupSlotEnd: new Date("2026-10-14T16:00:00Z"),
      createdAt: new Date("2026-10-14T12:00:00Z"), // 120 min ago -> critical (>90)
      acceptanceDeadlineAt: new Date("2026-10-14T12:45:00Z"),
    },
    {
      id: "ord-2",
      code: "SAF-1002",
      trackingToken: "trk-2",
      customerId: "cust-2",
      customerName: "Sarah Lukusa",
      customerPhone: "+243810000002",
      houseId: "house-a",
      houseName: "Pressing Étoile",
      housePhone: "+243810000010",
      neighborhoodId: "neigh-1",
      neighborhoodName: "Gombe",
      status: "created",
      source: "whatsapp",
      totalDue: 25000,
      currency: "CDF",
      itemsTotal: 22000,
      deliveryFee: 3000,
      commissionAmount: 3300,
      pickupSlotStart: new Date("2026-10-14T15:00:00Z"),
      pickupSlotEnd: new Date("2026-10-14T16:00:00Z"),
      createdAt: new Date("2026-10-14T13:10:00Z"), // 50 min ago -> warning (>45)
      acceptanceDeadlineAt: new Date("2026-10-14T13:55:00Z"),
    },
    {
      id: "ord-3",
      code: "SAF-1003",
      trackingToken: "trk-3",
      customerId: "cust-3",
      customerName: "Didier Kabila",
      customerPhone: "+243810000003",
      houseId: "house-b",
      houseName: "Lavomatique Moderne",
      housePhone: "+243810000020",
      neighborhoodId: "neigh-2",
      neighborhoodName: "Kintambo",
      status: "created",
      source: "app",
      totalDue: 12000,
      currency: "CDF",
      itemsTotal: 10000,
      deliveryFee: 2000,
      commissionAmount: 1500,
      pickupSlotStart: new Date("2026-10-14T15:00:00Z"),
      pickupSlotEnd: new Date("2026-10-14T16:00:00Z"),
      createdAt: new Date("2026-10-14T13:40:00Z"), // 20 min ago -> neutral (<45)
      acceptanceDeadlineAt: new Date("2026-10-14T14:25:00Z"),
    },
  ];

  const sampleRelances: Map<string, RelanceEventSummary[]> = new Map([
    [
      "ord-1",
      [
        {
          id: "rel-1",
          orderId: "ord-1",
          channel: "call",
          outcome: "no_answer",
          operatorId: "op-1",
          operatorName: "Patrice",
          createdAt: new Date("2026-10-14T13:48:00Z"), // 12 min ago -> recently relanced (<15 min)
          note: "Appel sans réponse",
        },
        {
          id: "rel-2",
          orderId: "ord-1",
          channel: "whatsapp",
          outcome: "pending",
          operatorId: "op-2",
          operatorName: "Marie",
          createdAt: new Date("2026-10-14T13:00:00Z"), // 60 min ago
          note: "Message WhatsApp",
        },
      ],
    ],
  ]);

  it("enriches orders with urgency and relance history", () => {
    const enriched = enrichOrders(sampleOrders, sampleRelances, now);
    expect(enriched).toHaveLength(3);

    // ord-1: 120 min ago, 2 relances, last relance 12 min ago by Patrice
    const ord1 = enriched.find((o) => o.id === "ord-1")!;
    expect(ord1.urgency.level).toBe("critical");
    expect(ord1.relanceCount).toBe(2);
    expect(ord1.lastRelanceBy).toBe("Patrice");
    expect(ord1.lastOutcome).toBe("no_answer");
    expect(ord1.isRecentlyRelanced).toBe(true);
    expect(ord1.recentRelanceMinutes).toBe(12);
    expect(ord1.canReassign).toBe(true); // 2 relances

    // ord-3: 20 min ago, 0 relances
    const ord3 = enriched.find((o) => o.id === "ord-3")!;
    expect(ord3.urgency.level).toBe("neutral");
    expect(ord3.relanceCount).toBe(0);
    expect(ord3.isRecentlyRelanced).toBe(false);
    expect(ord3.canReassign).toBe(false);
  });

  it("groups orders by pressing and sorts groups by oldest pending order", () => {
    const enriched = enrichOrders(sampleOrders, sampleRelances, now);
    const groups = groupOrdersByPressing(enriched, now);

    expect(groups).toHaveLength(2);

    // Group 1 should be house-a (oldest order createdAt 12:00 vs house-b 13:40)
    expect(groups[0].houseId).toBe("house-a");
    expect(groups[0].houseName).toBe("Pressing Étoile");
    expect(groups[0].pendingCount).toBe(2);
    expect(groups[0].urgencyLevel).toBe("critical"); // oldest is 120 min
    expect(groups[0].relanceCount).toBe(2);
    expect(groups[0].isRecentlyRelanced).toBe(true);
    expect(groups[0].lastRelanceBy).toBe("Patrice");

    // Group 2 should be house-b
    expect(groups[1].houseId).toBe("house-b");
    expect(groups[1].pendingCount).toBe(1);
    expect(groups[1].urgencyLevel).toBe("neutral");
  });

  it("filters groups by search keyword across pressing and customer", () => {
    const enriched = enrichOrders(sampleOrders, sampleRelances, now);
    const groups = groupOrdersByPressing(enriched, now);

    // Search by pressing name
    const f1 = filterAndSortGroups(groups, { search: "Moderne" });
    expect(f1).toHaveLength(1);
    expect(f1[0].houseId).toBe("house-b");

    // Search by customer name
    const f2 = filterAndSortGroups(groups, { search: "Lukusa" });
    expect(f2).toHaveLength(1);
    expect(f2[0].houseId).toBe("house-a");

    // Search by code
    const f3 = filterAndSortGroups(groups, { search: "1003" });
    expect(f3).toHaveLength(1);
    expect(f3[0].houseId).toBe("house-b");
  });

  it("filters groups by delay and relance criteria", () => {
    const enriched = enrichOrders(sampleOrders, sampleRelances, now);
    const groups = groupOrdersByPressing(enriched, now);

    // Filter overdue (> 45 min)
    const overdue = filterAndSortGroups(groups, { delayFilter: "overdue" });
    expect(overdue).toHaveLength(1);
    expect(overdue[0].houseId).toBe("house-a");

    // Filter critical (> 90 min)
    const critical = filterAndSortGroups(groups, { delayFilter: "critical" });
    expect(critical).toHaveLength(1);
    expect(critical[0].houseId).toBe("house-a");

    // Filter never relanced
    const neverRelanced = filterAndSortGroups(groups, { delayFilter: "never_relanced" });
    expect(neverRelanced).toHaveLength(1);
    expect(neverRelanced[0].houseId).toBe("house-b");
  });

  it("filters flat orders accurately", () => {
    const enriched = enrichOrders(sampleOrders, sampleRelances, now);

    const overdueOrders = filterAndSortOrders(enriched, { delayFilter: "overdue" });
    expect(overdueOrders).toHaveLength(2); // ord-1 (120m) and ord-2 (50m)

    const searchOrders = filterAndSortOrders(enriched, { search: "Didier" });
    expect(searchOrders).toHaveLength(1);
    expect(searchOrders[0].id).toBe("ord-3");
  });
});
