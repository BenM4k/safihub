"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  computeOrderAcceptanceCountdown,
  computeNetRevenue,
} from "@/lib/partner-dashboard";
import type { HouseOrderListItemRecord } from "@/dal";
import { OrderAcceptanceDetails } from "./order-acceptance-details";

interface OrderAcceptanceCardProps {
  order: HouseOrderListItemRecord;
  houseSlug: string;
  isAccepting: boolean;
  isRejecting: boolean;
  onAccept: (orderId: string) => void;
  onOpenReject: (order: HouseOrderListItemRecord) => void;
}

// Module-level ticker for 1-second countdowns to ensure stable primitive snapshots
let currentTimestamp = 0;
const subscribers = new Set<() => void>();
let timerId: ReturnType<typeof setInterval> | null = null;

function subscribeToTimer(callback: () => void) {
  subscribers.add(callback);
  if (!timerId && typeof window !== "undefined") {
    currentTimestamp = Date.now();
    timerId = setInterval(() => {
      currentTimestamp = Date.now();
      subscribers.forEach((cb) => cb());
    }, 1000);
  }
  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0 && timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  };
}

function getTimerSnapshot() {
  if (currentTimestamp === 0 && typeof window !== "undefined") {
    currentTimestamp = Date.now();
  }
  return currentTimestamp;
}

function getServerTimerSnapshot() {
  return 0;
}

export function OrderAcceptanceCard({
  order,
  houseSlug,
  isAccepting,
  isRejecting,
  onAccept,
  onOpenReject,
}: OrderAcceptanceCardProps) {
  const timestamp = useSyncExternalStore(
    subscribeToTimer,
    getTimerSnapshot,
    getServerTimerSnapshot,
  );
  const now = timestamp > 0 ? new Date(timestamp) : null;

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
    order.commissionAmount ?? 0,
  );

  const countdownBadgeStyle =
    countdown.urgency === "expired"
      ? "bg-destructive-soft text-destructive border-destructive/30 font-bold"
      : countdown.urgency === "critical"
        ? "bg-destructive-soft text-destructive border-destructive/30 animate-pulse font-black"
        : countdown.urgency === "warning"
          ? "bg-warning-soft text-warning border-warning/30 font-bold"
          : "bg-secondary text-foreground border-border font-semibold";

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-card hover:border-primary/40 transition-all space-y-4">
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

          {/* Privacy badge */}
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-soft text-primary border border-primary/20"
            title="Pare-feu de confidentialité client (AC 15) : Téléphone et adresse exacte masqués"
          >
            <Shield className="size-3 text-primary" />
            <span>AC 15 Protégé</span>
          </div>
        </div>

        {/* Live Countdown Badge */}
        {now && (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${countdownBadgeStyle}`}
            aria-live="polite"
          >
            <Clock className="size-3.5 shrink-0" />
            <span>{countdown.label}</span>
          </div>
        )}
      </div>

      {/* Customer and details summary */}
      <OrderAcceptanceDetails order={order} netEarnings={netEarnings} />

      {/* Actions */}
      <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <Link
          href={`/partner/${houseSlug}/orders/${order.id}`}
          className="text-xs font-semibold text-foreground hover:text-primary inline-flex items-center gap-1 py-1"
        >
          <span>Consulter le détail</span>
          <ArrowRight className="size-3" />
        </Link>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {countdown.isExpired ? (
            <div className="w-full sm:w-auto p-2 rounded-xl bg-destructive-soft border border-destructive/30 text-xs font-bold text-destructive text-center">
              Délai dépassé — Commande expirée (non acceptée à temps)
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isAccepting || isRejecting}
                onClick={() => onOpenReject(order)}
                className="flex-1 sm:flex-initial text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive-soft border-destructive/30 min-h-[44px] sm:min-h-[38px]"
              >
                <XCircle className="size-4 mr-1.5" />
                Refuser
              </Button>

              <Button
                type="button"
                disabled={isAccepting || isRejecting}
                onClick={() => onAccept(order.id)}
                className="flex-1 sm:flex-initial text-xs font-bold bg-primary hover:bg-primary-hover text-primary-foreground min-h-[44px] sm:min-h-[38px] shadow-xs"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="size-4 mr-1.5 animate-spin" />
                    Acceptation...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 mr-1.5" />
                    Accepter
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
