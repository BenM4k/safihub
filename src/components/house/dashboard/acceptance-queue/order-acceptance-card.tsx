"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle, ArrowRight, Loader2, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatAmount } from "@/lib/order-formatters";
import { computeOrderAcceptanceCountdown, computeNetRevenue } from "@/lib/partner-dashboard";
import { cn } from "@/lib/utils";
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
 * Collapsible order card in acceptance queue with live countdown.
 * Default state: collapsed with only important details (ref, client, items, net, countdown, actions).
 */
export function OrderAcceptanceCard({
  order,
  houseSlug,
  isAccepting,
  isRejecting,
  onAccept,
  onOpenReject,
}: OrderAcceptanceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const tOrders = useTranslations("house.orders");
  const tDashboard = useTranslations("house.dashboard");
  const now = useCountdownTimestamp();

  const countdown = now
    ? computeOrderAcceptanceCountdown(order.acceptanceDeadlineAt, now)
    : { isExpired: false, minutesRemaining: 45, label: "--", urgency: "normal" as const };

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
    <div
      className={cn(
        "p-4 rounded-xl bg-card border transition-all duration-300 font-sans space-y-3.5",
        isExpanded
          ? "border-primary/40 shadow-sm ring-1 ring-primary/10"
          : "border-border/80 shadow-xs hover:border-border"
      )}
    >
      {/* 1. Metadata / Context Row: Ref, Customer, Urgency Timer & Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono font-bold text-xs text-heading bg-slate-100 dark:bg-secondary px-2 py-0.5 rounded-md shrink-0">
            {shortRef}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
            <strong className="text-heading font-semibold">
              {order.customerFirstName}
            </strong>
            {order.neighborhoodName ? ` · ${order.neighborhoodName}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {now && (
            <Badge
              variant={countdownBadgeVariant}
              className={`gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${
                countdown.urgency === "critical" ? "animate-pulse" : ""
              }`}
            >
              <Clock className="size-3 shrink-0" />
              <span>{countdown.label}</span>
            </Badge>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? tOrders("hideDetails") : tOrders("showDetails")}
            className="p-1 rounded-lg text-muted-foreground hover:text-heading hover:bg-slate-100 dark:hover:bg-accent transition-colors cursor-pointer"
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-300",
                isExpanded && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>

      {/* 2. Primary Focal Row: Laundry Summary (left) & Hero Net Share (right) */}
      <div className="flex items-end justify-between gap-3 pt-0.5">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs sm:text-sm font-medium text-heading truncate flex items-center gap-1.5">
            <span className="shrink-0 text-sm">🧺</span>
            <span className="truncate">
              {order.itemsSummary || tDashboard("laundryArticlesLabel")}
            </span>
          </p>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-[11px] font-semibold text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <span>{isExpanded ? tOrders("hideDetails") : tOrders("showDetails")}</span>
          </button>
        </div>

        {/* HERO METRIC: Net Share in Green Success Color */}
        <div className="text-right shrink-0">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
            {tDashboard("netShare")}
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-success tabular-nums tracking-tight block">
            {formatAmount(netEarnings, order.currency)}
          </span>
        </div>
      </div>

      {/* 3. Collapsible detailed view with slower smooth transition */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="pt-3 border-t border-border/60 space-y-2.5">
            <OrderAcceptanceDetails order={order} netEarnings={netEarnings} />
            <Link
              href={`/partner/${houseSlug}/orders/${order.id}`}
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 py-0.5"
            >
              <span>{tOrders("actionViewDetails")}</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Action buttons: 1-click Accept / Reject */}
      <div className="pt-2.5 border-t border-border/60 flex items-center justify-end gap-2">
        {countdown.isExpired ? (
          <div className="w-full p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive text-center">
            {tDashboard("orderExpiredNotice")}
          </div>
        ) : (
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={isAccepting || isRejecting}
              onClick={() => onOpenReject(order)}
              className="flex-1 sm:flex-initial text-xs font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[36px] px-3 rounded-lg cursor-pointer"
            >
              <XCircle className="size-4 mr-1.5" />
              {tOrders("reject")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={isAccepting || isRejecting}
              onClick={() => onAccept(order.id)}
              className="flex-1 sm:flex-initial text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 min-h-[36px] px-3.5 rounded-lg cursor-pointer bg-transparent"
            >
              {isAccepting ? (
                <><Loader2 className="size-4 mr-1.5 animate-spin" />{tDashboard("orderAccepting")}</>
              ) : (
                <><CheckCircle2 className="size-4 mr-1.5" />{tOrders("actionAccept")}</>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
