"use client";

import { useTranslations } from "next-intl";
import { Download, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input using auth InputGroup style */}
        <div className="flex-1 min-w-[280px] max-w-md">
          <InputGroup className="h-9">
            <InputGroupAddon>
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder={t("searchPlaceholder")}
              className="text-xs"
            />
            {filters.search && (
              <InputGroupButton
                type="button"
                onClick={() => onChange({ ...filters, search: "" })}
                aria-label={t("clearSearch")}
              >
                <X className="size-3.5" />
              </InputGroupButton>
            )}
          </InputGroup>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value as CustomerFiltersState["status"] })}
            className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground focus-visible:ring-1 focus-visible:ring-ring"
            aria-label={t("filterStatus")}
          >
            <option value="all">{t("filterStatus")}: {t("filterAll")}</option>
            <option value="active">{t("statusActive")}</option>
            <option value="blocked">{t("statusBlocked")}</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => onChange({ ...filters, type: e.target.value as CustomerFiltersState["type"] })}
            className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground focus-visible:ring-1 focus-visible:ring-ring"
            aria-label={t("filterType")}
          >
            <option value="all">{t("filterType")}: {t("filterAll")}</option>
            <option value="registered">{t("typeRegistered")}</option>
            <option value="guest">{t("typeGuest")}</option>
          </select>

          <label className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={filters.hasOrdered}
              onChange={(e) => onChange({ ...filters, hasOrdered: e.target.checked })}
              className="rounded-sm size-3.5 accent-primary"
            />
            <span>{t("filterHasOrdered")}</span>
          </label>

          <label className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={filters.hideTestAccounts}
              onChange={(e) => onChange({ ...filters, hideTestAccounts: e.target.checked })}
              className="rounded-sm size-3.5 accent-primary"
            />
            <span>{t("filterHideTest")}</span>
          </label>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-9 text-xs font-semibold inline-flex items-center gap-1.5"
            aria-label={t("export")}
          >
            <Download className="size-3.5" />
            <span>{t("export")}</span>
          </Button>
        </div>
      </div>

      {/* Date range */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground pt-1 border-t border-border">
        <span className="font-semibold text-foreground flex items-center gap-1">
          <Filter className="size-3 text-muted-foreground" />
          <span>{t("dateRange")} :</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">{t("dateFrom")}</span>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            className="h-8 text-xs w-36 border border-border rounded-md bg-background"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">{t("dateTo")}</span>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            className="h-8 text-xs w-36 border border-border rounded-md bg-background"
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
