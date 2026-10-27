"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/order-formatters";
import { cn } from "@/lib/utils";

interface PartnerRevenueKpiCellProps {
  netRevenue: number;
  revenuePeriod: "day" | "week";
  onPeriodChange: (period: "day" | "week") => void;
  revenueTrendPercent: number | null;
  houseSlug: string;
  className?: string;
}

export function PartnerRevenueKpiCell({
  netRevenue,
  revenuePeriod,
  onPeriodChange,
  revenueTrendPercent,
  houseSlug,
  className,
}: PartnerRevenueKpiCellProps) {
  const t = useTranslations("house.dashboard");

  return (
    <div
      className={cn(
        "flex-1 p-2.5 sm:p-3 text-left transition-colors rounded-xl hover:bg-muted/30 group flex flex-col justify-between",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {t("netRevenue")}
          </span>
          <div className="inline-flex rounded-md bg-secondary p-0.5 text-[10px] font-bold shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onPeriodChange("day");
              }}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                revenuePeriod === "day"
                  ? "bg-card text-heading shadow-xs"
                  : "text-muted-foreground hover:text-heading"
              }`}
            >
              {t("periodDay")}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onPeriodChange("week");
              }}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                revenuePeriod === "week"
                  ? "bg-card text-heading shadow-xs"
                  : "text-muted-foreground hover:text-heading"
              }`}
            >
              {t("periodWeek")}
            </button>
          </div>
        </div>
        <Link
          href={`/partner/${houseSlug}/settlements`}
          className="block cursor-pointer mt-1 sm:mt-1.5"
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 truncate">
              {formatAmount(netRevenue)}
            </span>
            <ChevronRight className="size-3.5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-1 text-[11px] truncate mt-0.5 sm:mt-1">
        {revenueTrendPercent !== null ? (
          <span
            className={`inline-flex items-center gap-0.5 font-bold ${
              revenueTrendPercent >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive"
            }`}
          >
            {revenueTrendPercent >= 0 ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            <span>{Math.abs(revenueTrendPercent)}%</span>
            <span className="text-muted-foreground font-normal">{t("vsPrevious")}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">{t("afterCommission")}</span>
        )}
      </div>
    </div>
  );
}
