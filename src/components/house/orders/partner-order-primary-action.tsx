"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2, Clock, Loader2, Sparkles, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";
import { computeOrderAcceptanceCountdown } from "@/lib/partner-dashboard";

interface PartnerOrderPrimaryActionProps {
  order: PartnerOrderListItemDTO;
  isPending: boolean;
  onAccept: (orderId: string) => void;
  onMarkReceived: (orderId: string) => void;
  onStartWashing: (orderId: string) => void;
  onMarkReady: (orderId: string) => void;
  onHandover: (orderId: string) => void;
  compact?: boolean;
}

export function PartnerOrderPrimaryAction({
  order,
  isPending,
  onAccept,
  onMarkReceived,
  onStartWashing,
  onMarkReady,
  onHandover,
  compact = false,
}: PartnerOrderPrimaryActionProps) {
  const t = useTranslations("house.orders");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (order.status !== "created" || !order.acceptanceDeadlineAt) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [order.status, order.acceptanceDeadlineAt]);

  const btnHeight = compact ? "min-h-[36px] text-xs px-3" : "min-h-[44px] sm:min-h-[38px] text-xs px-4";

  if (order.status === "created") {
    const countdown = computeOrderAcceptanceCountdown(order.acceptanceDeadlineAt, now);

    if (countdown.isExpired) {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive-soft border border-destructive/30 text-destructive text-xs font-bold"
          title={countdown.label}
        >
          <Clock className="size-3.5 shrink-0" aria-hidden="true" />
          <span>{countdown.label}</span>
        </span>
      );
    }

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() => onAccept(order.id)}
        className={`bg-primary hover:bg-primary-hover text-primary-foreground font-bold shadow-xs cursor-pointer ${btnHeight}`}
      >
        {isPending ? (
          <Loader2 className="size-3.5 mr-1.5 animate-spin" />
        ) : (
          <Check className="size-3.5 mr-1.5" />
        )}
        <span>{t("actionAccept")}</span>
      </Button>
    );
  }

  if (order.status === "picked_up") {
    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() => onMarkReceived(order.id)}
        className={`bg-primary hover:bg-primary-hover text-primary-foreground font-bold shadow-xs cursor-pointer ${btnHeight}`}
      >
        {isPending ? (
          <Loader2 className="size-3.5 mr-1.5 animate-spin" />
        ) : (
          <CheckCircle2 className="size-3.5 mr-1.5" />
        )}
        <span>{t("actionMarkReceived")}</span>
      </Button>
    );
  }

  if (order.status === "received") {
    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() => onStartWashing(order.id)}
        className={`bg-primary hover:bg-primary-hover text-primary-foreground font-bold shadow-xs cursor-pointer ${btnHeight}`}
      >
        {isPending ? (
          <Loader2 className="size-3.5 mr-1.5 animate-spin" />
        ) : (
          <Sparkles className="size-3.5 mr-1.5" />
        )}
        <span>{t("actionStartWashing")}</span>
      </Button>
    );
  }

  if (order.status === "washing") {
    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() => onMarkReady(order.id)}
        className={`bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer ${btnHeight}`}
      >
        {isPending ? (
          <Loader2 className="size-3.5 mr-1.5 animate-spin" />
        ) : (
          <Check className="size-3.5 mr-1.5" />
        )}
        <span>{t("actionMarkReady")}</span>
      </Button>
    );
  }

  if (order.status === "ready" || order.status === "delivery_assigned") {
    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() => onHandover(order.id)}
        variant="outline"
        className={`border-primary/40 text-primary hover:bg-primary-soft font-bold cursor-pointer ${btnHeight}`}
      >
        {isPending ? (
          <Loader2 className="size-3.5 mr-1.5 animate-spin" />
        ) : (
          <Truck className="size-3.5 mr-1.5" />
        )}
        <span>{t("actionHandover")}</span>
      </Button>
    );
  }

  return null;
}
