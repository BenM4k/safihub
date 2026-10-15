"use client";

import { useTranslations } from "next-intl";
import { Download, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomersFilterChips } from "./customers-filter-chips";
import type { CustomerFiltersState } from "./types";

interface CustomersTableToolbarProps {
  filters: CustomerFiltersState;
  onChange: (filters: CustomerFiltersState) => void;
  onReset: () => void;
  onExport: () => void;
  totalFiltered: number;
}

export function CustomersTableToolbar({
  filters,
  onChange,
  onReset,
  onExport,
  totalFiltered,
}: CustomersTableToolbarProps) {
  const t = useTranslations("admin.customers");

  return (
    <div className="bg-card rounded-xl border-2 border-border-strong p-4 space-y-3 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Wider search bar */}
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none" />
          <Input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder={t("searchPlaceholder")}
            className="pl-9 pr-9 h-10 min-h-[40px] text-xs border-2 border-border-strong rounded-lg bg-white"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-heading p-1"
              aria-label="Effacer la recherche"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter dropdowns and controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value as CustomerFiltersState["status"] })}
            className="h-10 min-h-[40px] rounded-lg border-2 border-border-strong bg-white px-3 text-xs font-medium text-heading focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={t("filterStatus")}
          >
            <option value="all">{t("filterStatus")}: {t("filterAll")}</option>
            <option value="active">{t("statusActive")}</option>
            <option value="blocked">{t("statusBlocked")}</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => onChange({ ...filters, type: e.target.value as CustomerFiltersState["type"] })}
            className="h-10 min-h-[40px] rounded-lg border-2 border-border-strong bg-white px-3 text-xs font-medium text-heading focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={t("filterType")}
          >
            <option value="all">{t("filterType")}: {t("filterAll")}</option>
            <option value="registered">{t("typeRegistered")}</option>
            <option value="guest">{t("typeGuest")}</option>
          </select>

          <label className="inline-flex items-center gap-1.5 h-10 min-h-[40px] px-3 rounded-lg border-2 border-border-strong bg-white text-xs font-medium text-ink-700 cursor-pointer hover:bg-surface">
            <input
              type="checkbox"
              checked={filters.hasOrdered}
              onChange={(e) => onChange({ ...filters, hasOrdered: e.target.checked })}
              className="rounded-sm border-ink-300 text-primary focus:ring-primary size-3.5"
            />
            <span>{t("filterHasOrdered")}</span>
          </label>

          <label className="inline-flex items-center gap-1.5 h-10 min-h-[40px] px-3 rounded-lg border-2 border-border-strong bg-white text-xs font-medium text-ink-700 cursor-pointer hover:bg-surface">
            <input
              type="checkbox"
              checked={filters.hideTestAccounts}
              onChange={(e) => onChange({ ...filters, hideTestAccounts: e.target.checked })}
              className="rounded-sm border-ink-300 text-primary focus:ring-primary size-3.5"
            />
            <span>{t("filterHideTest")}</span>
          </label>

          <Button
            type="button"
            variant="outline"
            onClick={onExport}
            className="h-10 min-h-[40px] text-xs font-bold border-2 border-border-strong bg-white text-ink-700 hover:bg-surface inline-flex items-center gap-1.5"
            aria-label={t("export")}
          >
            <Download className="size-3.5" />
            <span>{t("export")}</span>
          </Button>
        </div>
      </div>

      {/* Date range inputs */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-ink-600 pt-1 border-t border-border-strong/60">
        <span className="font-semibold text-heading flex items-center gap-1">
          <Filter className="size-3 text-ink-500" />
          <span>{t("dateRange")} :</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-ink-500">{t("dateFrom")}</span>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            className="h-8 text-xs w-36 border-2 border-border-strong rounded-md bg-white"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-ink-500">{t("dateTo")}</span>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            className="h-8 text-xs w-36 border-2 border-border-strong rounded-md bg-white"
          />
        </div>
      </div>

      <CustomersFilterChips
        filters={filters}
        totalFiltered={totalFiltered}
        onChange={onChange}
        onReset={onReset}
      />
    </div>
  );
}
