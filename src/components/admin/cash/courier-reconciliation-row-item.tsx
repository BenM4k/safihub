"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { Lock } from "lucide-react";
import { StatusPill } from "@/components/admin/shared/status-pill";
import { MoneyCell } from "@/components/admin/shared/money-cell";
import { PhoneCell } from "@/components/admin/shared/phone-cell";
import { formatFrenchDateTime } from "@/lib/cash-formatters";
import { CourierActionMenu } from "./courier-action-menu";
import type { CourierReconciliationRow } from "./couriers-reconciliation-table";

interface CourierReconciliationRowItemProps {
  courier: CourierReconciliationRow;
  onOpenReconcile: (c: CourierReconciliationRow) => void;
  onOpenDeposit: (c: CourierReconciliationRow) => void;
}

export function CourierReconciliationRowItem({
  courier: c,
  onOpenReconcile,
  onOpenDeposit,
}: CourierReconciliationRowItemProps) {
  const t = useTranslations("admin.cash");

  const isConfirmed = c.status === "confirmed";
  const orders = c.orders ?? [];
  const hasNoDeliveries = c.expectedCashCDF === 0 && orders.length === 0;

  return (
    <TableRow className="hover:bg-muted/40 transition-colors">
      {/* 1. Courier */}
      <TableCell className="py-3 px-4 font-semibold text-foreground">
        <div className="flex items-center gap-1.5">
          <span>{c.name ?? c.courierId}</span>
          {isConfirmed && (
            <span title={t("lockedRowNotice")} aria-label={t("lockedRowNotice")}>
              <Lock className="size-3.5 text-muted-foreground" />
            </span>
          )}
        </div>
        <PhoneCell phone={c.phone} />
        {isConfirmed && c.reconciledByName && (
          <div className="text-xs text-muted-foreground font-normal mt-0.5">
            {c.reconciledByName}
            {c.reconciledAt && ` · ${formatFrenchDateTime(c.reconciledAt)}`}
          </div>
        )}
      </TableCell>

      {/* 2. Attendu */}
      <TableCell className="py-3 px-4">
        <MoneyCell amount={c.expectedCashCDF} />
      </TableCell>

      {/* 3. Reçu */}
      <TableCell className="py-3 px-4">
        <MoneyCell amount={isConfirmed ? c.receivedAmount : null} />
      </TableCell>

      {/* 4. Écart */}
      <TableCell className="py-3 px-4">
        {isConfirmed ? (
          <MoneyCell amount={c.difference} isDiscrepancy />
        ) : (
          <span className="font-mono text-muted-foreground text-right block">—</span>
        )}
      </TableCell>

      {/* 5. Espèces détenues */}
      <TableCell className="py-3 px-4 hidden lg:table-cell">
        <MoneyCell amount={c.heldCashCDF} />
      </TableCell>

      {/* 6. Caution / Fond de caisse */}
      <TableCell className="py-3 px-4 text-right font-mono text-xs space-y-0.5 hidden md:table-cell">
        <div title={t("depositTooltip")}>
          <span className="text-muted-foreground font-sans">Caution : </span>
          <span className="font-bold text-foreground">{c.securityDeposit.toLocaleString("fr-FR")} CDF</span>
        </div>
        <div title={t("floatTooltip")}>
          <span className="text-muted-foreground font-sans">Fond : </span>
          <span className="font-medium text-foreground">{c.changeFloat.toLocaleString("fr-FR")} CDF</span>
        </div>
      </TableCell>

      {/* 7. Statut */}
      <TableCell className="py-3 px-4 text-center">
        {!isConfirmed ? (
          <StatusPill status="pending" />
        ) : c.difference === 0 ? (
          <StatusPill status="reconciled" />
        ) : c.difference < 0 ? (
          <StatusPill status="shortage" />
        ) : (
          <StatusPill status="surplus" />
        )}
      </TableCell>

      {/* 8. Actions */}
      <TableCell className="py-3 px-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          {hasNoDeliveries && !isConfirmed ? (
            <span className="text-xs text-muted-foreground font-medium px-2.5 py-1.5 bg-muted/50 rounded-md border border-border">
              {t("noOrdersToday")}
            </span>
          ) : !isConfirmed ? (
            <Button
              size="sm"
              variant="default"
              onClick={() => onOpenReconcile(c)}
              className="h-9 text-xs font-semibold px-3"
            >
              {t("reconcileBtn")}
            </Button>
          ) : null}

          <CourierActionMenu
            courierName={c.name ?? c.courierId}
            isConfirmed={isConfirmed}
            hasOrders={orders.length > 0}
            onReconcile={() => onOpenReconcile(c)}
            onManageDeposit={() => onOpenDeposit(c)}
            onViewOrders={() => onOpenReconcile(c)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
