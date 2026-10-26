"use client";

import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/order-formatters";
import type { OrderListItemRecord } from "@/dal";

import { Separator } from "@/components/ui/separator";

interface OrderDetailsTotalsProps {
  order: OrderListItemRecord;
  itemsCount: number;
}

export function OrderDetailsTotals({ order, itemsCount }: OrderDetailsTotalsProps) {
  const t = useTranslations("admin.orders");

  return (
    <div className="text-xs space-y-2 py-1">
      <div className="flex justify-between text-muted-foreground">
        <span>{t("itemsCount", { count: itemsCount || 0 })}</span>
        <span className="font-mono text-foreground">{formatAmount(order.itemsTotal, order.currency)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>{t("deliveryFee")}</span>
        <span className="font-mono text-foreground">{formatAmount(order.deliveryFee, order.currency)}</span>
      </div>
      <Separator />
      <div className="flex justify-between text-foreground font-bold text-sm pt-0.5">
        <span>{t("colAmount")}</span>
        <span className="font-mono text-primary">
          {formatAmount(order.totalDue, order.currency)}
        </span>
      </div>
    </div>
  );
}
