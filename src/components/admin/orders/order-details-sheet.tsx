"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderListItemRecord } from "@/dal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  formatDateTime,
  formatOrderReference,
  getOrderStatusConfig,
  getSourceConfig,
} from "@/lib/order-formatters";
import {
  OrderDetailsAsyncBody,
  OrderDetailsBodySkeleton,
  type OrderDetailActionResult,
} from "./order-details-async-body";
import { OrderDetailsFooter } from "./order-details-footer";
import { OrderDetailsParties } from "./order-details-parties";

interface OrderDetailsSheetProps {
  order: OrderListItemRecord | null;
  detailPromise: Promise<OrderDetailActionResult> | null;
  onRefreshDetail: () => void;
  onClose: () => void;
  onOpenReassign: (order: OrderListItemRecord) => void;
  onOpenCancel: (order: OrderListItemRecord) => void;
}

export function OrderDetailsSheet({
  order,
  detailPromise,
  onRefreshDetail,
  onClose,
  onOpenReassign,
  onOpenCancel,
}: OrderDetailsSheetProps) {
  const t = useTranslations("admin.orders");
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  if (!order || !detailPromise) return null;

  const statusConfig = getOrderStatusConfig(order.status);
  const sourceConfig = getSourceConfig(order.source);
  const reference = formatOrderReference(order.code, order.id);

  function copyUuid() {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Sheet open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg h-full p-0 flex flex-col border-l border-border bg-background"
      >
        <SheetHeader className="px-6 py-4 border-b border-border bg-muted/20 shrink-0 space-y-0 text-left">
          <div className="flex items-center gap-2.5">
            <SheetTitle className="font-mono text-lg font-bold text-foreground">
              {reference}
            </SheetTitle>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border animate-badge-pop ${statusConfig.badgeClass}`}
            >
              <span className={`size-1.5 rounded-full ${statusConfig.dotClass}`} />
              <span>{statusConfig.label}</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDateTime(order.createdAt)} · {t("colChannel")} :{" "}
            {sourceConfig.label}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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
              className="min-h-10 px-3 text-xs font-semibold gap-1 shrink-0 press"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-success" />
                  <span className="text-success">{t("copied")}</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-muted-foreground" />
                  <span>{t("copyId")}</span>
                </>
              )}
            </Button>
          </div>

          <OrderDetailsParties order={order} />

          <Suspense fallback={<OrderDetailsBodySkeleton />}>
            <OrderDetailsAsyncBody
              order={order}
              detailPromise={detailPromise}
              onEventAdded={onRefreshDetail}
            />
          </Suspense>
        </div>

        <OrderDetailsFooter
          order={order}
          onOpenReassign={onOpenReassign}
          onOpenCancel={onOpenCancel}
        />
      </SheetContent>
    </Sheet>
  );
}
