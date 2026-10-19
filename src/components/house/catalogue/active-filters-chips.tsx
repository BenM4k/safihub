"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { CatalogueFilterState } from "./types";

interface ActiveFiltersChipsProps {
  filters: CatalogueFilterState;
  selectedCategoryLabel?: string;
  onFilterChange: (filters: CatalogueFilterState) => void;
  onClearFilters: () => void;
}

export function ActiveFiltersChips({
  filters,
  selectedCategoryLabel,
  onFilterChange,
  onClearFilters,
}: ActiveFiltersChipsProps) {
  const t = useTranslations("house.catalogue");

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground pt-1">
      <span className="text-[11px] font-semibold text-heading">
        {t("activeFilters")}
      </span>
      {filters.search && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-xs text-heading">
          « {filters.search} »
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, search: "" })}
            className="hover:text-destructive"
            aria-label={t("removeSearchFilter")}
          >
            <X className="size-3" />
          </button>
        </span>
      )}
      {filters.category !== "all" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-xs text-heading">
          {selectedCategoryLabel || filters.category}
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, category: "all" })}
            className="hover:text-destructive"
            aria-label={t("removeCategoryFilter")}
          >
            <X className="size-3" />
          </button>
        </span>
      )}
      {filters.status !== "all" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-xs text-heading">
          {filters.status === "offered"
            ? t("filterOffered")
            : filters.status === "not_offered"
            ? t("filterNotOffered")
            : t("filterNoPrice")}
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, status: "all" })}
            className="hover:text-destructive"
            aria-label={t("removeStatusFilter")}
          >
            <X className="size-3" />
          </button>
        </span>
      )}
      <button
        type="button"
        onClick={onClearFilters}
        className="text-[11px] font-semibold text-primary hover:underline ml-1"
      >
        {t("clearFilters")}
      </button>
    </div>
  );
}
