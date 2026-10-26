"use client";

import { useTranslations } from "next-intl";
import { Building2, Bike } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/cash-formatters";
import { cn } from "@/lib/utils";

interface SettlementKpiCardsProps {
  housesTotalOwedCDF: number;
  housesWithBalanceCount: number;
  housesOldestUnpaidDays: number;
  couriersTotalOwedCDF: number;
  couriersWithBalanceCount: number;
  couriersOldestUnpaidDays: number;
  activeFilter?: "all" | "houses" | "couriers";
  onFilterChange?: (filter: "all" | "houses" | "couriers") => void;
}

export function SettlementKpiCards({
  housesTotalOwedCDF,
  housesWithBalanceCount,
  housesOldestUnpaidDays,
  couriersTotalOwedCDF,
  couriersWithBalanceCount,
  couriersOldestUnpaidDays,
  activeFilter = "all",
  onFilterChange,
}: SettlementKpiCardsProps) {
  const t = useTranslations("admin.settlements");

  const handleHouseClick = () => {
    if (onFilterChange) {
      onFilterChange(activeFilter === "houses" ? "all" : "houses");
    }
    const element = document.getElementById("pressings-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCourierClick = () => {
    if (onFilterChange) {
      onFilterChange(activeFilter === "couriers" ? "all" : "couriers");
    }
    const element = document.getElementById("coursiers-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const houseSecondary =
    housesWithBalanceCount > 0
      ? `${housesWithBalanceCount} ${
          housesWithBalanceCount > 1 ? "pressings à régler" : "pressing à régler"
        }${housesOldestUnpaidDays > 0 ? ` · Retard : ${housesOldestUnpaidDays} j` : ""}`
      : "Tous les pressings sont à jour";

  const courierSecondary =
    couriersWithBalanceCount > 0
      ? `${couriersWithBalanceCount} ${
          couriersWithBalanceCount > 1 ? "coursiers à régler" : "coursier à régler"
        }${couriersOldestUnpaidDays > 0 ? ` · Retard : ${couriersOldestUnpaidDays} j` : ""}`
      : "Tous les coursiers sont à jour";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-1">
      {/* 1. Pressings */}
      <button
        type="button"
        onClick={handleHouseClick}
        className={cn(
          "flex-1 p-3 text-left space-y-1 transition-colors rounded-lg",
          activeFilter === "houses" ? "bg-muted/60" : "hover:bg-muted/30"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {t("kpiHousesLabel")}
          </p>
          <Building2 className="size-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
        </div>
        <p className="text-2xl font-bold font-mono tabular-nums text-foreground mt-1.5">
          {formatMoney(housesTotalOwedCDF, "CDF")}
        </p>
        <p className="text-[11px] text-muted-foreground mt-1 truncate">
          {houseSecondary}
        </p>
      </button>

      <Separator orientation="vertical" className="hidden sm:block h-12 mx-4 shrink-0" />
      <Separator orientation="horizontal" className="sm:hidden my-2" />

      {/* 2. Coursiers */}
      <button
        type="button"
        onClick={handleCourierClick}
        className={cn(
          "flex-1 p-3 text-left space-y-1 transition-colors rounded-lg",
          activeFilter === "couriers" ? "bg-muted/60" : "hover:bg-muted/30"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {t("kpiCouriersLabel")}
          </p>
          <Bike className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </div>
        <p className="text-2xl font-bold font-mono tabular-nums text-foreground mt-1.5">
          {formatMoney(couriersTotalOwedCDF, "CDF")}
        </p>
        <p className="text-[11px] text-muted-foreground mt-1 truncate">
          {courierSecondary}
        </p>
      </button>
    </div>
  );
}
