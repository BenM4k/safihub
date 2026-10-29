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
        <SheetHeader className="p-5 sm:p-6 border-b border-border space-y-1">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-lg sm:text-xl font-bold text-heading font-mono">
              {order.shortReference}
            </SheetTitle>
            <Badge
              variant="outline"
              className={`gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusCfg.badgeClass}`}
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs leading-relaxed">
          {/* Customer & Privacy (Unified, no boxy card) */}
          <div className="space-y-3 pb-5 border-b border-border/60">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-heading text-sm sm:text-base flex items-center gap-2">
                <User className="size-4 text-primary" />
                <span>{order.customerDisplayName}</span>
              </span>
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1 text-xs">
                <MapPin className="size-3.5 text-muted-foreground" />
                <span>{order.neighborhoodName}</span>
              </span>
            </div>
            <div className="p-3 rounded-lg bg-surface text-slate-600 dark:text-slate-300 flex items-start gap-2.5 text-xs leading-relaxed">
              <Shield className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                {order.status === "created"
                  ? t("privacyNoticeCreated")
                  : t("privacyNoticeAccepted")}
              </span>
            </div>
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
