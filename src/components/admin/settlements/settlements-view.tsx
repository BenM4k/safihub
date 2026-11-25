"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Building2, Bike } from "lucide-react";
import { SettlementPeriodSelector } from "./settlement-period-selector";
import { SettlementKpiCards } from "./settlement-kpi-cards";
import { HousesSettlementsTable } from "./houses-settlements-table";
import { CouriersSettlementsTable } from "./couriers-settlements-table";
import { SettlementHistoryTable } from "./settlement-history-table";
import type {
  HouseSettlementRow,
  CourierSettlementRow,
  SettlementHistoryRow,
  PayeeSettlementTarget,
  DeliveredOrderBreakdown,
  SettlementReceiptData,
} from "./types";

const SettlePayeeDialog = dynamic(
  () => import("./settle-payee-dialog").then((m) => m.SettlePayeeDialog),
  { ssr: false }
);

const OrdersBreakdownDialog = dynamic(
  () =>
    import("./orders-breakdown-dialog").then((m) => m.OrdersBreakdownDialog),
  { ssr: false }
);

const SettlementReceiptModal = dynamic(
  () =>
    import("./settlement-receipt-modal").then((m) => m.SettlementReceiptModal),
  { ssr: false }
);

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
  const t = useTranslations("admin.settlements");
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
      <SettlementPeriodSelector currentWeekString={periodString} />

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

      {showHouses && (
        <section
          id="pressings-section"
          className="space-y-3 scroll-mt-20 animate-enter-fast"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              <span>{t("housesSectionTitle", { count: houses.length })}</span>
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

      {showCouriers && (
        <section
          id="coursiers-section"
          className="space-y-3 scroll-mt-20 animate-enter-fast"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Bike className="size-4 text-success" />
              <span>{t("couriersSectionTitle", { count: couriers.length })}</span>
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

      <section className="pt-2">
        <SettlementHistoryTable logs={historyLogs} />
      </section>

      {settleTarget && (
        <SettlePayeeDialog
          key={settleTarget.id}
          isOpen
          onClose={() => setSettleTarget(null)}
          target={settleTarget}
          defaultPeriod={periodString}
          onSettlementSuccess={(receipt) => setReceiptData(receipt)}
        />
      )}

      {ordersModal.isOpen && (
        <OrdersBreakdownDialog
          isOpen
          onClose={() => setOrdersModal((prev) => ({ ...prev, isOpen: false }))}
          payeeName={ordersModal.name}
          payeeType={ordersModal.type}
          orders={ordersModal.orders}
        />
      )}

      {receiptData && (
        <SettlementReceiptModal
          isOpen
          onClose={() => setReceiptData(null)}
          data={receiptData}
        />
      )}
    </div>
  );
}
