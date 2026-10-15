"use client";

import { useState } from "react";
import { Building2, Bike } from "lucide-react";
import { SettlementPeriodSelector } from "./settlement-period-selector";
import { SettlementKpiCards } from "./settlement-kpi-cards";
import { HousesSettlementsTable } from "./houses-settlements-table";
import { CouriersSettlementsTable } from "./couriers-settlements-table";
import { SettlementHistoryTable } from "./settlement-history-table";
import { SettlePayeeDialog } from "./settle-payee-dialog";
import { OrdersBreakdownDialog } from "./orders-breakdown-dialog";
import { SettlementReceiptModal } from "./settlement-receipt-modal";
import type {
  HouseSettlementRow,
  CourierSettlementRow,
  SettlementHistoryRow,
  PayeeSettlementTarget,
  DeliveredOrderBreakdown,
  SettlementReceiptData,
} from "./types";

interface SettlementsViewProps {
  houses: HouseSettlementRow[];
  couriers: CourierSettlementRow[];
  historyLogs: SettlementHistoryRow[];
  housesSummary: {
    totalOwedCDF: number;
    housesWithBalanceCount: number;
    oldestUnpaidDays: number;
  };
  couriersSummary: {
    totalOwedCDF: number;
    couriersWithBalanceCount: number;
    oldestUnpaidDays: number;
  };
  periodString?: string;
}

export function SettlementsView({
  houses,
  couriers,
  historyLogs,
  housesSummary,
  couriersSummary,
  periodString,
}: SettlementsViewProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "houses" | "couriers">("all");
  const [settleTarget, setSettleTarget] = useState<PayeeSettlementTarget | null>(null);
  const [ordersModal, setOrdersModal] = useState<{
    isOpen: boolean;
    name: string;
    type: "house" | "courier";
    orders: DeliveredOrderBreakdown[];
  }>({
    isOpen: false,
    name: "",
    type: "house",
    orders: [],
  });
  const [receiptData, setReceiptData] = useState<SettlementReceiptData | null>(null);

  const showHouses = activeFilter === "all" || activeFilter === "houses";
  const showCouriers = activeFilter === "all" || activeFilter === "couriers";

  return (
    <div className="space-y-6">
      {/* Period navigation and next settlement indicator */}
      <SettlementPeriodSelector currentWeekString={periodString} />

      {/* Dominant KPI Cards */}
      <SettlementKpiCards
        housesTotalOwedCDF={housesSummary.totalOwedCDF}
        housesWithBalanceCount={housesSummary.housesWithBalanceCount}
        housesOldestUnpaidDays={housesSummary.oldestUnpaidDays}
        couriersTotalOwedCDF={couriersSummary.totalOwedCDF}
        couriersWithBalanceCount={couriersSummary.couriersWithBalanceCount}
        couriersOldestUnpaidDays={couriersSummary.oldestUnpaidDays}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Pressings Section */}
      {showHouses && (
        <section id="pressings-section" className="space-y-3 scroll-mt-20">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-heading flex items-center gap-2">
              <Building2 className="size-4 text-violet-600" />
              <span>Pressings ({houses.length})</span>
            </h2>
          </div>
          <HousesSettlementsTable
            houses={houses}
            onSettle={(target) => setSettleTarget(target)}
            onViewOrders={(name, orders) =>
              setOrdersModal({ isOpen: true, name, type: "house", orders })
            }
          />
        </section>
      )}

      {/* Coursiers Section */}
      {showCouriers && (
        <section id="coursiers-section" className="space-y-3 scroll-mt-20">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-heading flex items-center gap-2">
              <Bike className="size-4 text-emerald-600" />
              <span>Coursiers ({couriers.length})</span>
            </h2>
          </div>
          <CouriersSettlementsTable
            couriers={couriers}
            onSettle={(target) => setSettleTarget(target)}
            onViewOrders={(name, orders) =>
              setOrdersModal({ isOpen: true, name, type: "courier", orders })
            }
          />
        </section>
      )}

      {/* History Section */}
      <section className="pt-2">
        <SettlementHistoryTable logs={historyLogs} />
      </section>

      {/* Dialogs */}
      <SettlePayeeDialog
        isOpen={Boolean(settleTarget)}
        onClose={() => setSettleTarget(null)}
        target={settleTarget}
        defaultPeriod={periodString}
        onSettlementSuccess={(receipt) => setReceiptData(receipt)}
      />

      <OrdersBreakdownDialog
        isOpen={ordersModal.isOpen}
        onClose={() => setOrdersModal((prev) => ({ ...prev, isOpen: false }))}
        payeeName={ordersModal.name}
        payeeType={ordersModal.type}
        orders={ordersModal.orders}
      />

      <SettlementReceiptModal
        isOpen={Boolean(receiptData)}
        onClose={() => setReceiptData(null)}
        data={receiptData}
      />
    </div>
  );
}
