import type { HouseCatalogueItemRecord } from "@/dal";
import {
  DEFAULT_PRICING_BOUNDS,
  type CatalogueArticle,
  type CatalogueCategoryGroup,
  type CatalogueCellEdit,
  type CatalogueMaterial,
  type CatalogueServiceTab,
  type CellDiff,
  type PricingBoundsConfig,
} from "./types";

export function getCellKey(serviceId: string, itemId: string, fabricId: string): string {
  return `${serviceId}_${itemId}_${fabricId}`;
}

export function parseCellKey(key: string): { serviceId: string; itemId: string; fabricId: string } {
  const [serviceId, itemId, fabricId] = key.split("_");
  return { serviceId, itemId, fabricId };
}

export function roundToStep(price: number, step: number = 100): number {
  if (isNaN(price) || price < 0) return 0;
  return Math.round(price / step) * step;
}

export function calculateNetPayout(price: number, commissionBps?: number | null): number {
  if (price <= 0) return 0;
  const bps = commissionBps ?? 2000; // 20% standard platform default
  const commission = Math.round((price * bps) / 10000);
  return Math.max(0, price - commission);
}

export function translateCategory(
  rawKey: string | null | undefined,
  t: (key: string) => string
): { key: string; label: string } {
  const key = rawKey?.trim().toLowerCase() || "other";
  switch (key) {
    case "tops":
      return { key, label: t("categoryTops") };
    case "bottoms":
      return { key, label: t("categoryBottoms") };
    case "suits":
      return { key, label: t("categorySuits") };
    case "dresses":
      return { key, label: t("categoryDresses") };
    case "bedding":
      return { key, label: t("categoryBedding") };
    case "shoes":
      return { key, label: t("categoryShoes") };
    default:
      return { key, label: t("categoryOther") };
  }
}

export function isCellDirty(
  item: HouseCatalogueItemRecord,
  edit?: CatalogueCellEdit
): boolean {
  if (!edit) return false;
  const originalActive = item.isActive;
  const originalPrice = item.price;

  const currentActive = edit.isActive;
  const currentPrice = edit.price ?? 0;

  return originalActive !== currentActive || originalPrice !== currentPrice;
}

export function isOutlierChange(
  oldPrice: number,
  newPrice: number,
  bounds: PricingBoundsConfig = DEFAULT_PRICING_BOUNDS
): boolean {
  if (newPrice > bounds.maxPriceWarning || newPrice < bounds.minPrice) {
    return true;
  }
  if (oldPrice > 0) {
    const diff = Math.abs(newPrice - oldPrice);
    const ratio = diff / oldPrice;
    return ratio > bounds.maxPercentageChangeWarning / 100;
  }
  return false;
}

export function computeCellDiffs(
  items: HouseCatalogueItemRecord[],
  edits: Record<string, CatalogueCellEdit>,
  bounds: PricingBoundsConfig = DEFAULT_PRICING_BOUNDS
): CellDiff[] {
  const diffs: CellDiff[] = [];

  for (const item of items) {
    const key = getCellKey(item.serviceId, item.itemId, item.fabricId);
    const edit = edits[key];
    if (!edit) continue;

    if (isCellDirty(item, edit)) {
      const newPrice = edit.price ?? 0;
      const isOutlier =
        edit.isActive && isOutlierChange(item.price, newPrice, bounds);

      diffs.push({
        key,
        serviceId: item.serviceId,
        itemId: item.itemId,
        fabricId: item.fabricId,
        serviceName: item.serviceNameFr,
        itemName: item.itemNameFr,
        fabricName: item.fabricNameFr,
        oldPrice: item.price,
        newPrice,
        oldActive: item.isActive,
        newActive: edit.isActive,
        isOutlier,
      });
    }
  }

  return diffs;
}

