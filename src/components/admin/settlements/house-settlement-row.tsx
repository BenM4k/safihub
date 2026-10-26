"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SettlementStatusBadge } from "./settlement-status-badge";
import { MoneyCell } from "@/components/admin/shared/money-cell";
import { formatMoney, formatFrenchDateLong } from "@/lib/cash-formatters";
import type { HouseSettlementRow, PayeeSettlementTarget, DeliveredOrderBreakdown } from "./types";

interface HouseSettlementRowProps {
  house: HouseSettlementRow;
  onSettle: (target: PayeeSettlementTarget) => void;
  onViewOrders: (name: string, orders: DeliveredOrderBreakdown[]) => void;
}

export function HouseSettlementRowItem({
  house: h,
  onSettle,
  onViewOrders,
}: HouseSettlementRowProps) {
  const isZero = h.balanceOwedCDF <= 0;
  const lastFormatted =
    h.lastSettlementAmount && h.lastSettlementAt
      ? `${formatMoney(h.lastSettlementAmount, "CDF")} · ${formatFrenchDateLong(h.lastSettlementAt)}`
      : "—";

  return (
    <TableRow className="hover:bg-muted/40 transition-colors">
      <TableCell className="py-3 px-4">
        <div className="font-bold text-foreground text-sm">{h.name}</div>
        {h.neighborhoodName && (
          <div className="text-2xs text-muted-foreground">{h.neighborhoodName}</div>
        )}
      </TableCell>
      <TableCell className="py-3 px-3 text-center">
        <button
          type="button"
          onClick={() => onViewOrders(h.name, h.deliveredOrders)}
          className="font-mono font-bold text-primary hover:underline cursor-pointer text-xs"
          title="Voir le détail des commandes"
        >
          {h.deliveredOrdersCount}
        </button>
      </TableCell>
      <TableCell className="py-3 px-3 text-right hidden sm:table-cell">
        <MoneyCell amount={h.totalOwedCDF} />
      </TableCell>
      <TableCell className="py-3 px-3 text-right hidden md:table-cell">
        <MoneyCell amount={h.totalSettledCDF} className="text-muted-foreground font-semibold" />
      </TableCell>
      <TableCell className="py-3 px-4 text-right">
        <div className="flex flex-col items-end gap-1">
          <MoneyCell
            amount={h.balanceOwedCDF}
            className={isZero ? "text-muted-foreground font-semibold" : "font-black text-sm text-foreground"}
          />
          <SettlementStatusBadge
            balanceOwedCDF={h.balanceOwedCDF}
            oldestUnpaidDate={h.oldestUnpaidDate}
          />
        </div>
      </TableCell>
      <TableCell className="py-3 px-3 font-mono text-2xs text-muted-foreground hidden lg:table-cell">
        {lastFormatted}
      </TableCell>
      <TableCell className="py-3 px-4 text-right whitespace-nowrap">
        {isZero ? (
          <span className="text-2xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 inline-flex items-center gap-1">
            À jour
          </span>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={() =>
              onSettle({
                id: h.houseId,
                name: h.name,
                type: "house",
                subtitle: h.neighborhoodName ? `Pressing · ${h.neighborhoodName}` : "Pressing partenaire",
                balanceOwedCDF: h.balanceOwedCDF,
                grossTotalCDF: h.grossTotalCDF,
                commissionTotalCDF: h.commissionTotalCDF,
                deliveredOrders: h.deliveredOrders,
              })
            }
            className="h-8 px-3 text-xs font-semibold"
          >
            Régler
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
