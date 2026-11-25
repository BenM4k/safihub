"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminSearchInput } from "@/components/admin/shared/admin-search-input";
import { UsersFilterChips } from "./users-filter-chips";
import type { UserFiltersState } from "./types";

interface UsersTableToolbarProps {
  filters: UserFiltersState;
  onChange: (filters: UserFiltersState) => void;
  onReset: () => void;
  onExport: () => void;
  totalFiltered: number;
  isPending?: boolean;
}

export function UsersTableToolbar({
  filters,
  onChange,
  onReset,
  onExport,
  totalFiltered,
  isPending = false,
}: UsersTableToolbarProps) {
  const t = useTranslations("admin.users");

  return (
    <div className="flex flex-col gap-3 py-1">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex-1 min-w-[260px]">
          <AdminSearchInput
            value={filters.search}
            onSearch={(search) => onChange({ ...filters, search })}
            onClear={() => onChange({ ...filters, search: "" })}
            placeholder={t("searchPlaceholder")}
            ariaLabel={t("searchPlaceholder")}
            isLoading={isPending}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Select
            value={filters.role}
            onValueChange={(val) => onChange({ ...filters, role: val })}
          >
            <SelectTrigger
              className="min-h-11 h-11 px-3 rounded-xl border border-border bg-card text-xs font-medium min-w-[135px]"
              aria-label={t("filterRole")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("roleAll")}</SelectItem>
              <SelectItem value="admin">{t("roleAdmin")}</SelectItem>
              <SelectItem value="house">{t("roleHouse")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(val) => onChange({ ...filters, status: val })}
          >
            <SelectTrigger
              className="min-h-11 h-11 px-3 rounded-xl border border-border bg-card text-xs font-medium min-w-[140px]"
              aria-label={t("filterStatus")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("statusAll")}</SelectItem>
              <SelectItem value="active">{t("statusActive")}</SelectItem>
              <SelectItem value="blocked">{t("statusBlocked")}</SelectItem>
              <SelectItem value="invitation_sent">
                {t("statusInvited")}
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            asChild
            variant="outline"
            className="min-h-11 px-3 text-xs font-medium gap-1.5 press"
          >
            <Link href="/admin/customers" title={t("customersScreenTitle")}>
              <Users className="size-4 text-primary" />
              <span className="hidden sm:inline">{t("customersScreenLink")}</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onExport}
            disabled={totalFiltered === 0}
            className="min-h-11 px-3 text-xs font-medium gap-1.5 press"
            aria-label={t("export")}
          >
            <Download className="size-4" />
            <span>{t("export")}</span>
          </Button>
        </div>
      </div>

      <UsersFilterChips
        filters={filters}
        onChange={onChange}
        onReset={onReset}
      />
    </div>
  );
}
