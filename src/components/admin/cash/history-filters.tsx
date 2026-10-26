"use client";

import { useTranslations } from "next-intl";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface HistoryFilterState {
  search: string;
  courierId: string;
  status: "all" | "reconciled" | "discrepancy" | "cancelled";
  period: "30_days" | "7_days" | "all";
}

interface HistoryFiltersProps {
  filters: HistoryFilterState;
  onFilterChange: (filters: HistoryFilterState) => void;
  courierOptions: Array<{ id: string; name: string }>;
  onExportCsv: () => void;
  filteredCount: number;
}

export function HistoryFilters({
  filters,
  onFilterChange,
  courierOptions,
  onExportCsv,
  filteredCount,
}: HistoryFiltersProps) {
  const t = useTranslations("admin.cash");

  return (
    <div className="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
      {/* Search and Dropdowns */}
      <div className="flex items-center gap-2.5 flex-1 flex-wrap">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder={t("searchPlaceholder")}
            className="pl-9 h-10 text-xs border-border"
            aria-label={t("searchPlaceholder")}
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              status: e.target.value as HistoryFilterState["status"],
            })
          }
          className="h-10 px-3 text-xs rounded-xl border border-border bg-card font-medium focus:ring-2 focus:ring-primary/20 text-foreground"
          aria-label={t("filterStatus")}
        >
          <option value="all">{t("filterStatusAll")}</option>
          <option value="reconciled">{t("filterStatusReconciled")}</option>
          <option value="discrepancy">{t("filterStatusDiscrepancy")}</option>
          <option value="cancelled">{t("filterStatusCancelled")}</option>
        </select>

        {/* Courier */}
        {courierOptions.length > 0 && (
          <select
            value={filters.courierId}
            onChange={(e) =>
              onFilterChange({ ...filters, courierId: e.target.value })
            }
            className="h-10 px-3 text-xs rounded-xl border border-border bg-card font-medium focus:ring-2 focus:ring-primary/20 max-w-[170px] truncate text-foreground"
            aria-label={t("filterCourier")}
          >
            <option value="all">{t("allCouriers")}</option>
            {courierOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        {/* Period */}
        <select
          value={filters.period}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              period: e.target.value as HistoryFilterState["period"],
            })
          }
          className="h-10 px-3 text-xs rounded-xl border border-border bg-card font-medium focus:ring-2 focus:ring-primary/20 text-foreground"
          aria-label={t("filterPeriod")}
        >
          <option value="30_days">{t("filterPeriod30Days")}</option>
          <option value="7_days">{t("filterPeriod7Days")}</option>
          <option value="all">{t("filterPeriodAll")}</option>
        </select>
      </div>

      {/* Export Button */}
      <div className="flex items-center gap-2.5 self-start md:self-auto">
        <span className="text-xs text-muted-foreground font-medium">
          {t("filterEntriesCount", { count: filteredCount })}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          className="h-10 px-3.5 text-xs font-semibold gap-1.5 border-border hover:bg-muted/40"
          title={t("exportCsv")}
        >
          <Download className="size-3.5" />
          <span>{t("exportCsv")}</span>
        </Button>
      </div>
    </div>
  );
}
