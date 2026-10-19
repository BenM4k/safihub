import { describe, it, expect } from "vitest";
import type { HouseCatalogueItemRecord } from "@/dal";
import {
  getCellKey,
  parseCellKey,
  roundToStep,
  calculateNetPayout,
  translateCategory,
  isCellDirty,
  isOutlierChange,
  computeCellDiffs,
  buildCatalogueStructure,
  applyPriceToAllFabrics,
  copyPricesFromService,
  bulkAdjustPercentage,
  bulkSetFixedPrice,
  bulkToggleOffered,
} from "../catalogue-helpers";
import { DEFAULT_PRICING_BOUNDS } from "../types";

function createMockItem(overrides: Partial<HouseCatalogueItemRecord> = {}): HouseCatalogueItemRecord {
  return {
    id: "hi-1",
    houseId: "house-1",
    serviceId: "srv-wash",
    serviceNameFr: "Lavage & Pliage",
    serviceNameSw: "Kufua na Kukunja",
    serviceSlug: "wash",
    itemId: "item-shirt",
    itemNameFr: "Chemise classique",
    itemNameSw: "Shati ya kawaida",
    itemCategory: "tops",
    fabricId: "fab-std",
    fabricNameFr: "Standard",
    fabricNameSw: "Ya kawaida",
    price: 3500,
    currency: "CDF",
    isActive: true,
    hasCustomPrice: true,
    ...overrides,
  };
}

