"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { SettleHouseDialog } from "./settle-house-dialog";

interface HouseSettlementRow {
  houseId: string;
  name: string;
  neighborhoodName: string | null;
  totalOwedCDF: number;
  totalSettledCDF: number;
  balanceOwedCDF: number;
  lastSettlementAt: Date | null;
  deliveredOrdersCount: number;
}

interface HousesSettlementsTableProps {
  houses: HouseSettlementRow[];
}

export function HousesSettlementsTable({ houses }: HousesSettlementsTableProps) {
  const t = useTranslations("admin.settlements");
  const [selectedHouse, setSelectedHouse] = useState<HouseSettlementRow | null>(null);

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-slate-50/80 text-muted-foreground font-semibold">
              <th className="py-3 px-4">{t("houseName")}</th>
              <th className="py-3 px-4">{t("deliveredOrders")}</th>
              <th className="py-3 px-4">{t("totalEarned")}</th>
              <th className="py-3 px-4">{t("totalSettled")}</th>
              <th className="py-3 px-4">{t("balanceOwed")}</th>
              <th className="py-3 px-4">{t("lastSettlement")}</th>
              <th className="py-3 px-4 text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {houses.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-muted-foreground">
                  {t("noPendingHouses")}
                </td>
              </tr>
            ) : (
              houses.map((h) => {
                const isZero = h.balanceOwedCDF === 0;

                return (
                  <tr key={h.houseId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-heading">
                      <div>{h.name}</div>
                      {h.neighborhoodName && (
                        <div className="text-2xs text-muted-foreground">{h.neighborhoodName}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">{h.deliveredOrdersCount}</td>
                    <td className="py-3 px-4">{h.totalOwedCDF.toLocaleString()} CDF</td>
                    <td className="py-3 px-4 text-muted-foreground">{h.totalSettledCDF.toLocaleString()} CDF</td>
                    <td className="py-3 px-4 font-bold text-heading">
                      {isZero ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-2xs gap-1">
                          <CheckCircle2 className="size-3" /> 0 CDF
                        </Badge>
                      ) : (
                        <span className="text-primary font-black">
                          {h.balanceOwedCDF.toLocaleString()} CDF
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-2xs">
                      {h.lastSettlementAt
                        ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(new Date(h.lastSettlementAt))
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        disabled={isZero}
                        onClick={() => setSelectedHouse(h)}
                        className="h-8 text-xs"
                      >
                        {t("settleHouseBtn")}
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedHouse && (
        <SettleHouseDialog
          isOpen={true}
          onClose={() => setSelectedHouse(null)}
          house={selectedHouse}
        />
      )}
    </div>
  );
}
