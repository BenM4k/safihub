import type { HouseCatalogueItemRecord } from "@/dal";

export interface CatalogueCellEdit {
  price: number | null;
  isActive: boolean;
}

export interface CatalogueMaterial {
  id: string;
  nameFr: string;
  nameSw: string;
}

export interface CatalogueArticle {
  id: string;
  nameFr: string;
  nameSw: string;
  category: string;
  cellsByFabricId: Map<string, HouseCatalogueItemRecord>;
}

export interface CatalogueCategoryGroup {
  key: string;
  label: string;
  articles: CatalogueArticle[];
}

export interface CatalogueServiceTab {
  id: string;
  slug: string;
  nameFr: string;
  nameSw: string;
  configuredCount: number;
  totalCount: number;
}

export type CatalogueStatusFilter = "all" | "offered" | "not_offered" | "no_price";

export interface CatalogueFilterState {
  search: string;
  category: string; // "all" or category key
  status: CatalogueStatusFilter;
}

export interface CellDiff {
  key: string;
  serviceId: string;
  itemId: string;
  fabricId: string;
  serviceName: string;
  itemName: string;
  fabricName: string;
  oldPrice: number;
  newPrice: number;
  oldActive: boolean;
  newActive: boolean;
  isOutlier?: boolean;
}

export interface PricingBoundsConfig {
  minPrice: number;
  maxPriceWarning: number;
  step: number;
  maxPercentageChangeWarning: number;
}

export const DEFAULT_PRICING_BOUNDS: PricingBoundsConfig = {
  minPrice: 100,
  maxPriceWarning: 500000,
  step: 100,
  maxPercentageChangeWarning: 50,
};
