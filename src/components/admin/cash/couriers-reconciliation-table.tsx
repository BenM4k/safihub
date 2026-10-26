"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto relative">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 font-semibold sticky top-0 z-10 hover:bg-muted/40">
              <TableHead className="py-3 px-4 font-semibold text-foreground">
                <span className="flex items-center gap-1">{t("courier")}</span>
              </TableHead>
              <TableHead className="py-3 px-4 text-right font-semibold text-foreground">
                <span className="inline-flex items-center gap-1 justify-end cursor-help" title={t("expectedTooltip")}>
                  {t("expected")}
                  <Info className="size-3 text-muted-foreground" />
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 text-right font-semibold text-foreground">
                <span className="inline-flex items-center gap-1 justify-end cursor-help" title={t("receivedTooltip")}>
                  {t("received")}
                  <Info className="size-3 text-muted-foreground" />
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 text-right font-semibold text-foreground">
                <span className="inline-flex items-center gap-1 justify-end cursor-help" title={`${t("formulaTooltip")} · ${t("difference")}`}>
                  {t("difference")}
                  <Info className="size-3 text-muted-foreground" />
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 text-right hidden lg:table-cell font-semibold text-foreground">
                <span className="inline-flex items-center gap-1 justify-end cursor-help" title={t("heldCashTooltip")}>
                  {t("heldCash")}
                  <Info className="size-3 text-muted-foreground" />
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 text-right hidden md:table-cell font-semibold text-foreground">
                <span className="inline-flex items-center gap-1 justify-end cursor-help" title={t("depositAndFloatTooltip")}>
                  {t("depositAndFloat")}
                  <Info className="size-3 text-muted-foreground" />
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 text-center font-semibold text-foreground">
                {t("status")}
              </TableHead>
              <TableHead className="py-3 px-4 text-right font-semibold text-foreground">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {couriers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  {t("noActiveCouriers")}
                </TableCell>
              </TableRow>
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
          </TableBody>
        </Table>
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
