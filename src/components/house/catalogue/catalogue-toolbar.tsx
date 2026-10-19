"use client";

import { useTranslations } from "next-intl";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type {
  CatalogueFilterState,
  CatalogueCategoryGroup,
  CatalogueStatusFilter,
} from "./types";
import { ActiveFiltersChips } from "./active-filters-chips";

interface CatalogueToolbarProps {
  filters: CatalogueFilterState;
  onFilterChange: (filters: CatalogueFilterState) => void;
  categories: CatalogueCategoryGroup[];
  selectedArticlesCount: number;
  totalFilteredCount: number;
  onOpenBulkTools: () => void;
}

export function CatalogueToolbar({
  filters,
  onFilterChange,
  categories,
  selectedArticlesCount,
  onOpenBulkTools,
}: CatalogueToolbarProps) {
  const t = useTranslations("house.catalogue");

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.category !== "all" ||
    filters.status !== "all";

  function clearFilters() {
    onFilterChange({
      search: "",
      category: "all",
      status: "all",
    });
  }

  const selectedCategoryLabel =
    categories.find((c) => c.key === filters.category)?.label;

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xs py-3 border-b border-border space-y-2.5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            placeholder={t("searchPlaceholder")}
            className="pl-9 h-9 text-xs bg-card rounded-xl border-border"
            aria-label={t("searchPlaceholder")}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-heading p-0.5"
              aria-label="Effacer la recherche"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Status filter buttons & Bulk Actions */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(
            [
              { id: "all", label: t("filterAll") },
              { id: "offered", label: t("filterOffered") },
              { id: "not_offered", label: t("filterNotOffered") },
              { id: "no_price", label: t("filterNoPrice") },
            ] as const
          ).map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() =>
                onFilterChange({
                  ...filters,
                  status: st.id as CatalogueStatusFilter,
                })
              }
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                filters.status === st.id
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-muted-foreground border-border hover:bg-surface"
              }`}
            >
              {st.label}
            </button>
          ))}

          {/* Bulk Tools trigger */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenBulkTools}
            className="h-8 text-xs font-semibold rounded-lg ml-auto shrink-0 border-border text-heading hover:bg-surface"
          >
            <SlidersHorizontal className="size-3.5 mr-1.5 text-primary" aria-hidden="true" />
            <span>{t("bulkTools")}</span>
            {selectedArticlesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground font-mono text-[10px]">
                {selectedArticlesCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, category: "all" })}
          className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
            filters.category === "all"
              ? "bg-heading text-background font-bold shadow-xs"
              : "bg-surface text-muted-foreground hover:bg-surface/80 border border-border"
          }`}
        >
          {t("allCategories")}
        </button>
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => onFilterChange({ ...filters, category: c.key })}
            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filters.category === c.key
                ? "bg-heading text-background font-bold shadow-xs"
                : "bg-surface text-muted-foreground hover:bg-surface/80 border border-border"
            }`}
          >
            {c.label} ({c.articles.length})
          </button>
        ))}
      </div>

      {/* Active filter summary chips */}
      {hasActiveFilters && (
        <ActiveFiltersChips
          filters={filters}
          selectedCategoryLabel={selectedCategoryLabel}
          onFilterChange={onFilterChange}
          onClearFilters={clearFilters}
        />
      )}
    </div>
  );
}
