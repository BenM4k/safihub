"use client";

import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { FilterChip } from "@/components/admin/shared/filter-chip";
import type { CustomerFiltersState } from "./types";

interface CustomersFilterChipsProps {
  filters: CustomerFiltersState;
  totalFiltered: number;
  onChange: (filters: CustomerFiltersState) => void;
  onReset: () => void;
}

export function CustomersFilterChips({
  filters,
  totalFiltered,
  onChange,
  onReset,
}: CustomersFilterChipsProps) {
  const t = useTranslations("admin.customers");

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.status !== "all" ||
    filters.type !== "all" ||
    filters.hasOrdered ||
    filters.hideTestAccounts ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  if (!hasActiveFilters) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap pt-1 text-2xs">
      <span className="text-muted-foreground font-medium">{t("activeFilters")}</span>
      {filters.search && (
        <FilterChip
          onRemove={() => onChange({ ...filters, search: "" })}
          removeAriaLabel={t("removeSearchFilter")}
        >
          {t("chipSearch", { search: filters.search })}
        </FilterChip>
      )}
      {filters.status !== "all" && (
        <FilterChip
          onRemove={() => onChange({ ...filters, status: "all" })}
          removeAriaLabel={t("removeStatusFilter")}
        >
          {t("chipStatus", { status: filters.status === "active" ? t("statusActive") : t("statusBlocked") })}
        </FilterChip>
      )}
      {filters.type !== "all" && (
        <FilterChip
          onRemove={() => onChange({ ...filters, type: "all" })}
          removeAriaLabel={t("resetTypeFilter")}
        >
          {t("chipType", { type: filters.type === "registered" ? t("typeRegistered") : t("typeGuest") })}
        </FilterChip>
      )}
      {filters.hasOrdered && (
        <FilterChip
          onRemove={() => onChange({ ...filters, hasOrdered: false })}
          removeAriaLabel={t("resetFilters")}
        >
          {t("filterHasOrdered")}
        </FilterChip>
      )}
      {filters.hideTestAccounts && (
        <FilterChip
          onRemove={() => onChange({ ...filters, hideTestAccounts: false })}
          removeAriaLabel={t("hideTestAccounts")}
        >
          {t("filterHideTest")}
        </FilterChip>
      )}
      {(filters.dateFrom || filters.dateTo) && (
        <FilterChip
          onRemove={() => onChange({ ...filters, dateFrom: "", dateTo: "" })}
          removeAriaLabel={t("removeDateFilter")}
        >
          {t("chipPeriod", { from: filters.dateFrom || "—", to: filters.dateTo || "—" })}
        </FilterChip>
      )}

      <button
        type="button"
        onClick={onReset}
        className="text-primary hover:underline font-bold inline-flex items-center gap-1 ml-2 text-xs cursor-pointer"
      >
        <RotateCcw className="size-3" />
        <span>{t("resetFilters")}</span>
      </button>
      <span className="ml-auto text-muted-foreground font-semibold">
        {t("filteredCount", { count: totalFiltered })}
      </span>
    </div>
  );
}
