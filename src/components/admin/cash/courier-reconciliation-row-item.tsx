"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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
    <tr className="hover:bg-surface/60 transition-colors">
      {/* 1. Courier */}
      <td className="py-3.5 px-4 font-semibold text-heading">
        <div className="flex items-center gap-1.5">
          <span>{c.name ?? c.courierId}</span>
          {isConfirmed && (
            <span title={t("lockedRowNotice")} aria-label={t("lockedRowNotice")}>
              <Lock className="size-3.5 text-ink-400" />
            </span>
          )}
        </div>
        <PhoneCell phone={c.phone} />
        {isConfirmed && c.reconciledByName && (
          <div className="text-xs text-ink-500 font-normal mt-0.5">
            {c.reconciledByName}
            {c.reconciledAt && ` · ${formatFrenchDateTime(c.reconciledAt)}`}
          </div>
        )}
      </td>

      {/* 2. Attendu */}
      <td className="py-3.5 px-4">
        <MoneyCell amount={c.expectedCashCDF} />
      </td>

      {/* 3. Reçu */}
      <td className="py-3.5 px-4">
        <MoneyCell amount={isConfirmed ? c.receivedAmount : null} />
      </td>

      {/* 4. Écart */}
      <td className="py-3.5 px-4">
        {isConfirmed ? (
          <MoneyCell amount={c.difference} isDiscrepancy />
        ) : (
          <span className="font-mono text-muted-foreground text-right block">—</span>
        )}
      </td>

      {/* 5. Espèces détenues */}
      <td className="py-3.5 px-4 hidden lg:table-cell">
        <MoneyCell amount={c.heldCashCDF} />
      </td>

      {/* 6. Caution / Fond de caisse */}
      <td className="py-3.5 px-4 text-right font-mono text-xs space-y-0.5 hidden md:table-cell">
        <div title={t("depositTooltip")}>
          <span className="text-muted-foreground font-sans">Caution : </span>
          <span className="font-bold text-heading">{c.securityDeposit.toLocaleString("fr-FR")} CDF</span>
        </div>
        <div title={t("floatTooltip")}>
          <span className="text-muted-foreground font-sans">Fond : </span>
          <span className="font-medium text-heading">{c.changeFloat.toLocaleString("fr-FR")} CDF</span>
        </div>
      </td>

      {/* 7. Statut */}
      <td className="py-3.5 px-4 text-center">
        {!isConfirmed ? (
          <StatusPill status="pending" />
        ) : c.difference === 0 ? (
          <StatusPill status="reconciled" />
        ) : c.difference < 0 ? (
          <StatusPill status="shortage" />
        ) : (
          <StatusPill status="surplus" />
        )}
      </td>

      {/* 8. Actions */}
      <td className="py-3.5 px-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          {hasNoDeliveries && !isConfirmed ? (
            <span className="text-xs text-muted-foreground font-medium px-2.5 py-1.5 bg-surface rounded-md border border-border">
              {t("noOrdersToday")}
            </span>
          ) : !isConfirmed ? (
            <Button
              size="sm"
              variant="default"
              onClick={() => onOpenReconcile(c)}
              className="min-h-[40px] h-10 text-xs font-semibold px-3"
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
      </td>
    </tr>
  );
}
