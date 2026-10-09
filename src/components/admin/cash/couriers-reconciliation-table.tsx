"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Coins, ShieldAlert } from "lucide-react";
import { ReconcileCourierDialog } from "./reconcile-courier-dialog";
import { DepositFloatDialog } from "./deposit-float-dialog";

interface CourierRow {
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
}

interface CouriersReconciliationTableProps {
  couriers: CourierRow[];
  businessDate: string;
}

export function CouriersReconciliationTable({
  couriers,
  businessDate,
}: CouriersReconciliationTableProps) {
  const t = useTranslations("admin.cash");

  const [selectedCourierForRecon, setSelectedCourierForRecon] = useState<CourierRow | null>(null);
  const [selectedCourierForDeposit, setSelectedCourierForDeposit] = useState<CourierRow | null>(null);

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-slate-50/80 text-muted-foreground font-semibold">
              <th className="py-3 px-4">{t("courier")}</th>
              <th className="py-3 px-4">{t("expected")}</th>
              <th className="py-3 px-4">{t("received")}</th>
              <th className="py-3 px-4">{t("difference")}</th>
              <th className="py-3 px-4">{t("heldCash")}</th>
              <th className="py-3 px-4">{t("deposit")} / {t("float")}</th>
              <th className="py-3 px-4">{t("status")}</th>
              <th className="py-3 px-4 text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {couriers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  Aucun coursier actif trouvé
                </td>
              </tr>
            ) : (
              couriers.map((c) => {
                const isConfirmed = c.status === "confirmed";
                const hasDiscrepancy = isConfirmed && c.difference !== 0;

                return (
                  <tr key={c.courierId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-heading">
                      <div>{c.name ?? c.courierId}</div>
                      {c.phone && <div className="text-2xs text-muted-foreground">{c.phone}</div>}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {c.expectedCashCDF.toLocaleString()} CDF
                      {c.expectedCashUSD > 0 && (
                        <span className="block text-2xs text-muted-foreground">
                          (${c.expectedCashUSD} USD)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-heading">
                      {c.receivedAmount.toLocaleString()} CDF
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {c.difference === 0 ? (
                        <span className="text-slate-400">0 CDF</span>
                      ) : (
                        <span className={c.difference < 0 ? "text-rose-600 font-bold" : "text-amber-600 font-bold"}>
                          {c.difference > 0 ? "+" : ""}{c.difference.toLocaleString()} CDF
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-ink-900">
                        {c.heldCashCDF.toLocaleString()} CDF
                      </span>
                    </td>
                    <td className="py-3 px-4 text-2xs text-muted-foreground">
                      <div>Caution : <span className="font-semibold text-heading">{c.securityDeposit.toLocaleString()}</span></div>
                      <div>Fond : <span className="font-semibold text-heading">{c.changeFloat.toLocaleString()}</span></div>
                    </td>
                    <td className="py-3 px-4">
                      {isConfirmed ? (
                        hasDiscrepancy ? (
                          <Badge variant="destructive" className="text-2xs gap-1">
                            <ShieldAlert className="size-3" /> Écart
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-2xs gap-1">
                            <CheckCircle2 className="size-3" /> {t("statusConfirmed")}
                          </Badge>
                        )
                      ) : (
                        <Badge variant="secondary" className="text-2xs gap-1">
                          <Clock className="size-3" /> {t("statusOpen")}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant={isConfirmed ? "outline" : "default"}
                        onClick={() => setSelectedCourierForRecon(c)}
                        className="h-8 text-xs"
                      >
                        {t("reconcileBtn")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedCourierForDeposit(c)}
                        title={t("depositFloatBtn")}
                        className="h-8 w-8 p-0"
                      >
                        <Coins className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedCourierForRecon && (
        <ReconcileCourierDialog
          isOpen={true}
          onClose={() => setSelectedCourierForRecon(null)}
          courier={selectedCourierForRecon}
          businessDate={businessDate}
        />
      )}

      {selectedCourierForDeposit && (
        <DepositFloatDialog
          isOpen={true}
          onClose={() => setSelectedCourierForDeposit(null)}
          courier={selectedCourierForDeposit}
        />
      )}
    </div>
  );
}
