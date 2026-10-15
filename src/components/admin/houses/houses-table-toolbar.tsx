"use client";

import { useTranslations } from "next-intl";
import { Search, Filter, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { NeighborhoodRecord } from "@/dal";
import type { HouseFiltersState, HouseOperationalStatus } from "./types";

interface HousesTableToolbarProps {
  filters: HouseFiltersState;
  onFiltersChange: (next: Partial<HouseFiltersState>) => void;
  neighborhoods: NeighborhoodRecord[];
  totalFilteredCount: number;
}

export function HousesTableToolbar({
  filters,
  onFiltersChange,
  neighborhoods,
  totalFilteredCount,
}: HousesTableToolbarProps) {
  const t = useTranslations("admin.houses");
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.neighborhoodId !== "";

  return (
    <div className="p-4 border-b-2 border-border-strong bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-sm">
        <Search className="size-4 text-ink-500 absolute left-3 top-3 pointer-events-none" />
        <Input
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          placeholder={t("searchPlaceholder")}
          className="pl-9 h-10 text-xs border-2 border-border-strong rounded-xl bg-card focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={t("searchPlaceholder")}
        />
      </div>

      {/* Filter Dropdowns and Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="size-3.5 text-ink-500" aria-hidden="true" />
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({
                status: e.target.value as "all" | HouseOperationalStatus,
              })
            }
            className="h-10 rounded-xl border-2 border-border-strong bg-card px-3 text-xs font-semibold text-heading hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={t("status")}
          >
            <option value="all">{t("allStatuses")}</option>
            <option value="active">{t("statusActive")}</option>
            <option value="paused">{t("statusPaused")}</option>
            <option value="closed_today">{t("statusClosedToday")}</option>
            <option value="suspended">{t("statusSuspended")}</option>
          </select>
        </div>

        {/* Neighborhood Filter */}
        <select
          value={filters.neighborhoodId}
          onChange={(e) => onFiltersChange({ neighborhoodId: e.target.value })}
          className="h-10 rounded-xl border-2 border-border-strong bg-card px-3 text-xs font-semibold text-heading hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary max-w-[180px] truncate"
          aria-label={t("district")}
        >
          <option value="">{t("allNeighborhoods")}</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() =>
              onFiltersChange({ search: "", status: "all", neighborhoodId: "" })
            }
            className="h-10 px-3 rounded-xl border border-border-strong bg-card hover:bg-surface text-ink-600 hover:text-ink-900 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            title={t("resetFilters")}
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">{t("resetFilters")}</span>
          </button>
        )}

        {/* Count badge */}
        <span className="text-xs font-bold text-ink-700 bg-surface px-3 py-2 rounded-xl border border-border-strong whitespace-nowrap">
          {t("kpiHousesBadge", { count: totalFilteredCount })}
        </span>
      </div>
    </div>
  );
}
