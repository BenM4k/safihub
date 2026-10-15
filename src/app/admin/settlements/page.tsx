import { getTranslations } from "next-intl/server";
import {
  getAdminHouseSettlements,
  getAdminCourierSettlements,
  getAdminSettlementHistory,
} from "@/services/admin";
import { PageHeader } from "@/components/admin/shared/page-header";
import { SettlementsView } from "@/components/admin/settlements/settlements-view";
import { getWeekBounds } from "@/components/admin/settlements/period-utils";

interface AdminSettlementsPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function AdminSettlementsPage({
  searchParams,
}: AdminSettlementsPageProps) {
  const t = await getTranslations("admin.settlements");
  const params = await searchParams;

  const currentBounds = getWeekBounds();
  const selectedPeriod =
    params.period && /^\d{4}-W\d{2}$/.test(params.period)
      ? params.period
      : currentBounds.weekString;

  const [housesResult, couriersResult, historyResult] = await Promise.all([
    getAdminHouseSettlements(),
    getAdminCourierSettlements(),
    getAdminSettlementHistory(100),
  ]);

  const housesData = housesResult.ok
    ? housesResult.value
    : {
        houses: [],
        totalOwedToHousesCDF: 0,
        housesWithBalanceCount: 0,
        oldestUnpaidDays: 0,
      };

  const couriersData = couriersResult.ok
    ? couriersResult.value
    : {
        couriers: [],
        totalOwedToCouriersCDF: 0,
        couriersWithBalanceCount: 0,
        oldestUnpaidDays: 0,
      };

  const historyLogs = historyResult.ok ? historyResult.value : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />

      {(!housesResult.ok || !couriersResult.ok) && (
        <div
          role="alert"
          className="p-4 bg-destructive-light border border-destructive-base/30 rounded-xl text-xs text-destructive-base font-medium"
        >
          {housesResult.ok ? "" : housesResult.error}
          {!housesResult.ok && !couriersResult.ok ? " · " : ""}
          {couriersResult.ok ? "" : couriersResult.error}
        </div>
      )}

      <SettlementsView
        houses={housesData.houses}
        couriers={couriersData.couriers}
        historyLogs={historyLogs}
        housesSummary={{
          totalOwedCDF: housesData.totalOwedToHousesCDF,
          housesWithBalanceCount: housesData.housesWithBalanceCount,
          oldestUnpaidDays: housesData.oldestUnpaidDays ?? 0,
        }}
        couriersSummary={{
          totalOwedCDF: couriersData.totalOwedToCouriersCDF,
          couriersWithBalanceCount: couriersData.couriersWithBalanceCount,
          oldestUnpaidDays: couriersData.oldestUnpaidDays ?? 0,
        }}
        periodString={selectedPeriod}
      />
    </div>
  );
}
