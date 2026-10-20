import { describe, expect, it, vi } from "vitest";
import { updateNeighborhoodCoverageBatch } from "../house.service";

// Mock DAL layer for testing service behavior
vi.mock("@/dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal")>();
  return {
    ...actual,
    getHouseCoverageWithLimits: vi.fn(async (houseId: string) => {
      if (houseId === "house-valid") {
        return {
          houseId: "house-valid",
          houseName: "Pressing du Lac",
          effectiveMaxDistanceLevel: 2,
          items: [
            {
              neighborhoodId: "neigh-1",
              neighborhoodName: "Nyenyezi",
              zoneId: "z-1",
              zoneName: "Ibanda",
              distanceLevel: 1,
              isAllowedByDistance: true,
              isCovered: true,
            },
            {
              neighborhoodId: "neigh-2",
              neighborhoodName: "Ndendere",
              zoneId: "z-1",
              zoneName: "Ibanda",
              distanceLevel: 1,
              isAllowedByDistance: true,
              isCovered: false,
            },
            {
              neighborhoodId: "neigh-far",
              neighborhoodName: "Cikonyi",
              zoneId: "z-3",
              zoneName: "Bagira",
              distanceLevel: 3,
              isAllowedByDistance: false, // Beyond level 2
              isCovered: false,
            },
          ],
        };
      }
      return null;
    }),
    upsertHouseCoverageBatch: vi.fn(async () => {
      return undefined;
    }),
  };
});

describe("Server-Side updateNeighborhoodCoverageBatch", () => {
  it("successfully updates coverage for eligible neighborhoods", async () => {
    const res = await updateNeighborhoodCoverageBatch({
      houseId: "house-valid",
      items: [
        { neighborhoodId: "neigh-1", isActive: false },
        { neighborhoodId: "neigh-2", isActive: true },
      ],
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.updatedCount).toBe(2);
    }
  });

  it("handles empty batch update gracefully", async () => {
    const res = await updateNeighborhoodCoverageBatch({
      houseId: "house-valid",
      items: [],
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.updatedCount).toBe(0);
    }
  });

  it("rejects attempt to activate a neighborhood that exceeds the distance limit", async () => {
    const res = await updateNeighborhoodCoverageBatch({
      houseId: "house-valid",
      items: [{ neighborhoodId: "neigh-far", isActive: true }],
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("dépasse la limite autorisée");
      expect(res.error).toContain("Cikonyi");
    }
  });

  it("returns error if house does not exist", async () => {
    const res = await updateNeighborhoodCoverageBatch({
      houseId: "house-unknown",
      items: [{ neighborhoodId: "neigh-1", isActive: true }],
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("Pressing introuvable");
    }
  });

  it("returns error if neighborhood is not recognized", async () => {
    const res = await updateNeighborhoodCoverageBatch({
      houseId: "house-valid",
      items: [{ neighborhoodId: "neigh-non-existent", isActive: true }],
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("Quartier introuvable");
    }
  });
});
