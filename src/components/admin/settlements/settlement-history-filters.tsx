"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download, RotateCcw } from "lucide-react";
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

export interface SettlementHistoryFiltersState {
  search: string;
  payeeType: "all" | "house" | "courier";
  status: "all" | "valid" | "reversed";
  period: "7_days" | "30_days" | "all";
}

interface SettlementHistoryFiltersProps {
  filters: SettlementHistoryFiltersState;
  onChange: (next: SettlementHistoryFiltersState) => void;
  onReset: () => void;
  onExportCsv: () => void;
}

export function SettlementHistoryFilters({
  filters,
  onChange,
  onReset,
  onExportCsv,
}: SettlementHistoryFiltersProps) {
  const t = useTranslations("admin.settlements");
  const [searchResetKey, setSearchResetKey] = useState(0);

  const hasCustomFilters =
    filters.search ||
    filters.payeeType !== "all" ||
    filters.status !== "all" ||
    filters.period !== "30_days";

  function handleReset() {
    setSearchResetKey((prev) => prev + 1);
    onReset();
  }

  return (
    <div className="p-3 border-b border-border bg-muted/20 flex flex-col xl:flex-row xl:items-center justify-between gap-3 text-xs">
      <div className="flex-1 min-w-[240px] max-w-md">
        <AdminSearchInput
          key={searchResetKey}
          value={filters.search}
          onSearch={(search) => onChange({ ...filters, search })}
          onClear={() => onChange({ ...filters, search: "" })}
          placeholder={t("historySearchPlaceholder")}
          ariaLabel={t("historySearchPlaceholder")}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <ToggleGroup
          type="single"
          value={filters.payeeType}
          onValueChange={(val) => {
            if (val === "all" || val === "house" || val === "courier") {
              onChange({ ...filters, payeeType: val });
            }
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="all" className="min-h-10 px-2.5 text-2xs font-semibold">
            {t("filterTypeAll")}
          </ToggleGroupItem>
          <ToggleGroupItem value="house" className="min-h-10 px-2.5 text-2xs font-semibold">
            {t("filterTypeHouses")}
          </ToggleGroupItem>
          <ToggleGroupItem value="courier" className="min-h-10 px-2.5 text-2xs font-semibold">
            {t("filterTypeCouriers")}
          </ToggleGroupItem>
        </ToggleGroup>

        <ToggleGroup
          type="single"
          value={filters.status}
          onValueChange={(val) => {
            if (val === "all" || val === "valid" || val === "reversed") {
              onChange({ ...filters, status: val });
            }
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="all" className="min-h-10 px-2.5 text-2xs font-semibold">
            {t("filterStatusAll")}
          </ToggleGroupItem>
          <ToggleGroupItem value="valid" className="min-h-10 px-2.5 text-2xs font-semibold">
            {t("filterStatusValid")}
          </ToggleGroupItem>
          <ToggleGroupItem value="reversed" className="min-h-10 px-2.5 text-2xs font-semibold">
            {t("filterStatusReversed")}
          </ToggleGroupItem>
        </ToggleGroup>

        <Select
          value={filters.period}
          onValueChange={(val) =>
            onChange({
              ...filters,
              period: val as SettlementHistoryFiltersState["period"],
            })
          }
        >
          <SelectTrigger
            className="min-h-10 h-10 text-xs font-medium min-w-[140px]"
            aria-label={t("filterPeriodAriaLabel")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7_days">{t("filterPeriod7Days")}</SelectItem>
            <SelectItem value="30_days">{t("filterPeriod30Days")}</SelectItem>
            <SelectItem value="all">{t("filterPeriodAll")}</SelectItem>
          </SelectContent>
        </Select>

        {hasCustomFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="min-h-10 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1 press"
            title={t("resetFilters")}
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">{t("resetFilters")}</span>
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          className="min-h-10 px-3 text-xs font-semibold border-border gap-1.5 press"
          title={t("exportHistoryCsvTitle")}
        >
          <Download className="size-3.5" />
          <span>{t("exportBtn")}</span>
        </Button>
      </div>
    </div>
  );
}
