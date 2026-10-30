"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const [localSearch, setLocalSearch] = useState(filters.search);
  const [prevSearch, setPrevSearch] = useState(filters.search);

  if (prevSearch !== filters.search) {
    setPrevSearch(filters.search);
    setLocalSearch(filters.search);
  }

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.category !== "all" ||
    filters.status !== "all";

  function clearFilters() {
    setLocalSearch("");
    onFilterChange({
      search: "",
      category: "all",
      status: "all",
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    onFilterChange({ ...filters, search: localSearch.trim() });
  }

  const selectedCategoryLabel =
    categories.find((c) => c.key === filters.category)?.label;

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xs py-4 border-b border-border/60 space-y-3.5 font-sans">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Search with Submit Button */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 sm:max-w-md flex items-center gap-1.5"
        >
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={localSearch}
              onChange={(e) => {
                const val = e.target.value;
                setLocalSearch(val);
                if (val === "" && filters.search !== "") {
                  onFilterChange({ ...filters, search: "" });
                }
              }}
              placeholder={t("searchPlaceholder")}
              className="pl-9 pr-8 h-10 sm:h-9 text-base sm:text-xs bg-card rounded-xl border border-input focus-visible:border-primary"
              aria-label={t("searchPlaceholder")}
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch("");
                  onFilterChange({ ...filters, search: "" });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-heading p-0.5 cursor-pointer"
                aria-label={t("clearSearch")}
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            aria-label={t("searchButton")}
            className="h-10 sm:h-9 px-3 sm:px-3.5 rounded-xl text-xs font-semibold shrink-0 gap-1.5"
          >
            <Search className="size-3.5" />
            <span className="hidden sm:inline">{t("searchButton")}</span>
          </Button>
        </form>

        {/* Status filter buttons & Bulk Actions */}
        <div className="flex items-center justify-between sm:justify-start gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
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
                className={`px-3 py-1.5 text-xs whitespace-nowrap transition cursor-pointer rounded-xl border ${
                  filters.status === st.id
                    ? "bg-primary-soft/80 border-primary/30 text-primary font-bold shadow-xs"
                    : "border-transparent text-muted-foreground hover:text-heading hover:bg-muted/40 font-medium"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Bulk Tools trigger */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenBulkTools}
            className="h-9 text-xs font-semibold rounded-lg shrink-0 border-border/80 text-heading hover:text-primary hover:bg-muted/40 cursor-pointer ml-auto"
          >
            <SlidersHorizontal className="size-3.5 mr-1.5 text-primary" aria-hidden="true" />
            <span className="hidden xs:inline">{t("bulkTools")}</span>
            <span className="xs:hidden">{t("bulkTools")}</span>
            {selectedArticlesCount > 0 && (
              <Badge className="ml-1 px-1.5 py-0 h-4 bg-primary text-primary-foreground font-mono text-[10px]">
                {selectedArticlesCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, category: "all" })}
          className={`px-3 py-1.5 text-xs whitespace-nowrap transition cursor-pointer rounded-xl border ${
            filters.category === "all"
              ? "bg-primary-soft/80 border-primary/30 text-primary font-bold shadow-xs"
              : "border-transparent text-muted-foreground hover:text-heading hover:bg-muted/40 font-medium"
          }`}
        >
          {t("allCategories")}
        </button>
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => onFilterChange({ ...filters, category: c.key })}
            className={`px-3 py-1.5 text-xs whitespace-nowrap transition cursor-pointer rounded-xl border ${
              filters.category === c.key
                ? "bg-primary-soft/80 border-primary/30 text-primary font-bold shadow-xs"
                : "border-transparent text-muted-foreground hover:text-heading hover:bg-muted/40 font-medium"
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
