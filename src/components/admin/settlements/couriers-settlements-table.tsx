"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { SettleCourierDialog } from "./settle-courier-dialog";

interface CourierSettlementRow {
  courierId: string;
  name: string | null;
  phone: string | null;
  totalEarnedCDF: number;
  totalPaidCDF: number;
  balanceOwedCDF: number;
  lastPaymentAt: Date | null;
}

interface CouriersSettlementsTableProps {
  couriers: CourierSettlementRow[];
}

export function CouriersSettlementsTable({ couriers }: CouriersSettlementsTableProps) {
  const t = useTranslations("admin.settlements");
  const [selectedCourier, setSelectedCourier] = useState<CourierSettlementRow | null>(null);

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-slate-50/80 text-muted-foreground font-semibold">
              <th className="py-3 px-4">{t("courier")}</th>
              <th className="py-3 px-4">{t("totalEarned")}</th>
              <th className="py-3 px-4">{t("totalSettled")}</th>
              <th className="py-3 px-4">{t("balanceOwed")}</th>
              <th className="py-3 px-4">{t("lastSettlement")}</th>
              <th className="py-3 px-4 text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {couriers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted-foreground">
                  {t("noPendingCouriers")}
                </td>
              </tr>
            ) : (
              couriers.map((c) => {
                const isZero = c.balanceOwedCDF === 0;

                return (
                  <tr key={c.courierId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-heading">
                      <div>{c.name ?? c.courierId}</div>
                      {c.phone && <div className="text-2xs text-muted-foreground">{c.phone}</div>}
                    </td>
                    <td className="py-3 px-4">{c.totalEarnedCDF.toLocaleString()} CDF</td>
                    <td className="py-3 px-4 text-muted-foreground">{c.totalPaidCDF.toLocaleString()} CDF</td>
                    <td className="py-3 px-4 font-bold text-heading">
                      {isZero ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-2xs gap-1">
                          <CheckCircle2 className="size-3" /> 0 CDF
                        </Badge>
                      ) : (
                        <span className="text-emerald-700 font-black">
                          {c.balanceOwedCDF.toLocaleString()} CDF
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-2xs">
                      {c.lastPaymentAt
                        ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(new Date(c.lastPaymentAt))
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        disabled={isZero}
                        onClick={() => setSelectedCourier(c)}
                        className="h-8 text-xs"
                      >
                        {t("settleCourierBtn")}
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedCourier && (
        <SettleCourierDialog
          isOpen={true}
          onClose={() => setSelectedCourier(null)}
          courier={selectedCourier}
        />
      )}
    </div>
  );
}
