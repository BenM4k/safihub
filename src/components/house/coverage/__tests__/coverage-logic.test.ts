import { describe, expect, it } from "vitest";
import type { HouseCoverageWithLimitsItem } from "@/dal";
import {
  getDistanceLevelLabel,
  getDistanceLevelShortLabel,
  type TriState,
  type CoverageDiff,
} from "../types";

// Mock data fixtures
const mockItems: HouseCoverageWithLimitsItem[] = [
  {
    neighborhoodId: "n-ibanda-1",
    neighborhoodName: "Nyenyezi",
    zoneId: "z-ibanda",
    zoneName: "Ibanda",
    neighborhoodStatus: "served",
    distanceLevel: 1,
    isAllowedByDistance: true,
    isCovered: true,
    deliveryFee: 2000,
    deliveryFeeCurrency: "CDF",
    activeOrdersCount: 2,
    orders30dCount: 15,
    demandCount: 0,
  },
  {
    neighborhoodId: "n-ibanda-2",
    neighborhoodName: "Ndendere",
    zoneId: "z-ibanda",
    zoneName: "Ibanda",
    neighborhoodStatus: "served",
    distanceLevel: 1,
    isAllowedByDistance: true,
    isCovered: false,
    deliveryFee: 2000,
    deliveryFeeCurrency: "CDF",
    activeOrdersCount: 0,
    orders30dCount: 8,
    demandCount: 5,
  },
  {
    neighborhoodId: "n-kadutu-1",
    neighborhoodName: "Nyamugo",
    zoneId: "z-kadutu",
    zoneName: "Kadutu",
    neighborhoodStatus: "served",
    distanceLevel: 2,
    isAllowedByDistance: true,
    isCovered: true,
    deliveryFee: 3000,
    deliveryFeeCurrency: "CDF",
    activeOrdersCount: 1,
    orders30dCount: 4,
    demandCount: 0,
  },
  {
    neighborhoodId: "n-bagira-far",
    neighborhoodName: "Cikonyi",
    zoneId: "z-bagira",
    zoneName: "Bagira",
    neighborhoodStatus: "served",
    distanceLevel: 3,
    isAllowedByDistance: false, // Exceeds limit 2
    isCovered: false,
    deliveryFee: 5000,
    deliveryFeeCurrency: "CDF",
    activeOrdersCount: 0,
    orders30dCount: 0,
    demandCount: 12,
  },
];

describe("1. Eligibility vs Distance Limit", () => {
  const effectiveMaxLimit = 2;

  it("marks quartiers at or below max distance as eligible", () => {
    const eligible = mockItems.filter(
      (item) => (item.distanceLevel ?? 999) <= effectiveMaxLimit
    );
    expect(eligible.map((i) => i.neighborhoodId)).toEqual([
      "n-ibanda-1",
      "n-ibanda-2",
      "n-kadutu-1",
    ]);
  });

  it("marks quartiers exceeding max distance as ineligible", () => {
    const ineligible = mockItems.filter(
      (item) => (item.distanceLevel ?? 999) > effectiveMaxLimit
    );
    expect(ineligible.length).toBe(1);
    expect(ineligible[0].neighborhoodId).toBe("n-bagira-far");
    expect(ineligible[0].isAllowedByDistance).toBe(false);
  });

  it("resolves correct textual definitions for each distance tier", () => {
    expect(getDistanceLevelLabel(1)).toBe("Même commune (Niveau 1)");
    expect(getDistanceLevelLabel(2)).toBe("Commune voisine (Niveau 2)");
    expect(getDistanceLevelLabel(3)).toBe("Commune éloignée (Niveau 3)");
    expect(getDistanceLevelShortLabel(1)).toBe("Même commune · Niv. 1");
    expect(getDistanceLevelShortLabel(null)).toBe("Niveau —");
  });
});

describe("2. Tri-state Group Logic", () => {
  function computeTriState(
    groupItems: HouseCoverageWithLimitsItem[],
    coveredMap: Record<string, boolean>
  ): TriState {
    const eligible = groupItems.filter((i) => i.isAllowedByDistance);
    if (eligible.length === 0) return "none";

    const selectedCount = eligible.filter((i) => Boolean(coveredMap[i.neighborhoodId])).length;
    if (selectedCount === 0) return "none";
    if (selectedCount === eligible.length) return "all";
    return "some";
  }

  const ibandaItems = mockItems.filter((i) => i.zoneId === "z-ibanda");

  it("returns 'some' when some eligible items in group are selected", () => {
    const coveredMap = {
      "n-ibanda-1": true,
      "n-ibanda-2": false,
    };
    expect(computeTriState(ibandaItems, coveredMap)).toBe("some");
  });

  it("returns 'all' when all eligible items in group are selected", () => {
    const coveredMap = {
      "n-ibanda-1": true,
      "n-ibanda-2": true,
    };
    expect(computeTriState(ibandaItems, coveredMap)).toBe("all");
  });

  it("returns 'none' when no eligible items in group are selected", () => {
    const coveredMap = {
      "n-ibanda-1": false,
      "n-ibanda-2": false,
    };
    expect(computeTriState(ibandaItems, coveredMap)).toBe("none");
  });

  it("ignores ineligible items in group tri-state calculation", () => {
    const bagiraGroup = [mockItems[3]]; // Cikonyi (distance level 3, ineligible)
    const coveredMap = { "n-bagira-far": false };
    expect(computeTriState(bagiraGroup, coveredMap)).toBe("none");
  });
});

