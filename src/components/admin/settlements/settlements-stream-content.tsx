import {
  getAdminCourierSettlements,
  getAdminHouseSettlements,
  getAdminSettlementHistory,
} from "@/services/admin";
import { SettlementsView } from "./settlements-view";

interface SettlementsStreamContentProps {
  selectedPeriod: string;
}

export async function SettlementsStreamContent({
  selectedPeriod,
}: SettlementsStreamContentProps) {
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
    <div className="space-y-6 animate-enter">
      {(!housesResult.ok || !couriersResult.ok) && (
        <div
          role="alert"
          className="p-4 bg-destructive-soft border border-destructive/30 rounded-xl text-xs text-destructive font-medium"
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
