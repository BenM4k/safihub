import { getTranslations } from "next-intl/server";
import { getAdminDailyReconciliation } from "@/services/admin";
import { formatFrenchDateLong } from "@/lib/cash-formatters";
import { CashSummaryCards } from "./cash-summary-cards";
import { CouriersReconciliationTable } from "./couriers-reconciliation-table";

interface CashDailyStreamProps {
  selectedDate: string;
}

export async function CashDailyStream({ selectedDate }: CashDailyStreamProps) {
  const [t, dailyResult] = await Promise.all([
    getTranslations("admin.cash"),
    getAdminDailyReconciliation(selectedDate),
  ]);

  const dailyData = dailyResult.ok
    ? dailyResult.value
    : {
        couriers: [],
        summary: {
          totalExpectedCDF: 0,
          totalReceivedCDF: 0,
          totalDiscrepancyCDF: 0,
        },
      };

  const couriersCount = dailyData.couriers.length;
  const reconciledCount = dailyData.couriers.filter(
    (c) => c.status === "confirmed"
  ).length;
  const pendingCount = couriersCount - reconciledCount;
  const formattedDateLong = formatFrenchDateLong(selectedDate);

  return (
    <div className="space-y-6 animate-enter">
      {!dailyResult.ok && (
        <div
          role="alert"
          className="p-4 bg-destructive-soft border border-destructive/30 rounded-xl text-xs text-destructive font-medium"
        >
          {dailyResult.error}
        </div>
      )}

      <CashSummaryCards
        summary={{
          ...dailyData.summary,
          couriersCount,
          reconciledCount,
          pendingCount,
        }}
      />

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-1">
          <h2 className="text-sm font-bold text-heading font-display">
            {t("couriersSectionHeading", { date: formattedDateLong })}
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            {t("activeCouriersCount", { count: couriersCount })} ·{" "}
            {t("reconciledCountSummary", {
              reconciled: reconciledCount,
              pending: pendingCount,
            })}
          </span>
        </div>

        <CouriersReconciliationTable
          couriers={dailyData.couriers}
          businessDate={selectedDate}
        />
      </div>
    </div>
  );
}
