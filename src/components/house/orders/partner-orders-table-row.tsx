"use client";

import { AlertTriangle, MapPin, Package, Sparkles, User } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";
import {
  formatAmount,
  formatDateTime,
  getOrderStatusConfig,
} from "@/lib/order-formatters";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { PartnerOrderPrimaryAction } from "./partner-order-primary-action";
import { PartnerOrderSecondaryMenu } from "./partner-order-secondary-menu";

interface PartnerOrdersTableRowProps {
  order: PartnerOrderListItemDTO;
  isPending: boolean;
  onAccept: (orderId: string) => void;
  onMarkReceived: (orderId: string) => void;
  onStartWashing: (orderId: string) => void;
  onMarkReady: (orderId: string) => void;
  onHandover: (orderId: string) => void;
  onOpenDetail: (order: PartnerOrderListItemDTO) => void;
  onOpenTicket: (order: PartnerOrderListItemDTO) => void;
  onOpenIssue: (order: PartnerOrderListItemDTO) => void;
  onOpenReject: (order: PartnerOrderListItemDTO) => void;
}

export function PartnerOrdersTableRow({
  order,
  isPending,
  onAccept,
  onMarkReceived,
  onStartWashing,
  onMarkReady,
  onHandover,
  onOpenDetail,
  onOpenTicket,
  onOpenIssue,
  onOpenReject,
}: PartnerOrdersTableRowProps) {
  const t = useTranslations("house.orders");
  const statusCfg = getOrderStatusConfig(order.status);

  return (
    <TableRow
      className={order.isAtRisk ? "bg-amber-500/5 hover:bg-amber-500/10" : ""}
    >
      {/* Commande */}
      <TableCell className="py-3.5 px-4 font-mono">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm text-heading">
              {order.shortReference}
            </span>
            {order.isAtRisk && (
              <span title={t("atRiskBadge")}>
                <AlertTriangle className="size-3.5 text-amber-500" />
              </span>
            )}
          </div>
          <Badge
            variant="outline"
            className={`gap-1.5 px-2 py-0.5 text-[11px] font-bold ${statusCfg.badgeClass}`}
          >
            <span className={`size-1.5 rounded-full ${statusCfg.dotClass}`} />
            <span>{statusCfg.label}</span>
          </Badge>
        </div>
      </TableCell>

      {/* Client (Privacy AC 15: first name + neighborhood only) */}
      <TableCell className="py-3.5 px-4">
        <div className="space-y-0.5">
          <div className="font-bold text-heading flex items-center gap-1">
            <User className="size-3 text-muted-foreground shrink-0" />
            <span>{order.customerDisplayName}</span>
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <MapPin className="size-3 text-muted-foreground shrink-0" />
            <span>{order.neighborhoodName}</span>
          </div>
        </div>
      </TableCell>

      {/* Articles & Services */}
      <TableCell className="py-3.5 px-4 max-w-xs">
        <div className="space-y-0.5">
          <div className="font-medium text-foreground truncate flex items-center gap-1">
            <Package className="size-3 text-primary shrink-0" />
            <span className="truncate">{order.itemsSummary}</span>
          </div>
          <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
            <Sparkles className="size-3 text-muted-foreground shrink-0" />
            <span className="truncate">{order.services.join(", ")}</span>
          </div>
        </div>
      </TableCell>

      {/* Échéance */}
      <TableCell className="py-3.5 px-4">
        <div className="text-[11px] space-y-0.5 text-muted-foreground">
          {order.estimatedDeliveryAt ? (
            <div>
              <span className="block text-foreground font-semibold">
                {formatDateTime(order.estimatedDeliveryAt)}
              </span>
              <span>({t("tagPromised")})</span>
            </div>
          ) : (
            <div>
              <span className="block text-foreground font-medium">
                {formatDateTime(order.pickupSlotStart)}
              </span>
              <span>({t("tagPickup")})</span>
            </div>
          )}
        </div>
      </TableCell>

      {/* Montant & Part */}
      <TableCell className="py-3.5 px-4 text-right">
        <div className="space-y-0.5">
          <div className="text-[11px] text-muted-foreground">
            {formatAmount(order.itemsTotal, order.currency)}
          </div>
          <div className="text-xs font-black text-success font-mono">
            {formatAmount(order.netPartnerShare, order.currency)}
          </div>
        </div>
      </TableCell>

      {/* Action Principale */}
      <TableCell className="py-3.5 px-4 text-center">
        <PartnerOrderPrimaryAction
          order={order}
          isPending={isPending}
          onAccept={onAccept}
          onMarkReceived={onMarkReceived}
          onStartWashing={onStartWashing}
          onMarkReady={onMarkReady}
          onHandover={onHandover}
          compact
        />
      </TableCell>

      {/* Actions Secondaires */}
      <TableCell className="py-3.5 px-3 text-center">
        <PartnerOrderSecondaryMenu
          order={order}
          onOpenDetail={onOpenDetail}
          onOpenTicket={onOpenTicket}
          onOpenIssue={onOpenIssue}
          onOpenReject={onOpenReject}
        />
      </TableCell>
    </TableRow>
  );
}
