"use client";

import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminSearchInput } from "@/components/admin/shared/admin-search-input";

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
      <div className="flex items-center gap-2.5 flex-1 flex-wrap">
        <div className="min-w-[240px] flex-1 sm:max-w-sm">
          <AdminSearchInput
            value={filters.search}
            onSearch={(search) => onFilterChange({ ...filters, search })}
            onClear={() => onFilterChange({ ...filters, search: "" })}
            placeholder={t("searchPlaceholder")}
            ariaLabel={t("searchPlaceholder")}
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(val) =>
            onFilterChange({
              ...filters,
              status: val as HistoryFilterState["status"],
            })
          }
        >
          <SelectTrigger
            className="min-h-11 h-11 text-xs font-medium min-w-[145px]"
            aria-label={t("filterStatus")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterStatusAll")}</SelectItem>
            <SelectItem value="reconciled">{t("filterStatusReconciled")}</SelectItem>
            <SelectItem value="discrepancy">
              {t("filterStatusDiscrepancy")}
            </SelectItem>
            <SelectItem value="cancelled">{t("filterStatusCancelled")}</SelectItem>
          </SelectContent>
        </Select>

        {courierOptions.length > 0 && (
          <Select
            value={filters.courierId}
            onValueChange={(val) =>
              onFilterChange({ ...filters, courierId: val })
            }
          >
            <SelectTrigger
              className="min-h-11 h-11 text-xs font-medium min-w-[165px] max-w-[190px]"
              aria-label={t("filterCourier")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCouriers")}</SelectItem>
              {courierOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={filters.period}
          onValueChange={(val) =>
            onFilterChange({
              ...filters,
              period: val as HistoryFilterState["period"],
            })
          }
        >
          <SelectTrigger
            className="min-h-11 h-11 text-xs font-medium min-w-[140px]"
            aria-label={t("filterPeriod")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30_days">{t("filterPeriod30Days")}</SelectItem>
            <SelectItem value="7_days">{t("filterPeriod7Days")}</SelectItem>
            <SelectItem value="all">{t("filterPeriodAll")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2.5 self-start md:self-auto">
        <span className="text-xs text-muted-foreground font-medium">
          {t("filterEntriesCount", { count: filteredCount })}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          className="min-h-11 px-3.5 text-xs font-semibold gap-1.5 border-border hover:bg-muted/40 press"
          title={t("exportCsv")}
        >
          <Download className="size-3.5" />
          <span>{t("exportCsv")}</span>
        </Button>
      </div>
    </div>
  );
}
