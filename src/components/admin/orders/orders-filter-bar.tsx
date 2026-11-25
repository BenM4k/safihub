"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminSearchInput } from "@/components/admin/shared/admin-search-input";
import { OrdersActiveFilterChips } from "./orders-active-filter-chips";
import type {
  AdminOrderDateRange,
  AdminOrderSourceFilter,
  AdminOrderTab,
} from "@/lib/admin-orders-query";

export interface FilterState {
  search: string;
  tab: AdminOrderTab;
  dateRange: AdminOrderDateRange;
  houseId: string;
  source: AdminOrderSourceFilter;
}

interface OrdersFilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onExport: () => void;
  houses: Array<{ id: string; name: string }>;
  tabCounts: Record<string, number>;
  isPending?: boolean;
}

const ALL_VALUE = "__all__";

export function OrdersFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  onExport,
  houses,
  tabCounts,
  isPending = false,
}: OrdersFilterBarProps) {
  const t = useTranslations("admin.orders");

  const tabs: Array<{ id: AdminOrderTab; label: string; count: number }> = [
    { id: "all", label: t("tabAll"), count: tabCounts.all || 0 },
    { id: "awaiting", label: t("tabAwaiting"), count: tabCounts.awaiting || 0 },
    { id: "in_progress", label: t("tabInProgress"), count: tabCounts.in_progress || 0 },
    { id: "delivered", label: t("tabDelivered"), count: tabCounts.delivered || 0 },
    { id: "cancelled", label: t("tabCancelled"), count: tabCounts.cancelled || 0 },
  ];

  const selectedHouse = houses.find((h) => h.id === filters.houseId);
  const activeTabObj = tabs.find((tb) => tb.id === filters.tab);

  return (
    <div className="space-y-3 animate-enter-fast">
      {/* Status tabs via @ui-sdk/react Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-border overflow-x-auto no-scrollbar pb-2">
        <Tabs
          value={filters.tab}
          onValueChange={(nextTab) =>
            onFilterChange({ tab: nextTab as AdminOrderTab })
          }
          className="min-w-max"
        >
          <TabsList variant="line" className="h-10 gap-1">
            {tabs.map((tab) => {
              const isActive = filters.tab === tab.id;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="min-h-10 px-3 text-xs font-semibold gap-1.5"
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-mono tabular-nums font-medium ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            className="min-h-10 text-xs font-semibold gap-1.5 press cursor-pointer"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>{t("exportBtn")}</span>
          </Button>
        </div>
      </div>

      {/* Control bar: AdminSearchInput (Search + Clear) + @ui-sdk/react Select dropdowns */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        <div className="flex-1 min-w-[260px] max-w-xl">
          <AdminSearchInput
            value={filters.search}
            onSearch={(search) => onFilterChange({ search })}
            onClear={() => onFilterChange({ search: "" })}
            placeholder={t("searchPlaceholder")}
            ariaLabel={t("searchPlaceholder")}
            isLoading={isPending}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.dateRange}
            onValueChange={(val) =>
              onFilterChange({ dateRange: val as AdminOrderDateRange })
            }
          >
            <SelectTrigger
              className="min-h-11 h-11 text-xs font-medium min-w-[140px]"
              aria-label={t("filterDateRange")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t("dateRangeToday")}</SelectItem>
              <SelectItem value="7d">{t("dateRange7d")}</SelectItem>
              <SelectItem value="30d">{t("dateRange30d")}</SelectItem>
              <SelectItem value="all">{t("dateRangeAll")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.houseId || ALL_VALUE}
            onValueChange={(val) =>
              onFilterChange({ houseId: val === ALL_VALUE ? "" : val })
            }
          >
            <SelectTrigger
              className="min-h-11 h-11 text-xs font-medium min-w-[165px]"
              aria-label={t("filterPressing")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("allPressings")}</SelectItem>
              {houses.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.source || ALL_VALUE}
            onValueChange={(val) =>
              onFilterChange({
                source: (val === ALL_VALUE ? "" : val) as AdminOrderSourceFilter,
              })
            }
          >
            <SelectTrigger
              className="min-h-11 h-11 text-xs font-medium min-w-[155px]"
              aria-label={t("filterChannel")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("allChannels")}</SelectItem>
              <SelectItem value="app">{t("channelApp")}</SelectItem>
              <SelectItem value="whatsapp">{t("channelWhatsapp")}</SelectItem>
              <SelectItem value="phone">{t("channelPhone")}</SelectItem>
            </SelectContent>
          </Select>
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
