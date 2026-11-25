"use client";

import { useTranslations } from "next-intl";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminSearchInput } from "@/components/admin/shared/admin-search-input";
import { CustomersFilterChips } from "./customers-filter-chips";
import type { CustomerFiltersState } from "./types";

interface CustomersTableToolbarProps {
  filters: CustomerFiltersState;
  onChange: (filters: CustomerFiltersState) => void;
  onReset: () => void;
  onExport: () => void;
  totalFiltered: number;
  isPending?: boolean;
}

export function CustomersTableToolbar({
  filters,
  onChange,
  onReset,
  onExport,
  totalFiltered,
  isPending = false,
}: CustomersTableToolbarProps) {
  const t = useTranslations("admin.customers");

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex-1 min-w-[260px] max-w-md">
          <AdminSearchInput
            value={filters.search}
            onSearch={(search) => onChange({ ...filters, search })}
            onClear={() => onChange({ ...filters, search: "" })}
            placeholder={t("searchPlaceholder")}
            ariaLabel={t("searchPlaceholder")}
            isLoading={isPending}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={filters.status}
            onValueChange={(val) =>
              onChange({
                ...filters,
                status: val as CustomerFiltersState["status"],
              })
            }
          >
            <SelectTrigger
              className="min-h-11 h-11 text-xs font-medium min-w-[140px]"
              aria-label={t("filterStatus")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("filterStatus")}: {t("filterAll")}
              </SelectItem>
              <SelectItem value="active">{t("statusActive")}</SelectItem>
              <SelectItem value="blocked">{t("statusBlocked")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.type}
            onValueChange={(val) =>
              onChange({
                ...filters,
                type: val as CustomerFiltersState["type"],
              })
            }
          >
            <SelectTrigger
              className="min-h-11 h-11 text-xs font-medium min-w-[140px]"
              aria-label={t("filterType")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("filterType")}: {t("filterAll")}
              </SelectItem>
              <SelectItem value="registered">{t("typeRegistered")}</SelectItem>
              <SelectItem value="guest">{t("typeGuest")}</SelectItem>
            </SelectContent>
          </Select>

          <label className="inline-flex items-center gap-2 min-h-11 px-3 rounded-lg border border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <Checkbox
              checked={filters.hasOrdered}
              onCheckedChange={(checked) =>
                onChange({ ...filters, hasOrdered: checked })
              }
            />
            <span>{t("filterHasOrdered")}</span>
          </label>

          <label className="inline-flex items-center gap-2 min-h-11 px-3 rounded-lg border border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <Checkbox
              checked={filters.hideTestAccounts}
              onCheckedChange={(checked) =>
                onChange({ ...filters, hideTestAccounts: checked })
              }
            />
            <span>{t("filterHideTest")}</span>
          </label>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            className="min-h-11 text-xs font-semibold inline-flex items-center gap-1.5 press"
            aria-label={t("export")}
          >
            <Download className="size-3.5" />
            <span>{t("export")}</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground pt-1 border-t border-border">
        <span className="font-semibold text-foreground flex items-center gap-1">
          <Filter className="size-3 text-muted-foreground" />
          <span>{t("dateRange")} :</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">
            {t("dateFrom")}
          </span>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              onChange({ ...filters, dateFrom: e.target.value })
            }
            className="min-h-10 text-base sm:text-xs w-40 border border-border rounded-md bg-background"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">
            {t("dateTo")}
          </span>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            className="min-h-10 text-base sm:text-xs w-40 border border-border rounded-md bg-background"
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
