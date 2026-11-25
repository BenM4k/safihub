"use client";

import { useTranslations } from "next-intl";
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminSearchInput } from "@/components/admin/shared/admin-search-input";
import type { NeighborhoodRecord } from "@/dal";
import type { HouseFiltersState, HouseOperationalStatus } from "./types";

interface HousesTableToolbarProps {
  filters: HouseFiltersState;
  onFiltersChange: (next: Partial<HouseFiltersState>) => void;
  neighborhoods: NeighborhoodRecord[];
  totalFilteredCount: number;
  isPending?: boolean;
}

const ALL_VALUE = "__all__";

export function HousesTableToolbar({
  filters,
  onFiltersChange,
  neighborhoods,
  totalFilteredCount,
  isPending = false,
}: HousesTableToolbarProps) {
  const t = useTranslations("admin.houses");
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.neighborhoodId !== "";

  return (
    <div className="p-4 border-b border-border bg-muted/20 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div className="flex-1 min-w-[240px] max-w-md">
        <AdminSearchInput
          value={filters.search}
          onSearch={(search) => onFiltersChange({ search })}
          onClear={() => onFiltersChange({ search: "" })}
          placeholder={t("searchPlaceholder")}
          ariaLabel={t("searchPlaceholder")}
          isLoading={isPending}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Filter
            className="size-3.5 text-muted-foreground hidden sm:block"
            aria-hidden="true"
          />
          <Select
            value={filters.status}
            onValueChange={(val) =>
              onFiltersChange({
                status: val as "all" | HouseOperationalStatus,
              })
            }
          >
            <SelectTrigger
              className="min-h-11 h-11 text-xs font-medium min-w-[155px]"
              aria-label={t("status")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatuses")}</SelectItem>
              <SelectItem value="active">{t("statusActive")}</SelectItem>
              <SelectItem value="paused">{t("statusPaused")}</SelectItem>
              <SelectItem value="closed_today">
                {t("statusClosedToday")}
              </SelectItem>
              <SelectItem value="suspended">{t("statusSuspended")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select
          value={filters.neighborhoodId || ALL_VALUE}
          onValueChange={(val) =>
            onFiltersChange({
              neighborhoodId: val === ALL_VALUE ? "" : val,
            })
          }
        >
          <SelectTrigger
            className="min-h-11 h-11 text-xs font-medium min-w-[175px] max-w-[210px]"
            aria-label={t("district")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>{t("allNeighborhoods")}</SelectItem>
            {neighborhoods.map((n) => (
              <SelectItem key={n.id} value={n.id}>
                {n.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onFiltersChange({
                search: "",
                status: "all",
                neighborhoodId: "",
              })
            }
            className="min-h-11 px-3 text-xs gap-1.5 press"
            title={t("resetFilters")}
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">{t("resetFilters")}</span>
          </Button>
        )}

        <span className="text-xs font-semibold text-muted-foreground px-2.5 py-1 rounded-full bg-muted whitespace-nowrap">
          {t("kpiHousesBadge", { count: totalFilteredCount })}
        </span>
      </div>
    </div>
  );
}
