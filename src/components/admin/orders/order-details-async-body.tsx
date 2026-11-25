"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import type {
  OrderDetailRecord,
  OrderEventRecord,
  OrderItemRecord,
  OrderListItemRecord,
} from "@/dal";
import type { Result } from "@/lib/result";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OrderDetailsTotals } from "./order-details-totals";
import { OrderDetailsTimeline } from "./order-details-timeline";

export type OrderDetailActionResult = Result<{
  order: OrderDetailRecord;
  items: OrderItemRecord[];
  events: OrderEventRecord[];
}>;

interface OrderDetailsAsyncBodyProps {
  order: OrderListItemRecord;
  detailPromise: Promise<OrderDetailActionResult>;
  onEventAdded: () => void;
}

export function OrderDetailsAsyncBody({
  order,
  detailPromise,
  onEventAdded,
}: OrderDetailsAsyncBodyProps) {
  const t = useTranslations("admin.orders");
  const res = use(detailPromise);

  if (!res.ok) {
    return (
      <div className="space-y-4 animate-enter-fast">
        <OrderDetailsTotals order={order} itemsCount={0} />
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{res.error}</AlertDescription>
        </Alert>
        <OrderDetailsTimeline
          orderId={order.id}
          events={[]}
          isLoading={false}
          onEventAdded={onEventAdded}
        />
      </div>
    );
  }

  const items = res.value?.items ?? [];
  const events = res.value?.events ?? [];

  return (
    <div className="space-y-4 animate-enter-fast">
      <OrderDetailsTotals order={order} itemsCount={items.length} />

      {!res.value && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">
            {t("noItemsFound")}
          </AlertDescription>
        </Alert>
      )}

      <OrderDetailsTimeline
        orderId={order.id}
        events={events}
        isLoading={false}
        onEventAdded={onEventAdded}
      />
    </div>
  );
}

export function OrderDetailsBodySkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="h-24 rounded-xl border border-border animate-shimmer" />
      <div className="space-y-2.5">
        <div className="h-3.5 w-36 rounded animate-shimmer" />
        <div className="h-16 rounded-lg animate-shimmer" />
        <div className="h-16 rounded-lg animate-shimmer" />
      </div>
    </div>
  );
}
