import { Suspense } from "react";
import {
  getAdminCourierSettlements,
  getAdminHouseSettlements,
} from "@/services/admin";
import { SettlementsView } from "./settlements-view";
import { SettlementHistoryStream } from "./settlement-history-stream";
import { SettlementHistorySkeleton } from "./settlements-loading-skeleton";

interface SettlementsStreamContentProps {
  selectedPeriod: string;
}

export async function SettlementsStreamContent({
  selectedPeriod,
}: SettlementsStreamContentProps) {
  const [housesResult, couriersResult] = await Promise.all([
    getAdminHouseSettlements(),
    getAdminCourierSettlements(),
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
        historySlot={
          <Suspense fallback={<SettlementHistorySkeleton />}>
            <SettlementHistoryStream />
          </Suspense>
        }
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