describe("3. Dirty Tracking & Batch Diff Calculation", () => {
  function computeDiffs(
    items: HouseCoverageWithLimitsItem[],
    initialMap: Record<string, boolean>,
    currentMap: Record<string, boolean>
  ): CoverageDiff[] {
    const diffs: CoverageDiff[] = [];
    for (const it of items) {
      const prev = Boolean(initialMap[it.neighborhoodId]);
      const current = Boolean(currentMap[it.neighborhoodId]);
      if (prev !== current) {
        diffs.push({
          neighborhoodId: it.neighborhoodId,
          neighborhoodName: it.neighborhoodName,
          previousValue: prev,
          nextValue: current,
        });
      }
    }
    return diffs;
  }

  const initialMap: Record<string, boolean> = {
    "n-ibanda-1": true,
    "n-ibanda-2": false,
    "n-kadutu-1": true,
    "n-bagira-far": false,
  };

  it("produces empty diff when no modifications occurred", () => {
    const diffs = computeDiffs(mockItems, initialMap, initialMap);
    expect(diffs).toHaveLength(0);
  });

  it("tracks single item toggle in diff", () => {
    const currentMap = { ...initialMap, "n-ibanda-2": true };
    const diffs = computeDiffs(mockItems, initialMap, currentMap);

    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toEqual({
      neighborhoodId: "n-ibanda-2",
      neighborhoodName: "Ndendere",
      previousValue: false,
      nextValue: true,
    });
  });

  it("tracks multiple toggles and batch payload generation", () => {
    const currentMap = {
      ...initialMap,
      "n-ibanda-1": false,
      "n-ibanda-2": true,
    };
    const diffs = computeDiffs(mockItems, initialMap, currentMap);

    expect(diffs).toHaveLength(2);
    const batchPayload = diffs.map((d) => ({
      neighborhoodId: d.neighborhoodId,
      isActive: d.nextValue,
    }));
    expect(batchPayload).toEqual([
      { neighborhoodId: "n-ibanda-1", isActive: false },
      { neighborhoodId: "n-ibanda-2", isActive: true },
    ]);
  });
});

describe("4. Zero-Coverage Warning Safeguard", () => {
  function isZeroCoverage(coveredMap: Record<string, boolean>): boolean {
    return Object.values(coveredMap).filter(Boolean).length === 0;
  }

  it("detects when covered quartier count drops to zero", () => {
    const allDeselected = {
      "n-ibanda-1": false,
      "n-ibanda-2": false,
      "n-kadutu-1": false,
      "n-bagira-far": false,
    };
    expect(isZeroCoverage(allDeselected)).toBe(true);
  });

  it("does not trigger zero coverage warning when at least 1 quartier is active", () => {
    const partialCoverage = {
      "n-ibanda-1": true,
      "n-ibanda-2": false,
      "n-kadutu-1": false,
    };
    expect(isZeroCoverage(partialCoverage)).toBe(false);
  });
});

describe("5. Deselect Impact on Orders Safeguard", () => {
  function checkDeselectImpact(
    item: HouseCoverageWithLimitsItem,
    nextVal: boolean
  ): { requiresConfirmation: boolean; activeOrdersCount: number } {
    if (!nextVal && (item.activeOrdersCount ?? 0) > 0) {
      return {
        requiresConfirmation: true,
        activeOrdersCount: item.activeOrdersCount ?? 0,
      };
    }
    return { requiresConfirmation: false, activeOrdersCount: 0 };
  }

  it("triggers confirmation dialog when deselecting quartier with active orders", () => {
    const itemWithOrders = mockItems[0]; // Nyenyezi has 2 active orders
    const impact = checkDeselectImpact(itemWithOrders, false);

    expect(impact.requiresConfirmation).toBe(true);
    expect(impact.activeOrdersCount).toBe(2);
  });

  it("allows deselecting quartier without active orders without confirmation", () => {
    const itemWithoutOrders = mockItems[1]; // Ndendere has 0 active orders
    const impact = checkDeselectImpact(itemWithoutOrders, false);

    expect(impact.requiresConfirmation).toBe(false);
    expect(impact.activeOrdersCount).toBe(0);
  });

  it("does not trigger impact confirmation when enabling (selecting) a quartier", () => {
    const itemWithOrders = mockItems[0];
    const impact = checkDeselectImpact(itemWithOrders, true);

    expect(impact.requiresConfirmation).toBe(false);
  });
});
