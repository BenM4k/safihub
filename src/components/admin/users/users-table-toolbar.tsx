"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Download, Search, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UsersFilterChips } from "./users-filter-chips";
import type { UserFiltersState } from "./types";

interface UsersTableToolbarProps {
  filters: UserFiltersState;
  onChange: (filters: UserFiltersState) => void;
  onReset: () => void;
  onExport: () => void;
  totalFiltered: number;
}

export function UsersTableToolbar({
  filters,
  onChange,
  onReset,
  onExport,
  totalFiltered,
}: UsersTableToolbarProps) {
  const t = useTranslations("admin.users");

  return (
    <div className="p-4 bg-card rounded-2xl border-2 border-border-strong space-y-3 shadow-2xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input with search and clear icon */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none" />
          <Input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder={t("searchPlaceholder")}
            className="pl-10 pr-9 min-h-[40px] text-xs bg-surface border-2 border-border-strong text-ink-900 placeholder:text-ink-400 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
            aria-label={t("searchPlaceholder")}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-800 focus:outline-none"
              aria-label="Effacer la recherche"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Type filter */}
          <select
            value={filters.type}
            onChange={(e) =>
              onChange({
                ...filters,
                type: e.target.value as "all" | "staff" | "customer",
              })
            }
            className="min-h-[40px] px-3 rounded-xl border-2 border-border-strong bg-surface text-xs font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            aria-label={t("filterType")}
          >
            <option value="staff">{t("typeStaff")}</option>
            <option value="customer">{t("typeCustomer")}</option>
            <option value="all">{t("typeAll")}</option>
          </select>

          {/* Role filter */}
          <select
            value={filters.role}
            onChange={(e) => onChange({ ...filters, role: e.target.value })}
            className="min-h-[40px] px-3 rounded-xl border-2 border-border-strong bg-surface text-xs font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            aria-label={t("filterRole")}
          >
            <option value="all">{t("roleAll")}</option>
            <option value="admin">{t("roleAdmin")}</option>
            <option value="courier">{t("roleCourier")}</option>
            <option value="house">{t("roleHouse")}</option>
            <option value="customer">{t("roleCustomer")}</option>
          </select>

          {/* Status filter */}
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="min-h-[40px] px-3 rounded-xl border-2 border-border-strong bg-surface text-xs font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            aria-label={t("filterStatus")}
          >
            <option value="all">{t("statusAll")}</option>
            <option value="active">{t("statusActive")}</option>
            <option value="blocked">{t("statusBlocked")}</option>
            <option value="invitation_sent">{t("statusInvited")}</option>
          </select>

          {/* Link to Customers screen */}
          <Link
            href="/admin/customers"
            className="min-h-[40px] px-3 rounded-xl border-2 border-border-strong bg-surface hover:bg-muted text-xs font-semibold text-ink-800 inline-flex items-center gap-1.5 transition"
            title="Consulter l'annuaire complet des clients"
          >
            <Users className="size-4 text-primary" />
            <span className="hidden sm:inline">Écran Clients</span>
          </Link>

          {/* Export CSV button */}
          <Button
            type="button"
            variant="outline"
            onClick={onExport}
            disabled={totalFiltered === 0}
            className="min-h-[40px] px-3 text-xs font-semibold border-2 border-border-strong bg-surface hover:bg-muted text-ink-800 inline-flex items-center gap-1.5 rounded-xl"
            aria-label={t("export")}
          >
            <Download className="size-4" />
            <span>{t("export")}</span>
          </Button>
        </div>
      </div>

      {/* Filter chips */}
      <UsersFilterChips
        filters={filters}
        onChange={onChange}
        onReset={onReset}
      />
    </div>
  );
}
