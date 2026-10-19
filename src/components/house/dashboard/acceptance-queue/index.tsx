"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, CheckCircle2, Clock, Inbox, ArrowRight, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { acceptPartnerOrderAction, rejectPartnerOrderAction } from "@/actions/partner-orders.actions";
import { OrderAcceptanceCard } from "./order-acceptance-card";
import { OrderRejectDialog } from "./order-reject-dialog";
import type { HouseOrderListItemRecord } from "@/dal";

interface AcceptanceQueueProps {
  orders: HouseOrderListItemRecord[];
  missedOrders?: HouseOrderListItemRecord[];
  houseSlug: string;
  waitingAcceptanceCount?: number;
}

export function AcceptanceQueue({
  orders,
  missedOrders = [],
  houseSlug,
  waitingAcceptanceCount,
}: AcceptanceQueueProps) {
  const t = useTranslations("house.dashboard");
  const [handledOrderIds, setHandledOrderIds] = useState<Set<string>>(new Set());
  const [rejectingOrder, setRejectingOrder] = useState<HouseOrderListItemRecord | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeOrders = orders.filter((o) => !handledOrderIds.has(o.id));
  const totalWaiting = waitingAcceptanceCount ?? activeOrders.length;

  // Sort orders by nearest deadline
  const sortedOrders = [...activeOrders].sort((a, b) => {
    const aTime = a.acceptanceDeadlineAt ? new Date(a.acceptanceDeadlineAt).getTime() : Infinity;
    const bTime = b.acceptanceDeadlineAt ? new Date(b.acceptanceDeadlineAt).getTime() : Infinity;
    return aTime - bTime;
  });

  function handleAccept(orderId: string) {
    setAcceptingId(orderId);
    setErrorNotice(null);
    startTransition(async () => {
      const res = await acceptPartnerOrderAction({ houseSlug, orderId });
      setAcceptingId(null);
      if (res.ok) {
        setHandledOrderIds((prev) => new Set(prev).add(orderId));
        setSuccessNotice(t("acceptSuccessNotice"));
        setTimeout(() => setSuccessNotice(null), 5000);
      } else {
        setErrorNotice(res.error);
      }
    });
  }

  function handleConfirmReject(reason: string) {
    if (!rejectingOrder) return;
    const orderId = rejectingOrder.id;
    setErrorNotice(null);

    startTransition(async () => {
      const res = await rejectPartnerOrderAction({ houseSlug, orderId, reason });
      setRejectingOrder(null);
      if (res.ok) {
        setHandledOrderIds((prev) => new Set(prev).add(orderId));
      } else {
        setErrorNotice(res.error);
      }
    });
  }

  return (
    <section id="queue-section" className="space-y-4 font-sans">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold">
            <Inbox className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-heading tracking-tight font-display">
              {t("waitingTitle")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("waitingSubtitle")}
            </p>
          </div>
        </div>

        {totalWaiting > 5 && (
          <Link
            href={`/partner/${houseSlug}/orders?tab=to_accept`}
            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 hover:underline"
          >
            <span>{t("viewAllWithCount", { count: totalWaiting })}</span>
            <ArrowRight className="size-3" />
          </Link>
        )}
      </div>

      {/* Success banner */}
      {successNotice && (
        <div
          role="status"
          className="p-3.5 rounded-2xl bg-success-soft border border-success/30 text-xs text-success font-medium flex items-center gap-2 animate-in fade-in"
        >
          <CheckCircle2 className="size-4.5 text-success shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Error notice */}
      {errorNotice && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-destructive-soft border border-destructive/30 text-xs text-destructive font-medium flex items-center gap-2 animate-in fade-in"
        >
          <AlertTriangle className="size-4.5 text-destructive shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Active waiting queue */}
      {sortedOrders.length === 0 ? (
        <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-2 shadow-xs">
          <div className="size-12 rounded-2xl bg-success-soft text-success flex items-center justify-center mx-auto shadow-xs">
            <Check className="size-6" />
          </div>
          <h3 className="font-bold text-sm text-heading">
            {t("noWaitingOrders")}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {t("noWaitingOrdersDesc")}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedOrders.slice(0, 5).map((order) => (
            <OrderAcceptanceCard
              key={order.id}
              order={order}
              houseSlug={houseSlug}
              isAccepting={acceptingId === order.id}
              isRejecting={isPending && rejectingOrder?.id === order.id}
              onAccept={handleAccept}
              onOpenReject={(ord) => setRejectingOrder(ord)}
            />
          ))}
        </div>
      )}

      {/* Missed / Expired Section for Transparency */}
      {missedOrders.length > 0 && (
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
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
                className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-heading">{order.code}</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-destructive-soft text-destructive">
                      {t("expiredBadge")}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {order.customerFirstName} · {order.neighborhoodName} · {order.itemsSummary || "Articles"}
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
      )}

      {/* Reject confirmation dialog */}
      <OrderRejectDialog
        isOpen={Boolean(rejectingOrder)}
        orderCode={rejectingOrder?.code ?? ""}
        isPending={isPending}
        onClose={() => setRejectingOrder(null)}
        onConfirm={handleConfirmReject}
      />
    </section>
  );
}
