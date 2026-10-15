import { getTranslations } from "next-intl/server";
import { getAdminDailyReconciliation, getAdminReconciliationHistory } from "@/services/admin";
import { PageHeader } from "@/components/admin/shared/page-header";
import { DateNavigator } from "@/components/admin/shared/date-navigator";
import { CashSummaryCards } from "@/components/admin/cash/cash-summary-cards";
import { CouriersReconciliationTable } from "@/components/admin/cash/couriers-reconciliation-table";
import { ReconciliationHistoryTable } from "@/components/admin/cash/reconciliation-history-table";
import { formatFrenchDateLong } from "@/lib/cash-formatters";

interface AdminCashPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function AdminCashPage({ searchParams }: AdminCashPageProps) {
  const t = await getTranslations("admin.cash");
  const params = await searchParams;

  // Default to today in Africa/Lubumbashi timezone (Eastern DRC UTC+2)
  const todayLubumbashi = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lubumbashi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const selectedDate =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) && params.date <= todayLubumbashi
      ? params.date
      : todayLubumbashi;

  const [dailyResult, historyResult] = await Promise.all([
    getAdminDailyReconciliation(selectedDate),
    getAdminReconciliationHistory(100),
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

  const historyLogs = historyResult.ok ? historyResult.value : [];

  const couriersCount = dailyData.couriers.length;
  const reconciledCount = dailyData.couriers.filter((c) => c.status === "confirmed").length;
  const pendingCount = couriersCount - reconciledCount;
  const formattedDateLong = formatFrenchDateLong(selectedDate);

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Title, Subtitle, and DateNavigator */}
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={<DateNavigator currentDate={selectedDate} maxDate={todayLubumbashi} />}
      />

      {!dailyResult.ok && (
        <div
          role="alert"
          className="p-4 bg-destructive-light border border-destructive-base/30 rounded-xl text-xs text-destructive-base font-medium"
        >
          {dailyResult.error}
        </div>
      )}

      {/* 2. KPI Summary Cards */}
      <CashSummaryCards
        summary={{
          ...dailyData.summary,
          couriersCount,
          reconciledCount,
          pendingCount,
        }}
      />

      {/* 3. Section Heading and Couriers Reconciliation Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-1">
          <h2 className="text-sm font-bold text-heading font-display">
            {t("couriersSectionHeading", { date: formattedDateLong })}
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            {t("activeCouriersCount", { count: couriersCount })} · {t("reconciledCountSummary", { reconciled: reconciledCount, pending: pendingCount })}
          </span>
        </div>

        <CouriersReconciliationTable
          couriers={dailyData.couriers}
          businessDate={selectedDate}
        />
      </div>

      {/* 4. History Table with per-row reversal, filters, and CSV export */}
      <div className="pt-2">
        <ReconciliationHistoryTable logs={historyLogs} />
      </div>
    </div>
  );
}
