"use client";

import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/admin/shared/filter-chip";
import type { UserFiltersState } from "./types";

interface UsersFilterChipsProps {
  filters: UserFiltersState;
  onChange: (filters: UserFiltersState) => void;
  onReset: () => void;
}

export function UsersFilterChips({ filters, onChange, onReset }: UsersFilterChipsProps) {
  const t = useTranslations("admin.users");

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.role !== "all" ||
    filters.status !== "all" ||
    !filters.hideTestAccounts;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
      <span className="text-muted-foreground font-medium">{t("activeFilters")}</span>

      {/* Search chip */}
      {filters.search.trim() && (
        <FilterChip
          onRemove={() => onChange({ ...filters, search: "" })}
          removeAriaLabel={t("removeSearchFilter")}
        >
          {t("chipSearch", { search: filters.search })}
        </FilterChip>
      )}

      {/* Role chip */}
      {filters.role !== "all" && (
        <FilterChip
          onRemove={() => onChange({ ...filters, role: "all" })}
          removeAriaLabel={t("removeRoleFilter")}
        >
          {t("chipRole", {
            role:
              filters.role === "admin"
                ? t("roleAdmin")
                : filters.role === "courier"
                ? t("roleCourier")
                : filters.role === "house"
                ? t("roleHouse")
                : filters.role,
          })}
        </FilterChip>
      )}

      {/* Status chip */}
      {filters.status !== "all" && (
        <FilterChip
          onRemove={() => onChange({ ...filters, status: "all" })}
          removeAriaLabel={t("removeStatusFilter")}
        >
          {t("chipStatus", {
            status:
              filters.status === "active"
                ? t("statusActive")
                : filters.status === "blocked"
                ? t("statusBlocked")
                : t("statusInvited"),
          })}
        </FilterChip>
      )}

      {/* Show test accounts chip */}
      {!filters.hideTestAccounts && (
        <FilterChip
          tone="warning"
          onRemove={() => onChange({ ...filters, hideTestAccounts: true })}
          removeAriaLabel={t("hideTestAccounts")}
        >
          {t("chipTestAccountsIncluded")}
        </FilterChip>
      )}

      {/* Global reset button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="h-7 px-2 text-2xs font-semibold text-primary hover:text-primary/80 gap-1"
      >
        <RotateCcw className="size-3" />
        <span>{t("resetFilters")}</span>
      </Button>
    </div>
  );
}

