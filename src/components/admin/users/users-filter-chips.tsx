"use client";

import { useTranslations } from "next-intl";
import { RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    filters.type !== "staff" ||
    !filters.hideTestAccounts;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
      <span className="text-ink-500 font-medium">Filtres actifs :</span>

      {/* Search chip */}
      {filters.search.trim() && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border-2 border-border-strong text-ink-800">
          <span>Recherche: &quot;{filters.search}&quot;</span>
          <button
            type="button"
            onClick={() => onChange({ ...filters, search: "" })}
            className="text-ink-400 hover:text-ink-800 focus:outline-none"
            aria-label="Supprimer filtre recherche"
          >
            <X className="size-3.5" />
          </button>
        </span>
      )}

      {/* Type chip */}
      {filters.type !== "staff" && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border-2 border-border-strong text-ink-800">
          <span>
            Type: {filters.type === "all" ? t("typeAll") : t("typeCustomer")}
          </span>
          <button
            type="button"
            onClick={() => onChange({ ...filters, type: "staff" })}
            className="text-ink-400 hover:text-ink-800 focus:outline-none"
            aria-label="Réinitialiser type à employés"
          >
            <X className="size-3.5" />
          </button>
        </span>
      )}

      {/* Role chip */}
      {filters.role !== "all" && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border-2 border-border-strong text-ink-800">
          <span>
            Rôle:{" "}
            {filters.role === "admin"
              ? t("roleAdmin")
              : filters.role === "courier"
                ? t("roleCourier")
                : filters.role === "house"
                  ? t("roleHouse")
                  : filters.role === "customer"
                    ? t("roleCustomer")
                    : filters.role}
          </span>
          <button
            type="button"
            onClick={() => onChange({ ...filters, role: "all" })}
            className="text-ink-400 hover:text-ink-800 focus:outline-none"
            aria-label="Supprimer filtre rôle"
          >
            <X className="size-3.5" />
          </button>
        </span>
      )}

      {/* Status chip */}
      {filters.status !== "all" && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border-2 border-border-strong text-ink-800">
          <span>
            Statut:{" "}
            {filters.status === "active"
              ? t("statusActive")
              : filters.status === "blocked"
                ? t("statusBlocked")
                : t("statusInvited")}
          </span>
          <button
            type="button"
            onClick={() => onChange({ ...filters, status: "all" })}
            className="text-ink-400 hover:text-ink-800 focus:outline-none"
            aria-label="Supprimer filtre statut"
          >
            <X className="size-3.5" />
          </button>
        </span>
      )}

      {/* Show test accounts chip */}
      {!filters.hideTestAccounts && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border-2 border-amber-300 text-amber-900">
          <span>Comptes test inclus</span>
          <button
            type="button"
            onClick={() => onChange({ ...filters, hideTestAccounts: true })}
            className="text-amber-600 hover:text-amber-900 focus:outline-none"
            aria-label="Masquer comptes test"
          >
            <X className="size-3.5" />
          </button>
        </span>
      )}

      {/* Global reset button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="h-7 px-2 text-2xs font-semibold text-primary hover:text-primary-hover gap-1"
      >
        <RotateCcw className="size-3" />
        <span>{t("resetFilters")}</span>
      </Button>
    </div>
  );
}
