"use client";

import { useTranslations } from "next-intl";
import { Building2, Bike } from "lucide-react";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { formatMoney } from "@/lib/cash-formatters";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <KpiCard
        label={t("kpiHousesLabel")}
        value={formatMoney(housesTotalOwedCDF, "CDF")}
        icon={Building2}
        tooltip={t("balanceOwed")}
        secondary={<span className="font-medium text-ink-700">{houseSecondary}</span>}
        variant={housesWithBalanceCount > 0 ? "warning" : "default"}
        isSelected={activeFilter === "houses"}
        onClick={handleHouseClick}
      />

      <KpiCard
        label={t("kpiCouriersLabel")}
        value={formatMoney(couriersTotalOwedCDF, "CDF")}
        icon={Bike}
        tooltip={t("balanceOwed")}
        secondary={<span className="font-medium text-ink-700">{courierSecondary}</span>}
        variant={couriersWithBalanceCount > 0 ? "warning" : "default"}
        isSelected={activeFilter === "couriers"}
        onClick={handleCourierClick}
      />
    </div>
  );
}
