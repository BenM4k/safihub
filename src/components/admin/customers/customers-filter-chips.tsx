"use client";

import { useTranslations } from "next-intl";
import { RotateCcw, X } from "lucide-react";
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
      <span className="text-ink-500 font-medium">Filtres actifs :</span>
      {filters.search && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-soft text-primary font-semibold border border-primary/20">
          <span>Recherche: &quot;{filters.search}&quot;</span>
          <button type="button" onClick={() => onChange({ ...filters, search: "" })} className="hover:text-heading">
            <X className="size-2.5" />
          </button>
        </span>
      )}
      {filters.status !== "all" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-soft text-primary font-semibold border border-primary/20">
          <span>Statut: {filters.status === "active" ? t("statusActive") : t("statusBlocked")}</span>
          <button type="button" onClick={() => onChange({ ...filters, status: "all" })} className="hover:text-heading">
            <X className="size-2.5" />
          </button>
        </span>
      )}
      {filters.type !== "all" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-soft text-primary font-semibold border border-primary/20">
          <span>Type: {filters.type === "registered" ? t("typeRegistered") : t("typeGuest")}</span>
          <button type="button" onClick={() => onChange({ ...filters, type: "all" })} className="hover:text-heading">
            <X className="size-2.5" />
          </button>
        </span>
      )}
      {filters.hasOrdered && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-soft text-primary font-semibold border border-primary/20">
          <span>{t("filterHasOrdered")}</span>
          <button type="button" onClick={() => onChange({ ...filters, hasOrdered: false })} className="hover:text-heading">
            <X className="size-2.5" />
          </button>
        </span>
      )}
      {filters.hideTestAccounts && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-soft text-primary font-semibold border border-primary/20">
          <span>{t("filterHideTest")}</span>
          <button type="button" onClick={() => onChange({ ...filters, hideTestAccounts: false })} className="hover:text-heading">
            <X className="size-2.5" />
          </button>
        </span>
      )}
      {(filters.dateFrom || filters.dateTo) && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-soft text-primary font-semibold border border-primary/20">
          <span>Dates: {filters.dateFrom || "—"} au {filters.dateTo || "—"}</span>
          <button type="button" onClick={() => onChange({ ...filters, dateFrom: "", dateTo: "" })} className="hover:text-heading">
            <X className="size-2.5" />
          </button>
        </span>
      )}

      <button
        type="button"
        onClick={onReset}
        className="text-primary hover:underline font-bold inline-flex items-center gap-1 ml-2 text-xs"
      >
        <RotateCcw className="size-3" />
        <span>{t("resetFilters")}</span>
      </button>
      <span className="ml-auto text-ink-500 font-semibold">{totalFiltered} résultat(s)</span>
    </div>
  );
}
