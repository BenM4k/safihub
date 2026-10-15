"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { ReconcileCourierDialog, type ReconcileCourierData } from "./reconcile-courier-dialog";
import { DepositFloatDialog } from "./deposit-float-dialog";
import { CourierReconciliationRowItem } from "./courier-reconciliation-row-item";
import type { ReconcileOrder } from "./reconcile-order-breakdown";

export interface CourierReconciliationRow {
  courierId: string;
  name: string | null;
  phone: string | null;
  expectedCashCDF: number;
  expectedCashUSD: number;
  heldCashCDF: number;
  securityDeposit: number;
  changeFloat: number;
  reconciliationId: string | null;
  status: "open" | "confirmed";
  receivedAmount: number;
  difference: number;
  currency: "CDF" | "USD";
  note: string | null;
  reconciledByName?: string | null;
  reconciledAt?: Date | string | null;
  orders?: ReconcileOrder[];
}

interface CouriersReconciliationTableProps {
  couriers: CourierReconciliationRow[];
  businessDate: string;
}

export function CouriersReconciliationTable({
  couriers,
  businessDate,
}: CouriersReconciliationTableProps) {
  const t = useTranslations("admin.cash");

  const [selectedForRecon, setSelectedForRecon] = useState<CourierReconciliationRow | null>(null);
  const [selectedForDeposit, setSelectedForDeposit] = useState<CourierReconciliationRow | null>(null);

  return (
    <div className="bg-card rounded-xl border border-border-strong shadow-xs overflow-hidden">
      <div className="overflow-x-auto relative">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-strong bg-surface/95 backdrop-blur-xs text-ink-700 font-semibold sticky top-0 z-10">
              <th scope="col" className="py-3 px-4">
                <span className="flex items-center gap-1">{t("courier")}</span>
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                <span className="inline-flex items-center gap-1 justify-end cursor-help" title={t("expectedTooltip")}>
                  {t("expected")}
                  <Info className="size-3 text-ink-500" />
                </span>
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                <span className="inline-flex items-center gap-1 justify-end cursor-help" title={t("receivedTooltip")}>
                  {t("received")}
                  <Info className="size-3 text-ink-500" />
                </span>
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                <span className="inline-flex items-center gap-1 justify-end cursor-help" title={`${t("formulaTooltip")} · ${t("difference")}`}>
                  {t("difference")}
                  <Info className="size-3 text-ink-500" />
                </span>
              </th>
              <th scope="col" className="py-3 px-4 text-right hidden lg:table-cell">
                <span className="inline-flex items-center gap-1 justify-end cursor-help" title={t("heldCashTooltip")}>
                  {t("heldCash")}
                  <Info className="size-3 text-ink-500" />
                </span>
              </th>
              <th scope="col" className="py-3 px-4 text-right hidden md:table-cell">
                <span className="inline-flex items-center gap-1 justify-end cursor-help" title={t("depositAndFloatTooltip")}>
                  {t("depositAndFloat")}
                  <Info className="size-3 text-ink-500" />
                </span>
              </th>
              <th scope="col" className="py-3 px-4 text-center">
                {t("status")}
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-strong/80">
            {couriers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  {t("noActiveCouriers")}
                </td>
              </tr>
            ) : (
              couriers.map((c) => (
                <CourierReconciliationRowItem
                  key={c.courierId}
                  courier={c}
                  onOpenReconcile={setSelectedForRecon}
                  onOpenDeposit={setSelectedForDeposit}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedForRecon && (
        <ReconcileCourierDialog
          isOpen={true}
          onClose={() => setSelectedForRecon(null)}
          courier={selectedForRecon as ReconcileCourierData}
          businessDate={businessDate}
        />
      )}

      {selectedForDeposit && (
        <DepositFloatDialog
          isOpen={true}
          onClose={() => setSelectedForDeposit(null)}
          courier={selectedForDeposit}
        />
      )}
    </div>
  );
}
