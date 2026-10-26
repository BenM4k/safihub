"use client";

import { useTranslations } from "next-intl";
import { Search, Filter, RotateCcw } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
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
    <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-sm">
        <InputGroup className="h-9 min-h-0 bg-background border-border">
          <InputGroupAddon align="inline-start">
            <Search className="size-3.5 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            placeholder={t("searchPlaceholder")}
            className="text-xs"
            aria-label={t("searchPlaceholder")}
          />
        </InputGroup>
      </div>

      {/* Filter Dropdowns and Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="size-3.5 text-muted-foreground hidden sm:block" aria-hidden="true" />
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({
                status: e.target.value as "all" | HouseOperationalStatus,
              })
            }
            className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
          className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-[180px] truncate"
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onFiltersChange({ search: "", status: "all", neighborhoodId: "" })
            }
            className="h-9 px-2.5 text-xs gap-1.5"
            title={t("resetFilters")}
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">{t("resetFilters")}</span>
          </Button>
        )}

        {/* Count badge */}
        <span className="text-xs font-semibold text-muted-foreground px-2.5 py-1 rounded-full bg-muted whitespace-nowrap">
          {t("kpiHousesBadge", { count: totalFilteredCount })}
        </span>
      </div>
    </div>
  );
}
