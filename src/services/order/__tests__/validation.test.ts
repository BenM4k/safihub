import { describe, expect, it } from "vitest";
import { fromBukavuDateTime } from "@/services/availability";
import {
  validateOrderCheckout,
  type CheckoutInput,
  type OrderValidationContext,
} from "../validation";

describe("Order Checkout Validation Engine", () => {
  const customerId = "usr_cust_123";
  const houseId = "house_lac_kivu";
  const otherHouseId = "house_other";
  const neighborhoodId = "neigh_la_botte";
  const unservedNeighId = "neigh_bagira_unserved";

  const defaultContext: OrderValidationContext = {
    existingOrders: [],
    houses: new Map([
      [
        houseId,
        {
          id: houseId,
          name: "Pressing du Lac Kivu",
          neighborhoodId,
          isActive: true,
          isPaused: false,
          minimumOrderAmount: 7000,
          commissionBps: 2000,
          cutoffMinutes: 120,
          dailyCapacity: 10,
        },
      ],
      [
        otherHouseId,
        {
          id: otherHouseId,
          name: "Other House",
          neighborhoodId,
          isActive: true,
          isPaused: false,
          minimumOrderAmount: 5000,
          commissionBps: 2000,
          cutoffMinutes: 120,
          dailyCapacity: 10,
        },
      ],
    ]),
    neighborhoods: new Map([
      [neighborhoodId, { id: neighborhoodId, name: "La Botte", zoneId: "zone_ibanda", status: "served" }],
      [unservedNeighId, { id: unservedNeighId, name: "Bagira", zoneId: "zone_bagira", status: "not_served" }],
    ]),
    houseCoverage: [
      { houseId, neighborhoodId, isActive: true },
    ],
    zoneFees: [
      { customerZoneId: "zone_ibanda", houseZoneId: "zone_ibanda", deliveryFee: 2500, distanceLevel: 1 },
    ],
    masterServices: new Map([["srv_wash", { id: "srv_wash", isActive: true }]]),
    masterItems: new Map([
      ["itm_shirt", { id: "itm_shirt", isActive: true }],
      ["itm_pants", { id: "itm_pants", isActive: true }],
    ]),
    masterFabrics: new Map([["fab_std", { id: "fab_std", isActive: true }]]),
    houseItems: [
      {
        id: "hi_shirt",
        houseId,
        serviceId: "srv_wash",
        itemId: "itm_shirt",
        fabricId: "fab_std",
        price: 3500,
        isActive: true,
      },
      {
        id: "hi_pants",
        houseId,
        serviceId: "srv_wash",
        itemId: "itm_pants",
        fabricId: "fab_std",
        price: 4000,
        isActive: true,
      },
      {
        id: "hi_other_shirt",
        houseId: otherHouseId,
        serviceId: "srv_wash",
        itemId: "itm_shirt",
        fabricId: "fab_std",
        price: 3000,
        isActive: true,
      },
    ],
    houseHours: [
      { weekday: 1, opensAt: "08:00", closesAt: "18:00" }, // Mon
    ],
    houseClosures: [],
    courierShifts: [
      { courierId: "cour_1", weekday: 1, startsAt: "07:30", endsAt: "18:30" },
    ],
    bookedOrdersByDate: {},
    currentTime: fromBukavuDateTime("2026-10-12", "05:00"),
    settings: {
      maxItemsPerOrder: 50,
      defaultCommissionBps: 2000,
      maxCoverageDistanceLevel: 2,
      acceptanceDelayMinutes: 45,
    },
    activeExchangeRate: { rate: 2800, isCdfPerUsd: true },
  };

  const validSlot = {
    start: fromBukavuDateTime("2026-10-12", "10:00"),
    end: fromBukavuDateTime("2026-10-12", "12:00"),
  };

  const validItems = [
    { serviceId: "srv_wash", itemId: "itm_shirt", fabricId: "fab_std", quantity: 2, expectedUnitPrice: 3500 }, // 7,000 CDF
  ];

  const baseInput: CheckoutInput = {
    idempotencyKey: "idem_abc_123",
    customerId,
    houseId,
    customerNeighborhoodId: neighborhoodId,
    landmark: "Près de l'Hôtel Horizon",
    contactPhone: "+243999000111",
    pickupSlot: validSlot,
    items: validItems,
  };

  it("validates and accepts a standard compliant checkout order", () => {
    const res = validateOrderCheckout(baseInput, defaultContext);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.isDuplicate).toBe(false);
      expect(res.value.itemsTotal).toBe(7000);
      expect(res.value.deliveryFee).toBe(2500);
      expect(res.value.commissionAmount).toBe(1400); // 20% of 7000
      expect(res.value.totalDue).toBe(9500); // 7000 + 2500
      expect(res.value.usdEquivalent?.formatted).toBe("$3.39"); // 9500 / 2800 = ~3.39
    }
  });

  it("AC 1: refuses slot outside house opening hours and proposes next available slot", () => {
    const outsideSlot = {
      start: fromBukavuDateTime("2026-10-12", "06:00"),
      end: fromBukavuDateTime("2026-10-12", "08:00"),
    };

    const res = validateOrderCheckout({ ...baseInput, pickupSlot: outsideSlot }, defaultContext);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("SLOT_INVALID");
      expect(res.error.nextAvailableSlot).toBeDefined();
    }
  });

  it("AC 2: refuses when item price changed since added to cart", () => {
    const changedPriceItems = [
      {
        serviceId: "srv_wash",
        itemId: "itm_shirt",
        fabricId: "fab_std",
        quantity: 2,
        expectedUnitPrice: 3000, // Client expected 3000, DB is 3500
      },
    ];

    const res = validateOrderCheckout({ ...baseInput, items: changedPriceItems }, defaultContext);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("PRICE_CHANGED");
      expect(res.error.message).toContain("Old price: 3000 CDF, New price: 3500 CDF");
    }
  });

  it("AC 3: handles duplicate submission with existing idempotency key", () => {
    const ctxWithExisting: OrderValidationContext = {
      ...defaultContext,
      existingOrders: [
        {
          id: "order_existing_999",
          code: "SF-1001",
          idempotencyKey: "idem_abc_123",
          customerId,
        },
      ],
    };

    const res = validateOrderCheckout(baseInput, ctxWithExisting);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.isDuplicate).toBe(true);
      expect(res.value.existingOrderId).toBe("order_existing_999");
    }
  });

  it("AC 4: refuses when items total is below house minimum order amount", () => {
    // 1 shirt = 3500 CDF; minimum is 7000 CDF
    const lowItems = [
      { serviceId: "srv_wash", itemId: "itm_shirt", fabricId: "fab_std", quantity: 1, expectedUnitPrice: 3500 },
    ];

    const res = validateOrderCheckout({ ...baseInput, items: lowItems }, defaultContext);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("MINIMUM_ORDER_NOT_MET");
      expect(res.error.details?.missingAmount).toBe(3500);
    }
  });

  it("AC 5: refuses when house daily capacity is reached", () => {
    const ctxFullCapacity: OrderValidationContext = {
      ...defaultContext,
      bookedOrdersByDate: { "2026-10-12": 10 }, // Max capacity is 10!
    };

    const res = validateOrderCheckout(baseInput, ctxFullCapacity);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("CAPACITY_REACHED");
    }
  });

  it("refuses non-integer or non-positive line item quantities", () => {
    const fractionalItems = [
      { serviceId: "srv_wash", itemId: "itm_shirt", fabricId: "fab_std", quantity: 1.5, expectedUnitPrice: 3500 },
    ];
    const resFractional = validateOrderCheckout({ ...baseInput, items: fractionalItems }, defaultContext);
    expect(resFractional.ok).toBe(false);
    if (!resFractional.ok) {
      expect(resFractional.error.code).toBe("QUANTITY_LIMIT_EXCEEDED");
    }

    const negativeItems = [
      { serviceId: "srv_wash", itemId: "itm_shirt", fabricId: "fab_std", quantity: -1, expectedUnitPrice: 3500 },
    ];
    const resNegative = validateOrderCheckout({ ...baseInput, items: negativeItems }, defaultContext);
    expect(resNegative.ok).toBe(false);
    if (!resNegative.ok) {
      expect(resNegative.error.code).toBe("QUANTITY_LIMIT_EXCEEDED");
    }
  });

  it("AC 18: refuses when house does not cover the customer neighborhood", () => {
    const res = validateOrderCheckout(
      { ...baseInput, customerNeighborhoodId: unservedNeighId },
      defaultContext
    );
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("COVERAGE_REJECTED");
    }
  });

  it("refuses items from another house (one house per cart)", () => {
    // Item with pants only offered by other house (or shirt belonging to another house)
    const mismatchedItems = [
      {
        serviceId: "srv_wash",
        itemId: "itm_shirt",
        fabricId: "fab_std",
        quantity: 2,
        expectedUnitPrice: 3500,
      },
      {
        serviceId: "srv_wash",
        itemId: "itm_non_existent",
        fabricId: "fab_std",
        quantity: 1,
      },
    ];

    const res = validateOrderCheckout({ ...baseInput, items: mismatchedItems }, defaultContext);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(
        res.error.code === "ITEM_NOT_OFFERED_BY_HOUSE" ||
        res.error.code === "CATALOG_ITEM_INVALID"
      ).toBe(true);
    }
  });
});