export function buildCatalogueStructure(
  items: HouseCatalogueItemRecord[],
  t: (key: string) => string
): {
  services: CatalogueServiceTab[];
  materials: CatalogueMaterial[];
  categoriesByService: Map<string, CatalogueCategoryGroup[]>;
  totalConfigured: number;
  totalPossible: number;
} {
  const serviceMap = new Map<string, CatalogueServiceTab>();
  const materialMap = new Map<string, CatalogueMaterial>();
  const totalPossible = items.length;
  let totalConfigured = 0;

  // Extract materials in order of appearance
  for (const it of items) {
    if (!materialMap.has(it.fabricId)) {
      materialMap.set(it.fabricId, {
        id: it.fabricId,
        nameFr: it.fabricNameFr,
        nameSw: it.fabricNameSw,
      });
    }

    if (it.isActive && it.price > 0) {
      totalConfigured++;
    }

    if (!serviceMap.has(it.serviceId)) {
      serviceMap.set(it.serviceId, {
        id: it.serviceId,
        slug: it.serviceSlug,
        nameFr: it.serviceNameFr,
        nameSw: it.serviceNameSw,
        configuredCount: 0,
        totalCount: 0,
      });
    }

    const srv = serviceMap.get(it.serviceId)!;
    srv.totalCount++;
    if (it.isActive && it.price > 0) {
      srv.configuredCount++;
    }
  }

  // Group by category per service
  const categoriesByService = new Map<string, CatalogueCategoryGroup[]>();

  for (const srv of serviceMap.values()) {
    const serviceItems = items.filter((i) => i.serviceId === srv.id);
    const categoryMap = new Map<string, { label: string; articlesMap: Map<string, CatalogueArticle> }>();

    for (const it of serviceItems) {
      const { key: catKey, label: catLabel } = translateCategory(it.itemCategory, t);
      if (!categoryMap.has(catKey)) {
        categoryMap.set(catKey, {
          label: catLabel,
          articlesMap: new Map(),
        });
      }

      const catEntry = categoryMap.get(catKey)!;
      if (!catEntry.articlesMap.has(it.itemId)) {
        catEntry.articlesMap.set(it.itemId, {
          id: it.itemId,
          nameFr: it.itemNameFr,
          nameSw: it.itemNameSw,
          category: catKey,
          cellsByFabricId: new Map(),
        });
      }

      catEntry.articlesMap.get(it.itemId)!.cellsByFabricId.set(it.fabricId, it);
    }

    const categoryGroups: CatalogueCategoryGroup[] = [];
    for (const [key, val] of categoryMap.entries()) {
      categoryGroups.push({
        key,
        label: val.label,
        articles: Array.from(val.articlesMap.values()),
      });
    }

    categoriesByService.set(srv.id, categoryGroups);
  }

  return {
    services: Array.from(serviceMap.values()),
    materials: Array.from(materialMap.values()),
    categoriesByService,
    totalConfigured,
    totalPossible,
  };
}

// Bulk tool helpers
export function applyPriceToAllFabrics(
  article: CatalogueArticle,
  sourcePrice: number | null,
  isActive: boolean,
  currentEdits: Record<string, CatalogueCellEdit>
): Record<string, CatalogueCellEdit> {
  const next = { ...currentEdits };
  for (const [fabricId, cell] of article.cellsByFabricId.entries()) {
    const key = getCellKey(cell.serviceId, cell.itemId, fabricId);
    next[key] = {
      price: sourcePrice,
      isActive,
    };
  }
  return next;
}

export function copyPricesFromService(
  sourceServiceId: string,
  targetServiceId: string,
  items: HouseCatalogueItemRecord[],
  currentEdits: Record<string, CatalogueCellEdit>
): Record<string, CatalogueCellEdit> {
  const next = { ...currentEdits };
  const sourceItems = items.filter((i) => i.serviceId === sourceServiceId);

  for (const src of sourceItems) {
    const srcKey = getCellKey(src.serviceId, src.itemId, src.fabricId);
    const srcEdit = currentEdits[srcKey];
    const srcPrice = srcEdit !== undefined ? srcEdit.price : src.price;
    const srcActive = srcEdit !== undefined ? srcEdit.isActive : src.isActive;

    const targetKey = getCellKey(targetServiceId, src.itemId, src.fabricId);
    next[targetKey] = {
      price: srcPrice,
      isActive: srcActive,
    };
  }

  return next;
}

export function bulkAdjustPercentage(
  targetCells: HouseCatalogueItemRecord[],
  percentage: number,
  currentEdits: Record<string, CatalogueCellEdit>,
  step: number = 100
): Record<string, CatalogueCellEdit> {
  const next = { ...currentEdits };
  const multiplier = 1 + percentage / 100;

  for (const cell of targetCells) {
    const key = getCellKey(cell.serviceId, cell.itemId, cell.fabricId);
    const edit = currentEdits[key];
    const basePrice = edit?.price ?? cell.price;
    const isActive = edit?.isActive ?? cell.isActive;

    if (basePrice > 0) {
      const calculated = Math.max(step, roundToStep(basePrice * multiplier, step));
      next[key] = {
        price: calculated,
        isActive,
      };
    }
  }

  return next;
}

export function bulkSetFixedPrice(
  targetCells: HouseCatalogueItemRecord[],
  fixedPrice: number,
  currentEdits: Record<string, CatalogueCellEdit>,
  step: number = 100
): Record<string, CatalogueCellEdit> {
  const next = { ...currentEdits };
  const rounded = Math.max(step, roundToStep(fixedPrice, step));

  for (const cell of targetCells) {
    const key = getCellKey(cell.serviceId, cell.itemId, cell.fabricId);

    next[key] = {
      price: rounded,
      isActive: true, // setting fixed price offers the item
    };
  }

  return next;
}

export function bulkToggleOffered(
  targetCells: HouseCatalogueItemRecord[],
  offer: boolean,
  currentEdits: Record<string, CatalogueCellEdit>
): Record<string, CatalogueCellEdit> {
  const next = { ...currentEdits };

  for (const cell of targetCells) {
    const key = getCellKey(cell.serviceId, cell.itemId, cell.fabricId);
    const edit = currentEdits[key];
    const price = edit?.price ?? cell.price;

    next[key] = {
      price: offer ? (price > 0 ? price : 1000) : price,
      isActive: offer,
    };
  }

  return next;
}
