"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { SettlementStatusBadge } from "./settlement-status-badge";
import { MoneyCell } from "@/components/admin/shared/money-cell";
import { PhoneCell } from "@/components/admin/shared/phone-cell";
import { formatMoney, formatFrenchDateLong } from "@/lib/cash-formatters";
import type { CourierSettlementRow, PayeeSettlementTarget, DeliveredOrderBreakdown } from "./types";

interface CourierSettlementRowProps {
  courier: CourierSettlementRow;
  onSettle: (target: PayeeSettlementTarget) => void;
  onViewOrders: (name: string, orders: DeliveredOrderBreakdown[]) => void;
}

export function CourierSettlementRowItem({
  courier: c,
  onSettle,
  onViewOrders,
}: CourierSettlementRowProps) {
  const isZero = c.balanceOwedCDF <= 0;
  const lastFormatted =
    c.lastPaymentAmount && c.lastPaymentAt
      ? `${formatMoney(c.lastPaymentAmount, "CDF")} · ${formatFrenchDateLong(c.lastPaymentAt)}`
      : "—";

  const hasDiscrepancy = c.cashDiscrepancyCDF !== 0;

  return (
    <TableRow className="hover:bg-muted/40 transition-colors">
      <TableCell className="py-3 px-4">
        <div className="font-bold text-foreground text-sm">{c.name ?? c.courierId}</div>
        {c.phone && <PhoneCell phone={c.phone} />}
        {hasDiscrepancy && (
          <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-2xs font-bold text-amber-700 dark:text-amber-400">
            <AlertCircle className="size-3" />
            <span>Écart de caisse : {formatMoney(c.cashDiscrepancyCDF, "CDF")}</span>
          </div>
        )}
      </TableCell>
      <TableCell className="py-3 px-3 text-center">
        <button
          type="button"
          onClick={() => onViewOrders(c.name ?? "Coursier", c.deliveredOrders)}
          className="font-mono font-bold text-primary hover:underline cursor-pointer text-xs"
          title="Voir le détail des missions"
        >
          {c.missionsCount}
        </button>
      </TableCell>
      <TableCell className="py-3 px-3 text-right hidden sm:table-cell">
        <MoneyCell amount={c.totalEarnedCDF} />
      </TableCell>
      <TableCell className="py-3 px-3 text-right hidden md:table-cell">
        <MoneyCell amount={c.totalPaidCDF} className="text-muted-foreground font-semibold" />
      </TableCell>
      <TableCell className="py-3 px-4 text-right">
        <div className="flex flex-col items-end gap-1">
          <MoneyCell
            amount={c.balanceOwedCDF}
            className={isZero ? "text-muted-foreground font-semibold" : "font-black text-sm text-foreground"}
          />
          <SettlementStatusBadge
            balanceOwedCDF={c.balanceOwedCDF}
            oldestUnpaidDate={c.oldestUnpaidDate}
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
                id: c.courierId,
                name: c.name ?? c.courierId,
                type: "courier",
                subtitle: c.phone ? `Coursier · ${c.phone}` : "Coursier",
                balanceOwedCDF: c.balanceOwedCDF,
                cashDiscrepancyCDF: c.cashDiscrepancyCDF,
                deliveredOrders: c.deliveredOrders,
              })
            }
            className="h-8 px-3 text-xs font-semibold"
          >
            Payer
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