describe("Catalogue Pricing Grid Helpers & Domain Rules", () => {
  describe("Cell Key & Step Rounding", () => {
    it("generates and parses cell keys correctly", () => {
      const key = getCellKey("srv1", "itm1", "fab1");
      expect(key).toBe("srv1_itm1_fab1");
      expect(parseCellKey(key)).toEqual({
        serviceId: "srv1",
        itemId: "itm1",
        fabricId: "fab1",
      });
    });

    it("enforces step 100 rounding for Bukavu cash compliance", () => {
      expect(roundToStep(3540, 100)).toBe(3500);
      expect(roundToStep(3560, 100)).toBe(3600);
      expect(roundToStep(3550, 100)).toBe(3600);
      expect(roundToStep(0, 100)).toBe(0);
      expect(roundToStep(-500, 100)).toBe(0);
    });
  });

  describe("Commission & Net Payout Calculation", () => {
    it("computes net pressing payout with standard 20% commission", () => {
      // 10 000 CDF - 20% (2000 CDF) = 8 000 CDF
      expect(calculateNetPayout(10000, 2000)).toBe(8000);
      // 3 500 CDF - 20% (700 CDF) = 2 800 CDF
      expect(calculateNetPayout(3500, 2000)).toBe(2800);
      // 0 CDF -> 0 CDF
      expect(calculateNetPayout(0, 2000)).toBe(0);
    });

    it("respects custom commission bps or 0 bps for owner houses", () => {
      expect(calculateNetPayout(10000, 0)).toBe(10000);
      expect(calculateNetPayout(10000, 1500)).toBe(8500);
    });
  });

  describe("Category Translation", () => {
    const mockT = (k: string) => {
      const map: Record<string, string> = {
        categoryTops: "Hauts",
        categoryBottoms: "Bas",
        categorySuits: "Costumes",
        categoryDresses: "Robes",
        categoryBedding: "Linge de maison",
        categoryShoes: "Chaussures",
        categoryOther: "Autres articles",
      };
      return map[k] || k;
    };

    it("translates all standard category keys", () => {
      expect(translateCategory("tops", mockT).label).toBe("Hauts");
      expect(translateCategory("bottoms", mockT).label).toBe("Bas");
      expect(translateCategory("suits", mockT).label).toBe("Costumes");
      expect(translateCategory("dresses", mockT).label).toBe("Robes");
      expect(translateCategory("bedding", mockT).label).toBe("Linge de maison");
      expect(translateCategory("shoes", mockT).label).toBe("Chaussures");
      expect(translateCategory("unknown_key", mockT).label).toBe("Autres articles");
    });
  });

  describe("Dirty State & Outlier Detection", () => {
    const baseItem = createMockItem({ price: 3500, isActive: true });

    it("identifies when cell is unchanged", () => {
      expect(isCellDirty(baseItem, undefined)).toBe(false);
      expect(isCellDirty(baseItem, { price: 3500, isActive: true })).toBe(false);
    });

    it("detects dirty state on price change or status change", () => {
      expect(isCellDirty(baseItem, { price: 4000, isActive: true })).toBe(true);
      expect(isCellDirty(baseItem, { price: 3500, isActive: false })).toBe(true);
      expect(isCellDirty(baseItem, { price: null, isActive: false })).toBe(true);
    });

    it("detects price outliers outside bounds or with >50% variance", () => {
      // Normal variation: 3500 -> 4000 (14% increase)
      expect(isOutlierChange(3500, 4000, DEFAULT_PRICING_BOUNDS)).toBe(false);

      // Huge variation: 3500 -> 8000 (> 100% increase)
      expect(isOutlierChange(3500, 8000, DEFAULT_PRICING_BOUNDS)).toBe(true);

      // Too low (below 100 CDF min)
      expect(isOutlierChange(3500, 50, DEFAULT_PRICING_BOUNDS)).toBe(true);

      // Extreme high (above 500,000 CDF)
      expect(isOutlierChange(3500, 600000, DEFAULT_PRICING_BOUNDS)).toBe(true);
    });

    it("computes diffs between original items and edit state", () => {
      const items = [
        createMockItem({ itemId: "item-1", fabricId: "fab-1", price: 3000, isActive: true }),
        createMockItem({ itemId: "item-2", fabricId: "fab-1", price: 5000, isActive: true }),
      ];

      const edits = {
        [getCellKey("srv-wash", "item-1", "fab-1")]: { price: 3500, isActive: true },
        [getCellKey("srv-wash", "item-2", "fab-1")]: { price: 5000, isActive: false },
      };

      const diffs = computeCellDiffs(items, edits, DEFAULT_PRICING_BOUNDS);
      expect(diffs).toHaveLength(2);
      expect(diffs[0].newPrice).toBe(3500);
      expect(diffs[0].oldPrice).toBe(3000);
      expect(diffs[1].newActive).toBe(false);
    });
  });

  describe("Grid Structure Building", () => {
    it("transforms 540-combination flat list into grouped structure", () => {
      const mockT = (k: string) => k;
      const items: HouseCatalogueItemRecord[] = [];

      // 2 services, 2 items, 2 fabrics = 8 combinations
      for (const srv of ["srv1", "srv2"]) {
        for (const itm of ["itm1", "itm2"]) {
          for (const fab of ["fab1", "fab2"]) {
            items.push(
              createMockItem({
                serviceId: srv,
                itemId: itm,
                fabricId: fab,
                price: srv === "srv1" ? 2500 : 0,
                isActive: srv === "srv1",
              })
            );
          }
        }
      }

      const struct = buildCatalogueStructure(items, mockT);
      expect(struct.services).toHaveLength(2);
      expect(struct.materials).toHaveLength(2);
      expect(struct.totalPossible).toBe(8);
      expect(struct.totalConfigured).toBe(4); // srv1 items only

      const srv1Groups = struct.categoriesByService.get("srv1");
      expect(srv1Groups).toBeDefined();
      expect(srv1Groups![0].articles).toHaveLength(2);
    });
  });

  describe("Bulk Operations", () => {
    it("applies a price across all materials for an article", () => {
      const article = {
        id: "item-1",
        nameFr: "Chemise",
        nameSw: "Shati",
        category: "tops",
        cellsByFabricId: new Map([
          ["fab1", createMockItem({ itemId: "item-1", fabricId: "fab1", price: 2000 })],
          ["fab2", createMockItem({ itemId: "item-1", fabricId: "fab2", price: 3000 })],
        ]),
      };

      const edits = applyPriceToAllFabrics(article, 4000, true, {});
      expect(edits[getCellKey("srv-wash", "item-1", "fab1")]).toEqual({
        price: 4000,
        isActive: true,
      });
      expect(edits[getCellKey("srv-wash", "item-1", "fab2")]).toEqual({
        price: 4000,
        isActive: true,
      });
    });

    it("copies prices from one service to another", () => {
      const items = [
        createMockItem({ serviceId: "srv-wash", itemId: "item-1", fabricId: "fab-1", price: 3000, isActive: true }),
        createMockItem({ serviceId: "srv-dry", itemId: "item-1", fabricId: "fab-1", price: 0, isActive: false }),
      ];

      const edits = copyPricesFromService("srv-wash", "srv-dry", items, {});
      const copiedKey = getCellKey("srv-dry", "item-1", "fab-1");
      expect(edits[copiedKey]).toEqual({
        price: 3000,
        isActive: true,
      });
    });

    it("adjusts prices by percentage with 100 CDF rounding", () => {
      const items = [
        createMockItem({ itemId: "item-1", fabricId: "fab-1", price: 3000 }),
      ];

      // +10% on 3000 = 3300
      const editsPlus = bulkAdjustPercentage(items, 10, {});
      expect(editsPlus[getCellKey("srv-wash", "item-1", "fab-1")]?.price).toBe(3300);

      // -15% on 3000 = 2550 -> rounded to 2600
      const editsMinus = bulkAdjustPercentage(items, -15, {});
      expect(editsMinus[getCellKey("srv-wash", "item-1", "fab-1")]?.price).toBe(2600);
    });

    it("sets fixed price and enables offered state", () => {
      const items = [
        createMockItem({ itemId: "item-1", fabricId: "fab-1", price: 0, isActive: false }),
      ];

      const edits = bulkSetFixedPrice(items, 4520, {});
      expect(edits[getCellKey("srv-wash", "item-1", "fab-1")]).toEqual({
        price: 4500, // rounded to 100 step
        isActive: true,
      });
    });

    it("toggles offered state in bulk", () => {
      const items = [
        createMockItem({ itemId: "item-1", fabricId: "fab-1", price: 3500, isActive: true }),
      ];

      const retired = bulkToggleOffered(items, false, {});
      expect(retired[getCellKey("srv-wash", "item-1", "fab-1")]?.isActive).toBe(false);

      const offered = bulkToggleOffered(items, true, retired);
      expect(offered[getCellKey("srv-wash", "item-1", "fab-1")]?.isActive).toBe(true);
    });
  });
});
