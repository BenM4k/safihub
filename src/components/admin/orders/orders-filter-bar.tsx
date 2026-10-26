"use client";

import { Download, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { OrdersActiveFilterChips } from "./orders-active-filter-chips";

export interface FilterState {
  search: string;
  tab: string;
  dateRange: "today" | "7d" | "30d" | "all";
  houseId: string;
  source: string;
}

interface OrdersFilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onExport: () => void;
  houses: Array<{ id: string; name: string }>;
  tabCounts: Record<string, number>;
  totalFilteredCount: number;
}

export function OrdersFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  onExport,
  houses,
  tabCounts,
}: OrdersFilterBarProps) {
  const t = useTranslations("admin.orders");

  const tabs = [
    { id: "all", label: t("tabAll"), count: tabCounts.all || 0 },
    { id: "awaiting", label: t("tabAwaiting"), count: tabCounts.awaiting || 0 },
    { id: "in_progress", label: t("tabInProgress"), count: tabCounts.in_progress || 0 },
    { id: "delivered", label: t("tabDelivered"), count: tabCounts.delivered || 0 },
    { id: "cancelled", label: t("tabCancelled"), count: tabCounts.cancelled || 0 },
  ];

  const selectedHouse = houses.find((h) => h.id === filters.houseId);
  const activeTabObj = tabs.find((t) => t.id === filters.tab);

  return (
    <div className="space-y-3">
      {/* Status tabs */}
      <div className="flex items-center justify-between border-b border-border overflow-x-auto no-scrollbar">
        <nav className="flex space-x-2 sm:space-x-4 min-w-max pb-px" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = filters.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange({ tab: tab.id })}
                className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold transition-colors cursor-pointer border-0 ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Export Button */}
        <div className="hidden sm:flex items-center gap-2 pb-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>{t("exportBtn")}</span>
          </Button>
        </div>
      </div>

      {/* Control bar: Search + Select Dropdowns */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        <div className="flex-1 min-w-[260px] max-w-xl">
          <InputGroup className="h-9">
            <InputGroupAddon>
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder={t("searchPlaceholder")}
              className="text-xs"
            />
            {filters.search && (
              <InputGroupButton
                type="button"
                onClick={() => onFilterChange({ search: "" })}
                aria-label="Effacer"
              >
                <X className="size-3.5" />
              </InputGroupButton>
            )}
          </InputGroup>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date range filter */}
          <select
            value={filters.dateRange}
            onChange={(e) =>
              onFilterChange({
                dateRange: e.target.value as FilterState["dateRange"],
              })
            }
            className="h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            aria-label={t("filterDateRange")}
          >
            <option value="today">{t("dateRangeToday")}</option>
            <option value="7d">{t("dateRange7d")}</option>
            <option value="30d">{t("dateRange30d")}</option>
            <option value="all">{t("dateRangeAll")}</option>
          </select>

          {/* Pressing filter */}
          <select
            value={filters.houseId}
            onChange={(e) => onFilterChange({ houseId: e.target.value })}
            className="h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            aria-label={t("filterPressing")}
          >
            <option value="">{t("allPressings")}</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          {/* Channel filter */}
          <select
            value={filters.source}
            onChange={(e) => onFilterChange({ source: e.target.value })}
            className="h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            aria-label={t("filterChannel")}
          >
            <option value="">{t("allChannels")}</option>
            <option value="app">App Client</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="phone">Appel Téléphonique</option>
          </select>
        </div>
      </div>

      {/* Active filter chips */}
      <OrdersActiveFilterChips
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        tabLabel={activeTabObj?.label}
        houseName={selectedHouse?.name}
      />
    </div>
  );
}
