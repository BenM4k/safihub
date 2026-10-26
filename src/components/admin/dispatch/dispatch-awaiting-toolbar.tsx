"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown, Filter, Layers, List, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
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
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-muted text-foreground">
              {totalOrdersCount}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            SLA 45 min · Chasse proactive des pressings partenaires
          </p>
        </div>

        {/* View toggle & Refresh button */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted">
            <button
              type="button"
              onClick={() => onChangeViewMode("pressing")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === "pressing"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="size-3.5" />
              <span>{t("viewByPressing")}</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode("order")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === "order"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-3.5" />
              <span>{t("viewByOrder")}</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 px-2.5 text-xs"
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

      {/* Search, Filter & Sort bar */}
      <div className="flex flex-col md:flex-row gap-2 pt-1">
        <div className="flex-1">
          <InputGroup className="h-9 min-h-0 bg-background border-border">
            <InputGroupAddon align="inline-start">
              <Search className="size-3.5 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="text-xs"
            />
          </InputGroup>
        </div>

        {/* Delay filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Filter className="size-3.5 text-muted-foreground hidden sm:block" />
          <select
            value={delayFilter}
            onChange={(e) => onDelayFilterChange(e.target.value as DelayFilter)}
            className="h-9 text-xs px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">{t("filterDelayAll")}</option>
            <option value="overdue">{t("filterDelayOverdue")}</option>
            <option value="critical">{t("filterDelayCritical")}</option>
            <option value="never_relanced">{t("filterDelayNeverRelanced")}</option>
          </select>
        </div>

        {/* Sort option */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="size-3.5 text-muted-foreground hidden sm:block" />
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortOption)}
            className="h-9 text-xs px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="oldest">{t("sortOldest")}</option>
            <option value="newest">{t("sortNewest")}</option>
            {viewMode === "pressing" && (
              <option value="order_count">{t("sortOrderCount")}</option>
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
