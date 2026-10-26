"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  OrderEventRecord,
  OrderItemRecord,
  OrderListItemRecord,
} from "@/dal";
import { getAdminOrderDetailAction } from "@/actions/admin-order.actions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  formatDateTime,
  formatOrderReference,
  getOrderStatusConfig,
  getSourceConfig,
} from "@/lib/order-formatters";
import { OrderDetailsTimeline } from "./order-details-timeline";
import { OrderDetailsTotals } from "./order-details-totals";
import { OrderDetailsFooter } from "./order-details-footer";
import { OrderDetailsParties } from "./order-details-parties";

interface OrderDetailsSheetProps {
  order: OrderListItemRecord | null;
  onClose: () => void;
  onOpenReassign: (order: OrderListItemRecord) => void;
  onOpenCancel: (order: OrderListItemRecord) => void;
}

export function OrderDetailsSheet({
  order,
  onClose,
  onOpenReassign,
  onOpenCancel,
}: OrderDetailsSheetProps) {
  const t = useTranslations("admin.orders");
  const [copied, setCopied] = useState(false);
  const [events, setEvents] = useState<OrderEventRecord[]>([]);
  const [items, setItems] = useState<OrderItemRecord[]>([]);
  const [loadedOrderId, setLoadedOrderId] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const orderId = order?.id;
  const isLoadingDetail = Boolean(orderId && loadedOrderId !== orderId);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    getAdminOrderDetailAction(orderId)
      .then((res) => {
        if (!cancelled) {
          if (res.ok && res.value) {
            setEvents(res.value.events);
            setItems(res.value.items);
            setError(null);
          } else {
            setEvents([]);
            setItems([]);
            setError(res.ok ? t("noItemsFound") : res.error);
          }
          setLoadedOrderId(orderId);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setEvents([]);
          setItems([]);
          setError(err instanceof Error ? err.message : t("screeningError"));
          setLoadedOrderId(orderId);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, refreshCount, t]);

  if (!order) return null;

  const statusConfig = getOrderStatusConfig(order.status);
  const sourceConfig = getSourceConfig(order.source);
  const reference = formatOrderReference(order.code, order.id);

  function copyUuid() {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Sheet open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg h-full p-0 flex flex-col border-l border-border bg-background"
      >
        {/* Header with prominent code and compact badge */}
        <SheetHeader className="px-6 py-4 border-b border-border bg-muted/20 shrink-0 space-y-0 text-left">
          <div className="flex items-center gap-2.5">
            <SheetTitle className="font-mono text-lg font-bold text-foreground">
              {reference}
            </SheetTitle>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.badgeClass}`}
            >
              <span
                className={`size-1.5 rounded-full ${statusConfig.dotClass}`}
              />
              <span>{statusConfig.label}</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDateTime(order.createdAt)} · {t("colChannel")} :{" "}
            {sourceConfig.label}
          </p>
        </SheetHeader>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* UUID with copy */}
          <div className="flex items-center justify-between">
            <div className="min-w-0 mr-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t("systemUuid")}
              </p>
              <p className="font-mono text-xs text-foreground truncate select-all">
                {order.id}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyUuid}
              className="h-8 px-2.5 text-xs font-semibold gap-1 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {t("copied")}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-muted-foreground" />
                  <span>{t("copyId")}</span>
                </>
              )}
            </Button>
          </div>

          {/* Customer & House */}
          <OrderDetailsParties order={order} />

          {/* Pricing summary */}
          <OrderDetailsTotals order={order} itemsCount={items.length} />

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* Audit Timeline */}
          <OrderDetailsTimeline
            orderId={order.id}
            events={events}
            isLoading={isLoadingDetail}
            onEventAdded={() => setRefreshCount((c) => c + 1)}
          />
        </div>

        {/* Footer actions */}
        <OrderDetailsFooter
          order={order}
          onOpenReassign={onOpenReassign}
          onOpenCancel={onOpenCancel}
        />
      </SheetContent>
    </Sheet>
  );
}
