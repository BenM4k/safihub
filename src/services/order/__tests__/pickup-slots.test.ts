import { describe, expect, it, vi } from "vitest";
import { getCheckoutPickupSlots } from "../pickup-slots.service";
import * as contextModule from "../context";
import { fromBukavuDateTime } from "@/services/availability";

describe("getCheckoutPickupSlots", () => {
  const houseId = "house_test";
  const neighborhoodId = "neigh_cust";

  it("returns available slots when house is covered and eligible couriers are on shift", async () => {
    vi.spyOn(contextModule, "buildOrderValidationContext").mockResolvedValue({
      existingOrders: [],
      houses: new Map([
        [
          houseId,
          {
            id: houseId,
            name: "Test House",
            neighborhoodId: "neigh_house",
            isActive: true,
            isPaused: false,
            pausedUntil: null,
            maxDistanceLevel: 3,
            minimumOrderAmount: 5000,
            commissionBps: 1500,
            cutoffMinutes: 120,
            dailyCapacity: 20,
          },
        ],
      ]),
      neighborhoods: new Map([
        [
          "neigh_cust",
          { id: "neigh_cust", name: "Ibanda", zoneId: "zone_ibanda", status: "served", isServed: true, isPaused: false, pausedUntil: null },
        ],
        [
          "neigh_house",
          { id: "neigh_house", name: "Kadutu", zoneId: "zone_kadutu", status: "served", isServed: true, isPaused: false, pausedUntil: null },
        ],
      ]),
      houseCoverage: [
        { houseId, neighborhoodId: "neigh_cust", isActive: true, pausedUntil: null },
      ],
      zoneFees: [
        { customerZoneId: "zone_ibanda", houseZoneId: "zone_kadutu", distanceLevel: 1, deliveryFee: 3000 },
      ],
      masterServices: new Map(),
      masterItems: new Map(),
      masterFabrics: new Map(),
      houseItems: [],
      houseHours: [
        { houseId, weekday: 1, opensAt: "08:00", closesAt: "18:00" },
      ],
      houseClosures: [],
      courierShifts: [
        { courierId: "cour_1", weekday: 1, startsAt: "08:00", endsAt: "18:00" },
      ],
      courierZones: [
        { courierId: "cour_1", zoneId: "zone_ibanda" },
        { courierId: "cour_1", zoneId: "zone_kadutu" },
      ],
      currentTime: fromBukavuDateTime("2026-10-26", "06:00"),
      settings: {
        maxItemsPerOrder: 50,
        defaultCommissionBps: 1500,
        maxCoverageDistanceLevel: 3,
        acceptanceDelayMinutes: 45,
        leadTimeMinutes: 30,
      },
    });

    const res = await getCheckoutPickupSlots({
      houseId,
      neighborhoodId,
      referenceTime: fromBukavuDateTime("2026-10-26", "06:00"),
    });

    expect(res.slots.length).toBeGreaterThan(0);
  });

  it("returns no slots if courier does not cover both zones", async () => {
    vi.spyOn(contextModule, "buildOrderValidationContext").mockResolvedValue({
      existingOrders: [],
      houses: new Map([
        [
          houseId,
          {
            id: houseId,
            name: "Test House",
            neighborhoodId: "neigh_house",
            isActive: true,
            isPaused: false,
            pausedUntil: null,
            maxDistanceLevel: 3,
            minimumOrderAmount: 5000,
            commissionBps: 1500,
            cutoffMinutes: 120,
            dailyCapacity: 20,
          },
        ],
      ]),
      neighborhoods: new Map([
        [
          "neigh_cust",
          { id: "neigh_cust", name: "Ibanda", zoneId: "zone_ibanda", status: "served", isServed: true, isPaused: false, pausedUntil: null },
        ],
        [
          "neigh_house",
          { id: "neigh_house", name: "Kadutu", zoneId: "zone_kadutu", status: "served", isServed: true, isPaused: false, pausedUntil: null },
        ],
      ]),
      houseCoverage: [
        { houseId, neighborhoodId: "neigh_cust", isActive: true, pausedUntil: null },
      ],
      zoneFees: [
        { customerZoneId: "zone_ibanda", houseZoneId: "zone_kadutu", distanceLevel: 1, deliveryFee: 3000 },
      ],
      masterServices: new Map(),
      masterItems: new Map(),
      masterFabrics: new Map(),
      houseItems: [],
      houseHours: [
        { houseId, weekday: 1, opensAt: "08:00", closesAt: "18:00" },
      ],
      houseClosures: [],
      courierShifts: [
        { courierId: "cour_1", weekday: 1, startsAt: "08:00", endsAt: "18:00" },
      ],
      courierZones: [
        // Only covers customer zone, not house zone!
        { courierId: "cour_1", zoneId: "zone_ibanda" },
      ],
      currentTime: fromBukavuDateTime("2026-10-26", "06:00"),
      settings: {
        maxItemsPerOrder: 50,
        defaultCommissionBps: 1500,
        maxCoverageDistanceLevel: 3,
        acceptanceDelayMinutes: 45,
        leadTimeMinutes: 30,
      },
    });

    const res = await getCheckoutPickupSlots({
      houseId,
      neighborhoodId,
      referenceTime: fromBukavuDateTime("2026-10-26", "06:00"),
    });

    expect(res.slots).toHaveLength(0);
    expect(res.nextAvailableSlot).toBeNull();
  });
});
