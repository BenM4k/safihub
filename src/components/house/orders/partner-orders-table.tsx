"use client";

import { AlertTriangle, MapPin, Package, Phone, Sparkles, User } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";
import { formatAmount, formatDateTime, getOrderStatusConfig } from "@/lib/order-formatters";
import { PartnerOrderPrimaryAction } from "./partner-order-primary-action";
import { PartnerOrderSecondaryMenu } from "./partner-order-secondary-menu";

interface PartnerOrdersTableProps {
  orders: PartnerOrderListItemDTO[];
  pendingOrderId: string | null;
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

export function PartnerOrdersTable({
  orders,
  pendingOrderId,
  onAccept,
  onMarkReceived,
  onStartWashing,
  onMarkReady,
  onHandover,
  onOpenDetail,
  onOpenTicket,
  onOpenIssue,
  onOpenReject,
}: PartnerOrdersTableProps) {
  const t = useTranslations("house.orders");

  return (
    <div className="hidden md:block rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-surface text-muted-foreground font-semibold border-b border-border sticky top-0 z-10">
            <tr>
              <th scope="col" className="py-3 px-4">{t("thOrder")}</th>
              <th scope="col" className="py-3 px-4">{t("thCustomer")}</th>
              <th scope="col" className="py-3 px-4">{t("thItemsServices")}</th>
              <th scope="col" className="py-3 px-4">{t("thDeadline")}</th>
              <th scope="col" className="py-3 px-4 text-right">{t("thAmountShare")}</th>
              <th scope="col" className="py-3 px-4 text-center">{t("thAction")}</th>
              <th scope="col" className="py-3 px-3 text-center w-12"><span className="sr-only">{t("thActionsSecondary")}</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => {
              const statusCfg = getOrderStatusConfig(order.status);
              return (
                <tr
                  key={order.id}
                  className={`hover:bg-surface/60 transition-colors ${
                    order.isAtRisk ? "bg-amber-50/15" : ""
                  }`}
                >
                  {/* Commande */}
                  <td className="py-3.5 px-4 font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-heading">{order.shortReference}</span>
                        {order.isAtRisk && (
                          <span title={t("atRiskBadge")}>
                            <AlertTriangle className="size-3.5 text-amber-500" />
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.badgeClass}`}
                      >
                        <span className={`size-1.5 rounded-full ${statusCfg.dotClass}`} />
                        <span>{statusCfg.label}</span>
                      </span>
                    </div>
                  </td>

                  {/* Client */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="font-bold text-heading flex items-center gap-1">
                        <User className="size-3 text-muted-foreground shrink-0" />
                        <span>{order.customerDisplayName}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="size-3 text-muted-foreground shrink-0" />
                        <span>{order.neighborhoodName}</span>
                      </div>
                      {order.customerPhone && (
                        <div className="text-[11px] text-primary font-mono flex items-center gap-1">
                          <Phone className="size-3 shrink-0" />
                          <a href={`tel:${order.customerPhone}`} className="hover:underline">
                            {order.customerPhone}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Articles & Services */}
                  <td className="py-3.5 px-4 max-w-xs">
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
                  </td>

                  {/* Échéance */}
                  <td className="py-3.5 px-4">
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
                  </td>

                  {/* Montant & Part */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="space-y-0.5">
                      <div className="text-[11px] text-muted-foreground">
                        {formatAmount(order.totalDue, order.currency)}
                      </div>
                      <div className="text-xs font-black text-primary font-mono">
                        {formatAmount(order.netPartnerShare, order.currency)}
                      </div>
                    </div>
                  </td>

                  {/* Action Principale */}
                  <td className="py-3.5 px-4 text-center">
                    <PartnerOrderPrimaryAction
                      order={order}
                      isPending={pendingOrderId === order.id}
                      onAccept={onAccept}
                      onMarkReceived={onMarkReceived}
                      onStartWashing={onStartWashing}
                      onMarkReady={onMarkReady}
                      onHandover={onHandover}
                      compact
                    />
                  </td>

                  {/* Actions Secondaires */}
                  <td className="py-3.5 px-3 text-center">
                    <PartnerOrderSecondaryMenu
                      order={order}
                      onOpenDetail={onOpenDetail}
                      onOpenTicket={onOpenTicket}
                      onOpenIssue={onOpenIssue}
                      onOpenReject={onOpenReject}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
