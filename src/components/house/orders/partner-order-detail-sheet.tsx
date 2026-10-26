"use client";

import { useEffect, useState } from "react";
import { MapPin, Shield, User } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";
import type { OrderItemRecord, OrderEventRecord } from "@/dal/order.dal";
import { getPartnerOrderDetailAction } from "@/actions/partner-orders.actions";
import { getOrderStatusConfig } from "@/lib/order-formatters";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  OrderDetailFinancials,
  OrderDetailTimeline,
  OrderDetailItems,
} from "./partner-order-detail-parts";

interface PartnerOrderDetailSheetProps {
  order: PartnerOrderListItemDTO | null;
  houseSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Slide-over drawer presenting detailed order breakdown using shadcn Sheet primitives.
 */
export function PartnerOrderDetailSheet({
  order,
  houseSlug,
  isOpen,
  onClose,
}: PartnerOrderDetailSheetProps) {
  const t = useTranslations("house.orders");
  const [items, setItems] = useState<OrderItemRecord[]>([]);
  const [events, setEvents] = useState<OrderEventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [prevOrderId, setPrevOrderId] = useState<string | null>(null);

  if (isOpen && order && order.id !== prevOrderId) {
    setPrevOrderId(order.id);
    setIsLoading(true);
    setErrorMsg(null);
    setItems([]);
    setEvents([]);
  }

  useEffect(() => {
    if (!isOpen || !order) return;
    let isMounted = true;

    getPartnerOrderDetailAction({ houseSlug, orderId: order.id }).then(
      (res) => {
        if (!isMounted) return;
        setIsLoading(false);
        if (res.ok) {
          setItems(res.value.items);
          setEvents(res.value.events);
        } else {
          setErrorMsg(res.error);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [isOpen, order, houseSlug]);

  if (!order) return null;

  const statusCfg = getOrderStatusConfig(order.status);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col font-sans bg-card border-l border-border"
      >
        <SheetHeader className="p-4 sm:p-5 border-b border-border space-y-1">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-base sm:text-lg font-black text-heading font-mono">
              {order.shortReference}
            </SheetTitle>
            <Badge
              variant="outline"
              className={`gap-1 px-2.5 py-0.5 text-xs font-bold ${statusCfg.badgeClass}`}
            >
              <span className={`size-1.5 rounded-full ${statusCfg.dotClass}`} />
              <span>{statusCfg.label}</span>
            </Badge>
          </div>
          <SheetDescription className="text-xs text-muted-foreground font-mono truncate">
            {order.code}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
          {/* Customer Privacy Banner */}
          <div className="p-3 bg-surface rounded-xl border border-border flex items-start gap-2.5">
            <Shield className="size-4 text-primary shrink-0 mt-0.5" />
            <div className="text-muted-foreground">
              {order.status === "created" ? (
                <span>
                  <strong>AC 15 :</strong> {t("privacyNoticeCreated")}
                </span>
              ) : (
                <span>
                  <strong>{t("actionAccept")} :</strong>{" "}
                  {t("privacyNoticeAccepted")}
                </span>
              )}
            </div>
          </div>

          {/* Customer Card (AC 15 Privacy: First name + neighborhood only) */}
          <div className="p-3.5 bg-surface rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-heading text-sm flex items-center gap-1.5">
                <User className="size-3.5 text-primary" />
                {order.customerDisplayName}
              </span>
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3" />
                {order.neighborhoodName}
              </span>
            </div>
          </div>

          {/* Financial Breakdown */}
          <OrderDetailFinancials
            order={order}
            title={t("financialTitle")}
            totalClientLabel={t("financialTotalClient")}
            itemsTotalLabel={t("financialItemsTotal")}
            transportLabel={t("financialTransportFee")}
            commissionLabel={t("financialCommission", {
              percent: order.commissionBps / 100,
            })}
            partnerShareLabel={t("financialPartnerShare")}
          />

          {/* Items breakdown */}
          <OrderDetailItems
            items={items}
            fallbackSummary={order.itemsSummary}
            isLoading={isLoading}
            errorMsg={errorMsg}
            itemsHeader={t("itemsHeader", {
              count: items.length || order.itemsCount,
            })}
            loadingLabel={t("itemsLoading")}
            standardFabricLabel={t("itemsStandardFabric")}
            standardServiceLabel={t("itemsStandardService")}
            quantityLabel={(count) => t("itemsQuantity", { count })}
          />

          {/* Timeline */}
          <OrderDetailTimeline
            events={events}
            title={t("timelineTitle")}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
