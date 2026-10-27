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
          {/* Customer & Privacy (Unified, no boxy card) */}
          <div className="space-y-2 pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <span className="font-bold text-heading text-sm flex items-center gap-2">
                <User className="size-4 text-primary" />
                <span>{order.customerDisplayName}</span>
              </span>
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <MapPin className="size-3.5" />
                <span>{order.neighborhoodName}</span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
              <Shield className="size-3.5 text-primary/70 shrink-0" />
              <span>
                {order.status === "created"
                  ? t("privacyNoticeCreated")
                  : t("privacyNoticeAccepted")}
              </span>
            </p>
          </div>

          {/* Financial Breakdown */}
          <OrderDetailFinancials
            order={order}
            title={t("financialTitle")}
            itemsTotalLabel={t("financialItemsTotal")}
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
