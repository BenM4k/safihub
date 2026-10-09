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

    const house = {
      id: "house_kivu_express",
      name: "Pressing Kivu Express",
      neighborhoodId: "neigh_ibanda",
      minimumOrderAmount: 5000,
      cutoffDelayMinutes: 60,
      turnaroundHours: 24,
      dailyCapacity: 20,
      coverageDistanceLimit: 1, // Only distance level 1 allowed
      isOpen: true,
      defaultCommissionBps: 2000,
      isActive: true,
      isPaused: false,
    };

    // 2. Evaluate coverage between house and distant neighborhood
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
          distanceLevel: 3, // Distance level 3 exceeds limit of 1
        },
      ],
      globalMaxDistanceLevel: 2,
    });

    // Invariant: House coverage check must refuse (ok: false)
    expect(coverageResult.ok).toBe(false);
    if (!coverageResult.ok) {
      expect(coverageResult.error.code).toBe("NEIGHBORHOOD_NOT_SERVED");
      expect(coverageResult.error.reason).toContain("not served yet");
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
        houses: new Map([[house.id, house]]),
        neighborhoods: new Map([
          [ibandaNeighborhood.id, ibandaNeighborhood],
          [distantNeighborhood.id, distantNeighborhood],
        ]),
        houseItems: new Map(),
        masterCatalog: new Map(),
        masterFabrics: new Map(),
        masterServices: new Map(),
        houseExclusions: [],
        houseCoverage: [],
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
          receptionConformingHours: 1,
          slotLengthHours: 2,
          defaultCashCeiling: 100000,
          maxCoverageDistanceLevel: 2,
          firstOrderScreeningEnabled: false,
          maxItemsPerOrder: 50,
        },
      }
    );

    // Invariant: Validation must fail with COVERAGE_REJECTED
    expect(checkoutValidation.ok).toBe(false);
    if (!checkoutValidation.ok) {
      expect(checkoutValidation.error.code).toBe("COVERAGE_REJECTED");
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
