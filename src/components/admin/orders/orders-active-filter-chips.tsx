"use client";

import { RotateCcw, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FilterState } from "./orders-filter-bar";

interface OrdersActiveFilterChipsProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  tabLabel?: string;
  houseName?: string;
}

export function OrdersActiveFilterChips({
  filters,
  onFilterChange,
  onResetFilters,
  tabLabel,
  houseName,
}: OrdersActiveFilterChipsProps) {
  const t = useTranslations("admin.orders");

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.tab !== "all" ||
    filters.dateRange !== "30d" ||
    Boolean(filters.houseId) ||
    Boolean(filters.source);

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
      <span className="text-muted-foreground font-medium text-[11px] mr-1">
        Filtres actifs :
      </span>

      {filters.search.trim() && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border-strong shadow-2xs text-heading">
          <span>Recherche : &ldquo;{filters.search}&rdquo;</span>
          <button
            type="button"
            onClick={() => onFilterChange({ search: "" })}
            className="hover:text-destructive cursor-pointer"
            aria-label="Retirer le filtre recherche"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {filters.tab !== "all" && tabLabel && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-heading capitalize">
          <span>Onglet : {tabLabel}</span>
          <button
            type="button"
            onClick={() => onFilterChange({ tab: "all" })}
            className="hover:text-destructive cursor-pointer"
            aria-label="Retirer le filtre d'onglet"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {filters.dateRange !== "30d" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border-strong shadow-2xs text-heading">
          <span>
            Période :{" "}
            {filters.dateRange === "today"
              ? t("dateRangeToday")
              : filters.dateRange === "7d"
              ? t("dateRange7d")
              : t("dateRangeAll")}
          </span>
          <button
            type="button"
            onClick={() => onFilterChange({ dateRange: "30d" })}
            className="hover:text-destructive cursor-pointer"
            aria-label="Réinitialiser la période"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {houseName && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border-strong shadow-2xs text-heading">
          <span>Pressing : {houseName}</span>
          <button
            type="button"
            onClick={() => onFilterChange({ houseId: "" })}
            className="hover:text-destructive cursor-pointer"
            aria-label="Retirer le filtre pressing"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {filters.source && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border-strong shadow-2xs text-heading capitalize">
          <span>Canal : {filters.source}</span>
          <button
            type="button"
            onClick={() => onFilterChange({ source: "" })}
            className="hover:text-destructive cursor-pointer"
            aria-label="Retirer le filtre canal"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      <button
        type="button"
        onClick={onResetFilters}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-hover hover:underline ml-1 cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
        <span>{t("resetFilters")}</span>
      </button>
    </div>
  );
}
