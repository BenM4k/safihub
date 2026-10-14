"use client";

import { Download, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <div className="flex items-center justify-between border-b-2 border-border-strong overflow-x-auto no-scrollbar">
        <nav className="flex space-x-2 sm:space-x-4 min-w-max pb-px" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = filters.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange({ tab: tab.id })}
                className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "border-primary text-primary font-bold"
                    : "border-transparent text-muted-foreground hover:text-heading hover:border-border-strong"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold shadow-2xs ${
                    isActive
                      ? "bg-primary-soft text-primary-soft-foreground"
                      : "bg-secondary text-secondary-foreground"
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
            className="h-8 text-xs font-semibold border-border-strong bg-card shadow-xs hover:shadow-sm hover:bg-surface text-heading gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{t("exportBtn")}</span>
          </Button>
        </div>
      </div>

      {/* Control bar: Search + Select Dropdowns */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[260px] max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <Input
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder={t("searchPlaceholder")}
            className="pl-9 h-9 text-xs bg-card border-border-strong shadow-xs hover:border-ink-400 focus-visible:ring-primary"
            aria-label={t("searchPlaceholder")}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-heading p-0.5 cursor-pointer"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date range filter */}
          <select
            value={filters.dateRange}
            onChange={(e) =>
              onFilterChange({ dateRange: e.target.value as FilterState["dateRange"] })
            }
            aria-label={t("filterDateRange")}
            className="h-9 rounded-lg border border-border-strong bg-card shadow-xs px-3 text-xs text-heading font-medium hover:border-ink-400 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="30d">{t("dateRange30d")}</option>
            <option value="today">{t("dateRangeToday")}</option>
            <option value="7d">{t("dateRange7d")}</option>
            <option value="all">{t("dateRangeAll")}</option>
          </select>

          {/* Pressing filter */}
          <select
            value={filters.houseId}
            onChange={(e) => onFilterChange({ houseId: e.target.value })}
            aria-label={t("filterPressing")}
            className="h-9 rounded-lg border border-border-strong bg-card shadow-xs px-3 text-xs text-heading font-medium hover:border-ink-400 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer max-w-[180px] truncate"
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
            aria-label={t("filterChannel")}
            className="h-9 rounded-lg border border-border-strong bg-card shadow-xs px-3 text-xs text-heading font-medium hover:border-ink-400 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="">{t("allChannels")}</option>
            <option value="app">App</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="phone">Téléphone</option>
          </select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            className="sm:hidden h-9 text-xs font-semibold border-border-strong bg-card shadow-xs hover:bg-surface text-heading gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{t("exportBtn")}</span>
          </Button>
        </div>
      </div>

      {/* Active filter chips subcomponent */}
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
