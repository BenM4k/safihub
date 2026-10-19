import type { CustomerHouseCatalogueItem } from "@/dal";

export interface OutlierPolicyConfig {
  /** Maximum multiple of category median before an item is flagged (default: 4x) */
  maxMedianMultiplier?: number;
  /** Hard cap for clothing items in CDF above which prices are flagged (default: 100,000 CDF) */
  clothingHardCapCdf?: number;
}

export interface OutlierFilterResult {
  validItems: CustomerHouseCatalogueItem[];
  flaggedOutliers: Array<{
    item: CustomerHouseCatalogueItem;
    reason: string;
    ratioToMedian?: number;
  }>;
}

/**
 * Calculates the median of an array of numbers.
 */
export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Filters out items with invalid prices and extreme outliers (e.g. 150,000 CDF for a shirt).
 */
export function filterCatalogueOutliers(
  items: CustomerHouseCatalogueItem[],
  config: OutlierPolicyConfig = {}
): OutlierFilterResult {
  const maxMultiplier = config.maxMedianMultiplier ?? 4;
  const clothingHardCap = config.clothingHardCapCdf ?? 100_000;

  // 1. Group prices by category to establish medians
  const pricesByCategory = new Map<string, number[]>();
  for (const item of items) {
    if (item.priceCdf > 0 && !item.isExcluded) {
      const cat = item.itemCategory || "clothing";
      const list = pricesByCategory.get(cat) || [];
      list.push(item.priceCdf);
      pricesByCategory.set(cat, list);
    }
  }

  const mediansByCategory = new Map<string, number>();
  for (const [cat, prices] of pricesByCategory.entries()) {
    mediansByCategory.set(cat, calculateMedian(prices));
  }

  const validItems: CustomerHouseCatalogueItem[] = [];
  const flaggedOutliers: OutlierFilterResult["flaggedOutliers"] = [];

  for (const item of items) {
    // Skip zero or negative price
    if (!item.priceCdf || item.priceCdf <= 0) {
      flaggedOutliers.push({
        item,
        reason: "Prix invalide ou nul",
      });
      continue;
    }

    const cat = item.itemCategory || "clothing";
    const median = mediansByCategory.get(cat) || item.priceCdf;
    const ratio = median > 0 ? item.priceCdf / median : 1;

    // Hard cap for standard clothing (tops, bottoms, suits, dresses)
    const isApparel = ["tops", "bottoms", "suits", "dresses", "clothing"].includes(cat);
    const exceedsHardCap = isApparel && item.priceCdf >= clothingHardCap;

    // Statistical outlier check (e.g., > 4x median of the category if there are multiple items)
    const exceedsMultiple = pricesByCategory.get(cat)!.length >= 2 && ratio > maxMultiplier;

    if (exceedsHardCap || exceedsMultiple) {
      flaggedOutliers.push({
        item,
        reason: exceedsHardCap
          ? `Prix de ${item.priceCdf} CDF dépasse le plafond de sécurité (${clothingHardCap} CDF)`
          : `Prix anormalement élevé (${ratio.toFixed(1)}x la médiane de la catégorie)`,
        ratioToMedian: ratio,
      });
    } else {
      validItems.push(item);
    }
  }

  return { validItems, flaggedOutliers };
}
