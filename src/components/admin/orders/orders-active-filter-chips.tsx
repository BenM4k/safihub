"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { FilterChip } from "@/components/admin/shared/filter-chip";
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
        {t("activeFiltersLabel")}
      </span>

      {filters.search.trim() && (
        <FilterChip
          onRemove={() => onFilterChange({ search: "" })}
          removeAriaLabel={t("chipSearch", { search: filters.search })}
        >
          {t("chipSearch", { search: filters.search })}
        </FilterChip>
      )}

      {filters.tab !== "all" && tabLabel && (
        <FilterChip
          onRemove={() => onFilterChange({ tab: "all" })}
          removeAriaLabel={t("chipTab", { tab: tabLabel })}
        >
          {t("chipTab", { tab: tabLabel })}
        </FilterChip>
      )}

      {filters.dateRange !== "30d" && (
        <FilterChip
          onRemove={() => onFilterChange({ dateRange: "30d" })}
          removeAriaLabel="Reset period"
        >
          {t("chipPeriod", {
            period:
              filters.dateRange === "today"
                ? t("dateRangeToday")
                : filters.dateRange === "7d"
                ? t("dateRange7d")
                : t("dateRangeAll"),
          })}
        </FilterChip>
      )}

      {houseName && (
        <FilterChip
          onRemove={() => onFilterChange({ houseId: "" })}
          removeAriaLabel={t("chipPressing", { house: houseName })}
        >
          {t("chipPressing", { house: houseName })}
        </FilterChip>
      )}

      {filters.source && (
        <FilterChip
          onRemove={() => onFilterChange({ source: "" })}
          removeAriaLabel={t("chipChannel", { channel: filters.source })}
        >
          {t("chipChannel", { channel: filters.source })}
        </FilterChip>
      )}

      <button
        type="button"
        onClick={onResetFilters}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-hover hover:underline ml-1 cursor-pointer"
      >
        <RotateCcw className="size-3" />
        <span>{t("resetFilters")}</span>
      </button>
    </div>
  );
}
