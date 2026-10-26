"use client";

import { AlertTriangle, Clock, MapPin, Package, Sparkles, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";
import { formatAmount, formatDateTime, getOrderStatusConfig } from "@/lib/order-formatters";
import { PartnerOrderPrimaryAction } from "./partner-order-primary-action";
import { PartnerOrderSecondaryMenu } from "./partner-order-secondary-menu";

interface PartnerOrderCardProps {
  order: PartnerOrderListItemDTO;
  isActionPending: boolean;
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

export function PartnerOrderCard({
  order,
  isActionPending,
  onAccept,
  onMarkReceived,
  onStartWashing,
  onMarkReady,
  onHandover,
  onOpenDetail,
  onOpenTicket,
  onOpenIssue,
  onOpenReject,
}: PartnerOrderCardProps) {
  const t = useTranslations("house.orders");
  const statusCfg = getOrderStatusConfig(order.status);

  return (
    <article
      aria-labelledby={`order-title-${order.id}`}
      className={`p-4 sm:p-5 rounded-2xl bg-card border shadow-xs transition-all space-y-3.5 ${
        order.isAtRisk ? "border-amber-400 dark:border-amber-500/60 bg-amber-500/5" : "border-border hover:border-border-strong"
      }`}
    >
      {/* Top Header: Short Ref, Status Badge & Secondary Menu */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span
            id={`order-title-${order.id}`}
            className="font-mono font-black text-sm sm:text-base text-heading bg-muted/50 px-2.5 py-1 rounded-lg border border-border"
          >
            {order.shortReference}
          </span>

          <Badge variant="outline" className={`gap-1.5 font-bold ${statusCfg.badgeClass}`}>
            <span className={`size-1.5 rounded-full ${statusCfg.dotClass}`} />
            <span>{statusCfg.label}</span>
          </Badge>

          {order.isAtRisk && (
            <Badge variant="outline" className="gap-1 font-bold bg-amber-500/10 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200">
              <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>{t("atRiskBadge")}</span>
            </Badge>
          )}
        </div>

        <PartnerOrderSecondaryMenu
          order={order}
          onOpenDetail={onOpenDetail}
          onOpenTicket={onOpenTicket}
          onOpenIssue={onOpenIssue}
          onOpenReject={onOpenReject}
        />
      </div>

      {/* Items & Services */}
      <div className="space-y-1">
        <div className="flex items-start gap-2 text-xs text-foreground">
          <Package className="size-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <span className="font-semibold text-heading">{order.itemsSummary}</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground pl-5.5">
          <Sparkles className="size-3 text-muted-foreground shrink-0" aria-hidden="true" />
          <span>{order.services.join(" • ")}</span>
        </div>
      </div>

      {/* Customer & Location (AC 15 Customer Privacy Firewall: No Phone) */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-dashed border-border text-muted-foreground">
        <div className="flex items-center gap-1.5 truncate">
          <User className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
          <span className="truncate font-medium text-foreground">{order.customerDisplayName}</span>
        </div>

        <div className="flex items-center gap-1.5 truncate justify-end">
          <MapPin className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
          <span className="truncate font-medium text-foreground">{order.neighborhoodName}</span>
        </div>
      </div>

      {/* Slots / Promised Date */}
      {order.estimatedDeliveryAt && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border">
          <Clock className="size-3 text-muted-foreground shrink-0" aria-hidden="true" />
          <span>{t("promisedDate")} : <strong className="text-heading font-semibold">{formatDateTime(order.estimatedDeliveryAt)}</strong></span>
        </div>
      )}

      {/* Financials & Primary Action */}
      <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="text-[11px] text-muted-foreground flex justify-between gap-2">
            <span>{t("financialTotalClient")} :</span>
            <span className="font-bold text-foreground">
              {formatAmount(order.totalDue, order.currency)}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground flex justify-between gap-2">
            <span>{t("financialTransportFee")} :</span>
            <span className="font-medium">
              {formatAmount(order.deliveryFee, order.currency)}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground flex justify-between gap-2">
            <span>{t("financialCommissionShort")} :</span>
            <span className="text-destructive font-medium">
              -{formatAmount(order.commissionAmount, order.currency)}
            </span>
          </div>
          <div className="text-xs text-primary font-black font-mono flex justify-between gap-2 pt-1 border-t border-border">
            <span>{t("financialPartnerShare")} :</span>
            <span>{formatAmount(order.netPartnerShare, order.currency)}</span>
          </div>
        </div>

        <div className="shrink-0 self-end sm:self-center">
          <PartnerOrderPrimaryAction
            order={order}
            isPending={isActionPending}
            onAccept={onAccept}
            onMarkReceived={onMarkReceived}
            onStartWashing={onStartWashing}
            onMarkReady={onMarkReady}
            onHandover={onHandover}
          />
        </div>
      </div>
    </article>
  );
}
