import { getTranslations } from "next-intl/server";
import { getAdminDailyReconciliation, getAdminReconciliationHistory } from "@/services/admin";
import { CashSummaryCards } from "@/components/admin/cash/cash-summary-cards";
import { CouriersReconciliationTable } from "@/components/admin/cash/couriers-reconciliation-table";
import { ReconciliationHistoryTable } from "@/components/admin/cash/reconciliation-history-table";
import { DateFilterForm } from "@/components/admin/cash/date-filter-form";

interface AdminCashPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function AdminCashPage({ searchParams }: AdminCashPageProps) {
  const t = await getTranslations("admin.cash");
  const params = await searchParams;

  // Default to today in Africa/Lubumbashi timezone
  const todayLubumbashi = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lubumbashi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const selectedDate = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
    ? params.date
    : todayLubumbashi;

  const [dailyResult, historyResult] = await Promise.all([
    getAdminDailyReconciliation(selectedDate),
    getAdminReconciliationHistory(30),
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-heading tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>

        <DateFilterForm currentDate={selectedDate} />
      </div>

      {!dailyResult.ok && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-destructive">
          {dailyResult.error}
        </div>
      )}

      <CashSummaryCards summary={dailyData.summary} />

      <div className="space-y-2">
        <h2 className="text-sm font-bold text-heading">
          {t("title")} — {selectedDate}
        </h2>
        <CouriersReconciliationTable
          couriers={dailyData.couriers}
          businessDate={selectedDate}
        />
      </div>

      <ReconciliationHistoryTable logs={historyLogs} />
    </div>
  );
}
