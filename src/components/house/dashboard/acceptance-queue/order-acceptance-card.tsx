"use client";

import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  computeOrderAcceptanceCountdown,
  computeNetRevenue,
} from "@/lib/partner-dashboard";
import type { HouseOrderListItemRecord } from "@/dal";
import { OrderAcceptanceDetails } from "./order-acceptance-details";
import { useCountdownTimestamp } from "../use-countdown-timer";

interface OrderAcceptanceCardProps {
  order: HouseOrderListItemRecord;
  houseSlug: string;
  isAccepting: boolean;
  isRejecting: boolean;
  onAccept: (orderId: string) => void;
  onOpenReject: (order: HouseOrderListItemRecord) => void;
}

/**
 * Order card in acceptance queue with live 45-min timer and one-click actions.
 */
export function OrderAcceptanceCard({
  order,
  houseSlug,
  isAccepting,
  isRejecting,
  onAccept,
  onOpenReject,
}: OrderAcceptanceCardProps) {
  const tOrders = useTranslations("house.orders");
  const tDashboard = useTranslations("house.dashboard");
  const now = useCountdownTimestamp();

  const countdown = now
    ? computeOrderAcceptanceCountdown(order.acceptanceDeadlineAt, now)
    : {
        isExpired: false,
        minutesRemaining: 45,
        label: "--",
        urgency: "normal" as const,
      };

  const shortRef = order.code.startsWith("ORD-")
    ? `#${order.code.slice(4, 8).toUpperCase()}`
    : `#${order.code}`;
  const netEarnings = computeNetRevenue(
    order.adjustedItemsTotal ?? order.itemsTotal,
    order.commissionAmount ?? 0
  );

  const countdownBadgeVariant =
    countdown.urgency === "expired" || countdown.urgency === "critical"
      ? "destructive"
      : countdown.urgency === "warning"
      ? "warning"
      : "secondary";

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 transition-all space-y-4">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono font-black text-sm sm:text-base text-heading bg-secondary px-2.5 py-0.5 rounded-lg">
            {shortRef}
          </span>
          <span
            className="text-xs text-muted-foreground font-mono hidden sm:inline"
            title={order.id}
          >
            ({order.code})
          </span>

          <Badge
            variant="info"
            className="gap-1 px-2 py-0.5 text-[10px] font-semibold"
            title={tOrders("privacyNotice")}
          >
            <Shield className="size-3 text-primary" />
            <span>{tOrders("privacyBadge")}</span>
          </Badge>
        </div>

        {/* Live Countdown Badge */}
        {now && (
          <Badge
            variant={countdownBadgeVariant}
            className={`gap-1.5 px-3 py-1 text-xs font-bold ${
              countdown.urgency === "critical" ? "animate-pulse" : ""
            }`}
            aria-live="polite"
          >
            <Clock className="size-3.5 shrink-0" />
            <span>{countdown.label}</span>
          </Badge>
        )}
      </div>

      <OrderAcceptanceDetails order={order} netEarnings={netEarnings} />

      {/* Actions */}
      <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <Link
          href={`/partner/${houseSlug}/orders/${order.id}`}
          className="text-xs font-semibold text-foreground hover:text-primary inline-flex items-center gap-1 py-1"
        >
          <span>{tOrders("actionViewDetails")}</span>
          <ArrowRight className="size-3" />
        </Link>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {countdown.isExpired ? (
            <div className="w-full sm:w-auto p-2 rounded-xl bg-destructive-soft border border-destructive/30 text-xs font-bold text-destructive text-center">
              {tDashboard("orderExpiredNotice")}
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                disabled={isAccepting || isRejecting}
                onClick={() => onOpenReject(order)}
                className="flex-1 sm:flex-initial text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[40px] sm:min-h-[36px] cursor-pointer"
              >
                <XCircle className="size-4 mr-1.5" />
                {tOrders("reject")}
              </Button>

              <Button
                type="button"
                variant="ghost"
                disabled={isAccepting || isRejecting}
                onClick={() => onAccept(order.id)}
                className="flex-1 sm:flex-initial text-xs font-bold text-primary hover:text-primary hover:bg-primary/10 min-h-[40px] sm:min-h-[36px] cursor-pointer"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="size-4 mr-1.5 animate-spin" />
                    {tDashboard("orderAccepting")}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 mr-1.5" />
                    {tOrders("actionAccept")}
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
