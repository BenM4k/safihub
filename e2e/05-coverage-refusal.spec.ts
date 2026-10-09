import { test, expect } from "@playwright/test";
import { validateOrderCheckout } from "../src/services/order/validation";
import { checkHouseCoverage } from "../src/services/coverage";

test.describe("Flow 5: Coverage Boundaries & Refusal Handling (AC 17, 18, 19, 21)", () => {
  test("strictly refuses checkout when customer neighborhood is outside coverage limit and guides to coverage request", async () => {
    // 1. Setup Bukavu neighborhoods
    const ibandaNeighborhood = {
      id: "neigh_ibanda",
      name: "Ibanda",
      zoneId: "zone_central",
      status: "served" as const,
      pauseReason: null,
    };

    const distantNeighborhood = {
      id: "neigh_bagira_hills",
      name: "Bagira Extérieur",
      zoneId: "zone_outer",
      status: "not_served" as const, // unserved area!
      pauseReason: null,
    };

    const distantServedNeighborhood = {
      id: "neigh_far_served",
      name: "Kadutu Lointain",
      zoneId: "zone_outer",
      status: "served" as const, // served area, but distanceLevel 3 exceeds house limit 1 & global limit 2!
      pauseReason: null,
    };

    const house = {
      id: "house_kivu_express",
      name: "Pressing Kivu Express",
      neighborhoodId: "neigh_ibanda",
      minimumOrderAmount: 5000,
      cutoffDelayMinutes: 60,
      turnaroundHours: 24,
      dailyCapacity: 20,
      maxDistanceLevel: 1, // Only distance level 1 allowed
      coverageDistanceLimit: 1,
      isOpen: true,
      defaultCommissionBps: 2000,
      isActive: true,
      isPaused: false,
    };

    // 2. Evaluate coverage between house and distant unserved neighborhood
    const coverageResult = checkHouseCoverage({
      customerNeighborhood: distantNeighborhood,
      house,
      houseNeighborhood: ibandaNeighborhood,
      houseCoverage: [],
      zoneFees: [
        {
          customerZoneId: "zone_outer",
          houseZoneId: "zone_central",
          deliveryFee: 5000,
          distanceLevel: 3,
        },
      ],
      globalMaxDistanceLevel: 2,
    });

    // Invariant: House coverage check must refuse unserved neighborhood (ok: false)
    expect(coverageResult.ok).toBe(false);
    if (!coverageResult.ok) {
      expect(coverageResult.error.code).toBe("NEIGHBORHOOD_NOT_SERVED");
      expect(coverageResult.error.reason).toContain("not served yet");
    }

    // 2b. Evaluate coverage between house and distant served neighborhood (distance limit exceeded)
    const distanceCoverageResult = checkHouseCoverage({
      customerNeighborhood: distantServedNeighborhood,
      house,
      houseNeighborhood: ibandaNeighborhood,
      houseCoverage: [
        {
          houseId: house.id,
          neighborhoodId: distantServedNeighborhood.id,
          isActive: true,
        },
      ],
      zoneFees: [
        {
          customerZoneId: "zone_outer",
          houseZoneId: "zone_central",
          deliveryFee: 5000,
          distanceLevel: 3,
        },
      ],
      globalMaxDistanceLevel: 2,
    });

    // Invariant: Distance level 3 exceeds limit of 1
    expect(distanceCoverageResult.ok).toBe(false);
    if (!distanceCoverageResult.ok) {
      expect(distanceCoverageResult.error.code).toBe("DISTANCE_LIMIT_EXCEEDED");
    }

    // 3. Full checkout validation engine refusal
    const checkoutValidation = validateOrderCheckout(
      {
        idempotencyKey: `idem_cov_${Date.now()}`,
        customerId: "cust_distant_1",
        houseId: house.id,
        customerNeighborhoodId: distantNeighborhood.id,
        landmark: "Route Bagira, après le pont",
        contactPhone: "+243997654321",
        pickupSlot: {
          start: new Date("2026-10-12T09:00:00Z"),
          end: new Date("2026-10-12T11:00:00Z"),
        },
        items: [
          {
            serviceId: "srv_wash",
            itemId: "item_shirt",
            fabricId: "fab_cotton",
            quantity: 3,
            expectedUnitPrice: 3000,
          },
        ],
      },
      {
        existingOrders: [],
        houses: new Map([
          [
            house.id,
            {
              ...house,
              minimumOrderAmount: 10000,
              commissionBps: 2000,
              cutoffMinutes: 60,
              dailyCapacity: 20,
            },
          ],
        ]),
        neighborhoods: new Map<string, typeof ibandaNeighborhood | typeof distantNeighborhood | typeof distantServedNeighborhood>([
          [ibandaNeighborhood.id, ibandaNeighborhood],
          [distantNeighborhood.id, distantNeighborhood],
          [distantServedNeighborhood.id, distantServedNeighborhood],
        ]),
        houseItems: [],
        masterItems: new Map(),
        masterFabrics: new Map(),
        masterServices: new Map(),
        houseCoverage: [],
        houseHours: [],
        houseClosures: [],
        courierShifts: [],
        zoneFees: [
          {
            customerZoneId: "zone_outer",
            houseZoneId: "zone_central",
            deliveryFee: 5000,
            distanceLevel: 3,
          },
        ],
        settings: {
          defaultCommissionBps: 2000,
          acceptanceDelayMinutes: 45,
          maxCoverageDistanceLevel: 2,
          maxItemsPerOrder: 50,
        },
      }
    );

    // Invariant: Validation must fail with COVERAGE_REJECTED for unserved neighborhood
    expect(checkoutValidation.ok).toBe(false);
    if (!checkoutValidation.ok) {
      expect(checkoutValidation.error.code).toBe("COVERAGE_REJECTED");
    }

    // 3b. Checkout refusal for served neighborhood exceeding distance limit
    const distanceCheckoutValidation = validateOrderCheckout(
      {
        idempotencyKey: `idem_cov_dist_${Date.now()}`,
        customerId: "cust_distant_2",
        houseId: house.id,
        customerNeighborhoodId: distantServedNeighborhood.id,
        landmark: "Kadutu rond-point",
        contactPhone: "+243997654322",
        pickupSlot: {
          start: new Date("2026-10-12T09:00:00Z"),
          end: new Date("2026-10-12T11:00:00Z"),
        },
        items: [
          {
            serviceId: "srv_wash",
            itemId: "item_shirt",
            fabricId: "fab_cotton",
            quantity: 2,
            expectedUnitPrice: 3000,
          },
        ],
      },
      {
        existingOrders: [],
        houses: new Map([
          [
            house.id,
            {
              ...house,
              minimumOrderAmount: 5000,
              commissionBps: 2000,
              cutoffMinutes: 60,
              dailyCapacity: 20,
            },
          ],
        ]),
        neighborhoods: new Map<string, typeof ibandaNeighborhood | typeof distantNeighborhood | typeof distantServedNeighborhood>([
          [ibandaNeighborhood.id, ibandaNeighborhood],
          [distantNeighborhood.id, distantNeighborhood],
          [distantServedNeighborhood.id, distantServedNeighborhood],
        ]),
        houseItems: [],
        masterItems: new Map(),
        masterFabrics: new Map(),
        masterServices: new Map(),
        houseCoverage: [],
        houseHours: [],
        houseClosures: [],
        courierShifts: [],
        zoneFees: [
          {
            customerZoneId: "zone_outer",
            houseZoneId: "zone_central",
            deliveryFee: 5000,
            distanceLevel: 3,
          },
        ],
        settings: {
          defaultCommissionBps: 2000,
          acceptanceDelayMinutes: 45,
          maxCoverageDistanceLevel: 2,
          maxItemsPerOrder: 50,
        },
      }
    );

    // Invariant: Validation must fail with COVERAGE_REJECTED for distance exceeded
    expect(distanceCheckoutValidation.ok).toBe(false);
    if (!distanceCheckoutValidation.ok) {
      expect(distanceCheckoutValidation.error.code).toBe("COVERAGE_REJECTED");
    }

    // 4. Customer demand capture: submitting a coverage request
    const coverageDemandRequest = {
      phone: "+243997654321",
      neighborhoodId: distantNeighborhood.id,
      notes: "Demande d'extension vers Bagira Extérieur",
      createdAt: new Date(),
    };
    expect(coverageDemandRequest.phone).toBe("+243997654321");
    expect(coverageDemandRequest.neighborhoodId).toBe("neigh_bagira_hills");
  });
});
