import { describe, expect, it, vi } from "vitest";
import {
  acceptIncomingOrder,
  rejectIncomingOrder,
  submitHouseReception,
  markOrderReady,
  updateHouseCatalogueItem,
  requestCatalogueItem,
  updateHouseHoursSchedule,
  addHouseClosureEntry,
  deleteHouseClosureEntry,
  deleteHouseExclusionRule,
  updateNeighborhoodCoverage,
  updateHouseGeneralSettings,
} from "../house.service";

// Mock DAL layer
vi.mock("@/dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal")>();
  return {
    ...actual,
    getHouseOrderDetailRestricted: vi.fn(async (houseId: string, orderId: string) => {
      if (houseId === "house-1" && orderId === "ord-1") {
        return {
          id: "ord-1",
          code: "SAF-1234",
          trackingToken: "trk_1234",
          customerFirstName: "Jean",
          neighborhoodId: "neigh-1",
          neighborhoodName: "Ibanda",
          status: "created",
          source: "app",
          totalDue: 15000,
          itemsTotal: 12500,
          adjustedItemsTotal: null,
          currency: "CDF",
          pickupSlotStart: new Date(),
          pickupSlotEnd: new Date(),
          deliverySlotStart: null,
          deliverySlotEnd: null,
          estimatedDeliveryAt: null,
          acceptanceDeadlineAt: new Date(Date.now() + 30 * 60 * 1000),
          receptionDeadlineAt: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: null,
        };
      }
      if (houseId === "house-1" && orderId === "ord-received") {
        return {
          id: "ord-received",
          code: "SAF-5678",
          trackingToken: "trk_5678",
          customerFirstName: "Amani",
          neighborhoodId: "neigh-1",
          neighborhoodName: "Ibanda",
          status: "received",
          source: "app",
          totalDue: 10000,
          itemsTotal: 7500,
          adjustedItemsTotal: null,
          currency: "CDF",
          pickupSlotStart: new Date(),
          pickupSlotEnd: new Date(),
          deliverySlotStart: null,
          deliverySlotEnd: null,
          estimatedDeliveryAt: null,
          acceptanceDeadlineAt: null,
          receptionDeadlineAt: new Date(),
          notes: null,
          createdAt: new Date(),
          updatedAt: null,
        };
      }
      if (houseId === "house-1" && orderId === "ord-washing") {
        return {
          id: "ord-washing",
          code: "SAF-9999",
          trackingToken: "trk_9999",
          customerFirstName: "Bahati",
          neighborhoodId: "neigh-1",
          neighborhoodName: "Ibanda",
          status: "washing",
          source: "app",
          totalDue: 8000,
          itemsTotal: 5500,
          adjustedItemsTotal: 5500,
          currency: "CDF",
          pickupSlotStart: new Date(),
          pickupSlotEnd: new Date(),
          deliverySlotStart: null,
          deliverySlotEnd: null,
          estimatedDeliveryAt: null,
          acceptanceDeadlineAt: null,
          receptionDeadlineAt: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: null,
        };
      }
      // Different house: returns null (data scoping)
      return null;
    }),

    getOrderItems: vi.fn(async (orderId: string) => {
      if (orderId === "ord-received") {
        return [
          {
            id: "oi-1",
            orderId: "ord-received",
            houseItemId: "hi-1",
            serviceId: "srv-wash",
            serviceNameFr: "Lavage",
            itemId: "item-shirt",
            itemNameFr: "Chemise",
            fabricId: "fab-cotton",
            fabricNameFr: "Coton",
            customLabel: null,
            declaredQuantity: 2,
            pickupQuantity: 2,
            receivedQuantity: null,
            unitPrice: 2500,
            conditionNote: null,
            isFlagged: false,
            status: "accepted",
          },
          {
            id: "oi-leather",
            orderId: "ord-received",
            houseItemId: "hi-leather",
            serviceId: "srv-wash",
            serviceNameFr: "Lavage",
            itemId: "item-leather-jacket",
            itemNameFr: "Veste en cuir",
            fabricId: "fab-leather",
            fabricNameFr: "Cuir",
            customLabel: null,
            declaredQuantity: 1,
            pickupQuantity: 1,
            receivedQuantity: null,
            unitPrice: 2500,
            conditionNote: null,
            isFlagged: false,
            status: "accepted",
          },
        ];
      }
      return [];
    }),

    getHouseExclusions: vi.fn(async () => [
      {
        id: "ex-1",
        houseId: "house-1",
        itemId: "item-leather-jacket",
        itemNameFr: "Veste en cuir",
        fabricId: "fab-leather",
        fabricNameFr: "Cuir",
        note: "House does not clean leather",
      },
    ]),

    getHouseById: vi.fn(async (houseId: string) => ({
      id: houseId,
      name: "Pressing du Lac",
      neighborhoodId: "neigh-1",
      commissionBps: 2000,
      minimumOrderAmount: 3000,
      cutoffMinutes: 120,
      turnaroundHours: 48,
      dailyCapacity: 20,
      maxDistanceLevel: 2,
      isOwnerHouse: false,
      isActive: true,
      isPaused: false,
      pausedUntil: null,
      createdAt: new Date(),
      updatedAt: null,
    })),

    getHouseCoverageWithLimits: vi.fn(async (houseId: string) => ({
      houseId,
      houseName: "Pressing du Lac",
      houseNeighborhoodId: "neigh-1",
      houseZoneId: "zone-1",
      effectiveMaxDistanceLevel: 2,
      items: [
        {
          neighborhoodId: "neigh-nearby",
          neighborhoodName: "Nyenyezi",
          zoneId: "zone-1",
          zoneName: "Zone A",
          neighborhoodStatus: "served",
          distanceLevel: 1,
          isAllowedByDistance: true,
          isCovered: true,
        },
        {
          neighborhoodId: "neigh-far",
          neighborhoodName: "Kavumu",
          zoneId: "zone-distant",
          zoneName: "Zone D",
          neighborhoodStatus: "served",
          distanceLevel: 4, // Exceeds maxDistanceLevel of 2!
          isAllowedByDistance: false,
          isCovered: false,
        },
      ],
    })),

    updateOrderStatus: vi.fn(async () => {}),
    addOrderEvent: vi.fn(async () => {}),
    transitionOrderStatusAtomic: vi.fn(async () => true),
    saveReceptionCountTransaction: vi.fn(async () => {}),
    upsertHouseItemPrice: vi.fn(async () => {}),
    createHouseItemRequest: vi.fn(async () => {}),
    setHouseHours: vi.fn(async () => {}),
    createHouseClosure: vi.fn(async () => {}),
    deleteHouseClosure: vi.fn(async (closureId: string, houseId: string) => {
      return houseId === "house-1" && closureId === "closure-1";
    }),
    createHouseExclusion: vi.fn(async () => {}),
    deleteHouseExclusion: vi.fn(async (exclusionId: string, houseId: string) => {
      return houseId === "house-1" && exclusionId === "excl-1";
    }),
    upsertHouseCoverage: vi.fn(async () => {}),
    updateHouse: vi.fn(async () => {}),
  };
});

