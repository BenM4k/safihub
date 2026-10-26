"use client";

import Link from "next/link";
import { ArrowRightLeft, ExternalLink, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { OrderListItemRecord } from "@/dal";

interface OrderDetailsFooterProps {
  order: OrderListItemRecord;
  onOpenReassign: (order: OrderListItemRecord) => void;
  onOpenCancel: (order: OrderListItemRecord) => void;
}

export function OrderDetailsFooter({
  order,
  onOpenReassign,
  onOpenCancel,
}: OrderDetailsFooterProps) {
  const t = useTranslations("admin.orders");

  return (
    <div className="p-4 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between gap-2 shrink-0">
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/orders/${order.id}`}
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
        >
          <span>{t("fullPage")}</span>
          <ExternalLink className="size-3" />
        </Link>

        <Link
          href={`/track/${order.trackingToken}`}
          target="_blank"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <span>{t("clientTracking")}</span>
          <ExternalLink className="size-3" />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenReassign(order)}
          className="h-8 text-xs font-semibold gap-1"
        >
          <ArrowRightLeft className="size-3.5 text-muted-foreground" />
          <span>{t("actionReassign")}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenCancel(order)}
          className="h-8 text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10 gap-1"
        >
          <XCircle className="size-3.5" />
          <span>{t("actionCancel")}</span>
        </Button>
      </div>
    </div>
  );
}
