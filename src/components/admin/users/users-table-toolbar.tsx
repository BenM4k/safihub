"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Download, Search, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
    <div className="flex flex-col gap-3 py-1">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input with input-group matching auth style */}
        <div className="flex-1 min-w-[260px]">
          <InputGroup className="min-h-11">
            <InputGroupAddon align="inline-start">
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder={t("searchPlaceholder")}
              className="text-sm"
              aria-label={t("searchPlaceholder")}
            />
            {filters.search && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onChange({ ...filters, search: "" })}
                  aria-label={t("clearSearch")}
                >
                  <X className="size-3.5" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role filter */}
          <select
            value={filters.role}
            onChange={(e) => onChange({ ...filters, role: e.target.value })}
            className="h-11 px-3 rounded-xl border border-border-strong bg-card text-xs font-medium text-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-none cursor-pointer"
            aria-label={t("filterRole")}
          >
            <option value="all">{t("roleAll")}</option>
            <option value="admin">{t("roleAdmin")}</option>
            <option value="house">{t("roleHouse")}</option>
          </select>

          {/* Status filter */}
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="h-11 px-3 rounded-xl border border-border-strong bg-card text-xs font-medium text-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-none cursor-pointer"
            aria-label={t("filterStatus")}
          >
            <option value="all">{t("statusAll")}</option>
            <option value="active">{t("statusActive")}</option>
            <option value="blocked">{t("statusBlocked")}</option>
            <option value="invitation_sent">{t("statusInvited")}</option>
          </select>

          {/* Link to Customers screen */}
          <Button
            asChild
            variant="outline"
            className="h-11 px-3 text-xs font-medium gap-1.5"
          >
            <Link href="/admin/customers" title={t("customersScreenTitle")}>
              <Users className="size-4 text-primary" />
              <span className="hidden sm:inline">{t("customersScreenLink")}</span>
            </Link>
          </Button>

          {/* Export CSV button */}
          <Button
            type="button"
            variant="outline"
            onClick={onExport}
            disabled={totalFiltered === 0}
            className="h-11 px-3 text-xs font-medium gap-1.5"
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