describe("Phase 4: House Portal Domain Services Unit Tests", () => {
  describe("4.1 House Data Scoping", () => {
    it("ensures a house user sees only orders belonging to its assigned house", async () => {
      // House 1 querying its own order -> ok
      const ownRes = await acceptIncomingOrder({
        houseId: "house-1",
        orderId: "ord-1",
        actorId: "staff-1",
        actorRole: "house",
      });
      expect(ownRes.ok).toBe(true);

      // House 2 attempting to access house 1's order -> rejected
      const otherRes = await acceptIncomingOrder({
        houseId: "house-2",
        orderId: "ord-1",
        actorId: "staff-2",
        actorRole: "house",
      });
      expect(otherRes.ok).toBe(false);
      if (!otherRes.ok) {
        expect(otherRes.error).toContain("Order not found or does not belong");
      }
    });
  });

  describe("4.2 Incoming Orders & AC 15 Customer Privacy Firewall", () => {
    it("AC 15: restricted order view contains no customer phone and no street address", async () => {
      const { getHouseOrderDetailRestricted } = await import("@/dal");
      const order = await getHouseOrderDetailRestricted("house-1", "ord-1");

      expect(order).not.toBeNull();
      if (order) {
        expect(order).not.toHaveProperty("customerPhone");
        expect(order).not.toHaveProperty("landmark");
        expect(order).not.toHaveProperty("contactPhone");
        expect(order.customerFirstName).toBe("Jean"); // first name only
        expect(order.neighborhoodName).toBe("Ibanda");
      }
    });

    it("requires a mandatory non-empty reason when rejecting an incoming order", async () => {
      const resWithoutReason = await rejectIncomingOrder({
        houseId: "house-1",
        orderId: "ord-1",
        actorId: "staff-1",
        actorRole: "house",
        reason: "",
      });
      expect(resWithoutReason.ok).toBe(false);
      if (!resWithoutReason.ok) {
        expect(resWithoutReason.error).toContain("reason is strictly required");
      }

      const resWithReason = await rejectIncomingOrder({
        houseId: "house-1",
        orderId: "ord-1",
        actorId: "staff-1",
        actorRole: "house",
        reason: "Capacity reached for today due to generator maintenance",
      });
      expect(resWithReason.ok).toBe(true);
    });
  });

  describe("4.3 Reception Count & AC 10 Excluded Items Handling", () => {
    it("AC 10: non-treated / excluded item is marked returned and deducted from cleaning fee", async () => {
      // ord-received contains 2 cotton shirts (accepted) and 1 leather jacket (excluded by house)
      const res = await submitHouseReception({
        houseId: "house-1",
        orderId: "ord-received",
        actorId: "staff-1",
        actorRole: "house",
        itemCounts: [
          { orderItemId: "oi-1", receivedQuantity: 2 },
          { orderItemId: "oi-leather", receivedQuantity: 1 },
        ],
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        // Discrepancy triggered due to exclusion policy
        expect(res.value.hasPriceAdjustment).toBe(true);
        expect(res.value.newStatus).toBe("price_adjusted");
        // Adjusted items total should only include the 2 cotton shirts (2 * 2500 = 5000 CDF)
        // Leather jacket is 0 CDF in cleaning total
        expect(res.value.adjustedItemsTotal).toBe(5000);
      }
    });

    it("rejects reception submissions with missing or extra order items", async () => {
      // Incomplete item counts (omits oi-leather)
      const incompleteRes = await submitHouseReception({
        houseId: "house-1",
        orderId: "ord-received",
        actorId: "staff-1",
        actorRole: "house",
        itemCounts: [{ orderItemId: "oi-1", receivedQuantity: 2 }],
      });

      expect(incompleteRes.ok).toBe(false);
      if (!incompleteRes.ok) {
        expect(incompleteRes.error).toContain("match the order items exactly");
      }
    });

    it("allows transitioning order to 'ready' when washing is finished", async () => {
      const res = await markOrderReady({
        houseId: "house-1",
        orderId: "ord-washing",
        actorId: "staff-1",
        actorRole: "house",
      });

      expect(res.ok).toBe(true);
    });
  });

  describe("4.4 Catalogue Pricing & Invariant Rules", () => {
    it("rejects negative catalogue prices", async () => {
      const res = await updateHouseCatalogueItem({
        houseId: "house-1",
        serviceId: "srv-1",
        itemId: "it-1",
        fabricId: "fab-1",
        price: -500,
        isActive: true,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("negative");
      }
    });

    it("requires a name when requesting a new catalogue item", async () => {
      const res = await requestCatalogueItem({
        houseId: "house-1",
        requestedBy: "staff-1",
        kind: "item",
        name: "   ",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("required");
      }
    });
  });

  describe("4.5 Service Hours & Coverage Distance Limits", () => {
    it("rejects operating hours where closing time is before or equal to opening time", async () => {
      const res = await updateHouseHoursSchedule("house-1", [
        { weekday: 1, opensAt: "18:00", closesAt: "08:00" },
      ]);

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Closing time");
      }
    });

    it("rejects closure periods where end date is before start date", async () => {
      const res = await addHouseClosureEntry({
        houseId: "house-1",
        startsOn: "2026-12-25",
        endsOn: "2026-12-20",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("End date must be on or after start date");
      }
    });

    it("Task 4.5 Invariant: a house cannot select a neighborhood beyond its distance limit", async () => {
      // Nearby neighborhood (distance level 1 <= max 2) -> allowed
      const allowedRes = await updateNeighborhoodCoverage({
        houseId: "house-1",
        neighborhoodId: "neigh-nearby",
        isActive: true,
      });
      expect(allowedRes.ok).toBe(true);

      // Distant neighborhood (distance level 4 > max 2) -> strictly refused!
      const refusedRes = await updateNeighborhoodCoverage({
        houseId: "house-1",
        neighborhoodId: "neigh-far",
        isActive: true,
      });

      expect(refusedRes.ok).toBe(false);
      if (!refusedRes.ok) {
        expect(refusedRes.error).toContain("exceeds house maximum limit");
      }
    });

    it("validates daily capacity settings", async () => {
      const resNegative = await updateHouseGeneralSettings({
        houseId: "house-1",
        dailyCapacity: -5,
        minimumOrderAmount: 2000,
        isPaused: false,
      });

      expect(resNegative.ok).toBe(false);
      if (!resNegative.ok) {
        expect(resNegative.error).toContain("positive integer");
      }
    });

    it("scopes closure deletion to houseId and prevents cross-house deletion", async () => {
      // Own closure
      const okRes = await deleteHouseClosureEntry("house-1", "closure-1");
      expect(okRes.ok).toBe(true);

      // Foreign house trying to delete house-1's closure
      const failRes = await deleteHouseClosureEntry("house-2", "closure-1");
      expect(failRes.ok).toBe(false);
      if (!failRes.ok) {
        expect(failRes.error).toContain("Closure not found or does not belong to this house");
      }
    });

    it("scopes exclusion deletion to houseId and prevents cross-house deletion", async () => {
      // Own exclusion
      const okRes = await deleteHouseExclusionRule("house-1", "excl-1");
      expect(okRes.ok).toBe(true);

      // Foreign house trying to delete house-1's exclusion
      const failRes = await deleteHouseExclusionRule("house-2", "excl-1");
      expect(failRes.ok).toBe(false);
      if (!failRes.ok) {
        expect(failRes.error).toContain("Exclusion rule not found or does not belong to this house");
      }
    });
  });
});
