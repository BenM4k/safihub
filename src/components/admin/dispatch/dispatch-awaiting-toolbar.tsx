"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown, Filter, Layers, List, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AdminSearchInput } from "@/components/admin/shared/admin-search-input";
import type { DelayFilter, SortOption } from "@/lib/dispatch-grouping";

interface DispatchAwaitingToolbarProps {
  totalOrdersCount: number;
  viewMode: "pressing" | "order";
  onChangeViewMode: (mode: "pressing" | "order") => void;
  search: string;
  onSearchChange: (value: string) => void;
  delayFilter: DelayFilter;
  onDelayFilterChange: (filter: DelayFilter) => void;
  sortBy: SortOption;
  onSortByChange: (sort: SortOption) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function DispatchAwaitingToolbar({
  totalOrdersCount,
  viewMode,
  onChangeViewMode,
  search,
  onSearchChange,
  delayFilter,
  onDelayFilterChange,
  sortBy,
  onSortByChange,
  onRefresh,
  isRefreshing,
}: DispatchAwaitingToolbarProps) {
  const t = useTranslations("admin.dispatch");

  return (
    <div className="p-4 space-y-3 border-b border-border bg-muted/20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground font-display">
              {t("awaitingAcceptanceTitle")}
            </h2>
            <span className="text-xs font-mono tabular-nums font-bold px-2 py-0.5 rounded-full bg-muted text-foreground">
              {totalOrdersCount}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("slaSubtitle")}
          </p>
        </div>

        {/* View Toggle (@ui-sdk/react ToggleGroup) & Refresh button */}
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(next) => {
              if (next === "pressing" || next === "order") {
                onChangeViewMode(next);
              }
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem
              value="pressing"
              className="min-h-10 gap-1.5 px-3 text-xs font-semibold"
            >
              <Layers className="size-3.5" />
              <span>{t("viewByPressing")}</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="order"
              className="min-h-10 gap-1.5 px-3 text-xs font-semibold"
            >
              <List className="size-3.5" />
              <span>{t("viewByOrder")}</span>
            </ToggleGroupItem>
          </ToggleGroup>

          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="min-h-10 min-w-10 px-2.5 text-xs press"
            aria-label={t("refreshNow")}
          >
            <RefreshCw
              className={`size-3.5 ${
                isRefreshing ? "animate-spin text-primary" : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>
      </div>

      {/* AdminSearchInput (Search + Clear) + @ui-sdk/react Select Filters */}
      <div className="flex flex-col md:flex-row gap-2 pt-1">
        <div className="flex-1 min-w-0">
          <AdminSearchInput
            value={search}
            onSearch={onSearchChange}
            onClear={() => onSearchChange("")}
            placeholder={t("searchPlaceholder")}
            ariaLabel={t("searchPlaceholder")}
            isLoading={isRefreshing}
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Filter className="size-3.5 text-muted-foreground hidden sm:block" />
          <Select
            value={delayFilter}
            onValueChange={(val) => onDelayFilterChange(val as DelayFilter)}
          >
            <SelectTrigger
              className="min-h-11 h-11 text-xs min-w-[165px]"
              aria-label={t("filterDelayAriaLabel")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filterDelayAll")}</SelectItem>
              <SelectItem value="overdue">{t("filterDelayOverdue")}</SelectItem>
              <SelectItem value="critical">{t("filterDelayCritical")}</SelectItem>
              <SelectItem value="never_relanced">
                {t("filterDelayNeverRelanced")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="size-3.5 text-muted-foreground hidden sm:block" />
          <Select
            value={sortBy}
            onValueChange={(val) => onSortByChange(val as SortOption)}
          >
            <SelectTrigger
              className="min-h-11 h-11 text-xs min-w-[155px]"
              aria-label={t("sortAriaLabel")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oldest">{t("sortOldest")}</SelectItem>
              <SelectItem value="newest">{t("sortNewest")}</SelectItem>
              {viewMode === "pressing" && (
                <SelectItem value="order_count">
                  {t("sortOrderCount")}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
