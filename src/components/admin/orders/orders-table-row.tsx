"use client";

import Link from "next/link";
import {
  ArrowRightLeft,
  Edit,
  Eye,
  MessageSquare,
  Phone,
  Smartphone,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderListItemRecord } from "@/dal";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenuItem,
  RowActionsMenu,
} from "@/components/admin/shared/row-actions-menu";
import {
  formatAmount,
  formatCustomerDisplay,
  formatDateTime,
  formatOrderReference,
  formatRelativeTime,
  getOrderStatusConfig,
  getSourceConfig,
} from "@/lib/order-formatters";

interface OrdersTableRowProps {
  order: OrderListItemRecord;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenDetails: (order: OrderListItemRecord) => void;
  onOpenReassign: (order: OrderListItemRecord) => void;
  onOpenCancel: (order: OrderListItemRecord) => void;
  showPaymentColumn?: boolean;
}

export function OrdersTableRow({
  order,
  isSelected,
  onToggleSelect,
  onOpenDetails,
  onOpenReassign,
  onOpenCancel,
  showPaymentColumn = false,
}: OrdersTableRowProps) {
  const t = useTranslations("admin.orders");

  const customer = formatCustomerDisplay(order.customerName, order.customerPhone);
  const statusConfig = getOrderStatusConfig(order.status);
  const sourceConfig = getSourceConfig(order.source);
  const reference = formatOrderReference(order.code, order.id);

  return (
    <TableRow
      onClick={() => onOpenDetails(order)}
      className={`h-12 cursor-pointer transition-colors ${
        isSelected ? "bg-primary/10 hover:bg-primary/15" : ""
      }`}
    >
      {/* Checkbox */}
      <TableCell
        className="w-10 px-3 py-2 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(order.id)}
          aria-label={t("selectOrder", { code: reference })}
          className="rounded-sm size-4 accent-primary cursor-pointer"
        />
      </TableCell>

      {/* Référence */}
      <TableCell className="px-3 py-2 whitespace-nowrap">
        <span className="font-mono font-bold text-xs text-foreground select-all">
          {reference}
        </span>
      </TableCell>

      {/* Client */}
      <TableCell className="px-3 py-2">
        <div className="space-y-0.5">
          {customer.displayName ? (
            <div className="font-semibold text-xs text-foreground truncate max-w-[170px]">
              {customer.displayName}
            </div>
          ) : null}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <span>{customer.formattedPhone}</span>
            {customer.isGuest && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                {t("guestTag")}
              </span>
            )}
          </div>
        </div>
      </TableCell>

      {/* Pressing */}
      <TableCell className="px-3 py-2 hidden md:table-cell text-xs text-muted-foreground font-medium truncate max-w-[160px]">
        {order.houseName || "—"}
      </TableCell>

      {/* Date de création */}
      <TableCell className="px-3 py-2 hidden sm:table-cell whitespace-nowrap">
        <div title={new Date(order.createdAt).toISOString()} className="space-y-0.5">
          <div className="text-xs text-foreground font-medium">
            {formatDateTime(order.createdAt)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {formatRelativeTime(order.createdAt)}
          </div>
        </div>
      </TableCell>

      {/* Canal */}
      <TableCell className="px-3 py-2 hidden lg:table-cell whitespace-nowrap">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-foreground border border-border">
          {sourceConfig.iconName === "whatsapp" ? (
            <MessageSquare className="size-3 text-emerald-600 dark:text-emerald-400" />
          ) : sourceConfig.iconName === "phone" ? (
            <Phone className="size-3 text-muted-foreground" />
          ) : (
            <Smartphone className="size-3 text-primary" />
          )}
          <span>{sourceConfig.label}</span>
        </span>
      </TableCell>

      {/* Paiement */}
      {showPaymentColumn && (
        <TableCell className="px-3 py-2 hidden xl:table-cell whitespace-nowrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border border-border">
            À payer
          </span>
        </TableCell>
      )}

      {/* Montant */}
      <TableCell className="px-3 py-2 text-right whitespace-nowrap">
        <span className="font-mono tabular-nums text-xs font-bold text-foreground">
          {formatAmount(order.totalDue, order.currency)}
        </span>
      </TableCell>

      {/* Statut */}
      <TableCell className="px-3 py-2 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.badgeClass}`}
        >
          <span className={`size-1.5 rounded-full shrink-0 ${statusConfig.dotClass}`} />
          <span>{statusConfig.label}</span>
        </span>
      </TableCell>

      {/* Row Actions Menu */}
      <TableCell
        className="w-10 px-2 py-2 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <RowActionsMenu ariaLabel={t("actionsForOrder", { code: reference })}>
          <DropdownMenuItem onClick={() => onOpenDetails(order)}>
            <Eye className="size-3.5" />
            <span>{t("actionView")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/orders/${order.id}`}>
              <Edit className="size-3.5" />
              <span>{t("actionEdit")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onOpenReassign(order)}>
            <ArrowRightLeft className="size-3.5" />
            <span>{t("actionReassign")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onOpenCancel(order)} variant="destructive">
            <XCircle className="size-3.5" />
            <span>{t("actionCancel")}</span>
          </DropdownMenuItem>
        </RowActionsMenu>
      </TableCell>
    </TableRow>
  );
}
