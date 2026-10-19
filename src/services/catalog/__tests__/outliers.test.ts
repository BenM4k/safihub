import { describe, it, expect } from "vitest";
import { filterCatalogueOutliers, calculateMedian } from "../outliers";
import type { CustomerHouseCatalogueItem } from "@/dal";

describe("Catalogue Outliers Filtering", () => {
  it("calculates median correctly for odd and even number arrays", () => {
    expect(calculateMedian([3500, 4000, 5000])).toBe(4000);
    expect(calculateMedian([3500, 4000, 5000, 6000])).toBe(4500);
    expect(calculateMedian([])).toBe(0);
  });

  it("flags the 150 000 CDF Chemise classique entry as an anomaly", () => {
    const items: CustomerHouseCatalogueItem[] = [
      {
        houseItemId: "hi-1",
        serviceId: "s-wash",
        serviceSlug: "wash",
        serviceNameFr: "Lavage",
        serviceNameSw: "Kufua",
        itemId: "i-shirt",
        itemNameFr: "Chemise classique",
        itemNameSw: "Shati",
        itemCategory: "tops",
        fabricId: "f-std",
        fabricNameFr: "Standard",
        fabricNameSw: "Kawaida",
        priceCdf: 3500,
        currency: "CDF",
        isExcluded: false,
        exclusionNote: null,
      },
      {
        houseItemId: "hi-2",
        serviceId: "s-wash",
        serviceSlug: "wash",
        serviceNameFr: "Lavage",
        serviceNameSw: "Kufua",
        itemId: "i-shirt",
        itemNameFr: "Chemise classique",
        itemNameSw: "Shati",
        itemCategory: "tops",
        fabricId: "f-linen",
        fabricNameFr: "Coton/Lin",
        fabricNameSw: "Kitani",
        priceCdf: 150000, // Anomaly!
        currency: "CDF",
        isExcluded: false,
        exclusionNote: null,
      },
    ];

    const result = filterCatalogueOutliers(items);
    expect(result.validItems).toHaveLength(1);
    expect(result.validItems[0].priceCdf).toBe(3500);
    expect(result.flaggedOutliers).toHaveLength(1);
    expect(result.flaggedOutliers[0].item.priceCdf).toBe(150000);
    expect(result.flaggedOutliers[0].reason).toContain("dépasse le plafond");
  });

  it("filters out items with non-positive price", () => {
    const items: CustomerHouseCatalogueItem[] = [
      {
        houseItemId: "hi-zero",
        serviceId: "s-wash",
        serviceSlug: "wash",
        serviceNameFr: "Lavage",
        serviceNameSw: "Kufua",
        itemId: "i-test",
        itemNameFr: "Test Item",
        itemNameSw: "Jaribio",
        itemCategory: "tops",
        fabricId: "f-std",
        fabricNameFr: "Standard",
        fabricNameSw: "Kawaida",
        priceCdf: 0,
        currency: "CDF",
        isExcluded: false,
        exclusionNote: null,
      },
    ];

    const result = filterCatalogueOutliers(items);
    expect(result.validItems).toHaveLength(0);
    expect(result.flaggedOutliers).toHaveLength(1);
    expect(result.flaggedOutliers[0].reason).toBe("Prix invalide ou nul");
  });
});
