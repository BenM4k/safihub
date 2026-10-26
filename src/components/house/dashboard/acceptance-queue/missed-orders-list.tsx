"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { HouseOrderListItemRecord } from "@/dal";

interface MissedOrdersListProps {
  missedOrders: HouseOrderListItemRecord[];
  houseSlug: string;
}

export function MissedOrdersList({
  missedOrders,
  houseSlug,
}: MissedOrdersListProps) {
  const t = useTranslations("house.dashboard");

  if (missedOrders.length === 0) return null;

  return (
    <div className="pt-3 space-y-2">
      <Separator />
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="size-3 text-destructive" />
          <span>{t("missedRecent", { count: missedOrders.length })}</span>
        </h3>
        <span className="text-[11px] text-muted-foreground">
          {t("missedRecentDesc")}
        </span>
      </div>

      <div className="grid gap-2 opacity-85">
        {missedOrders.slice(0, 3).map((order) => (
          <div
            key={order.id}
            className="p-3 rounded-xl bg-card border border-border flex items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-heading">
                  {order.code}
                </span>
                <Badge
                  variant="destructive"
                  className="text-[10px] font-bold px-1.5 py-0"
                >
                  {t("expiredBadge")}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {order.customerFirstName} · {order.neighborhoodName} ·{" "}
                {order.itemsSummary || "Articles"}
              </p>
            </div>
            <Link
              href={`/partner/${houseSlug}/orders/${order.id}`}
              className="text-xs font-semibold text-foreground hover:text-primary"
            >
              {t("view")}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
