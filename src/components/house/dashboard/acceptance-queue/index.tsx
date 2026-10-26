"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Inbox,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  acceptPartnerOrderAction,
  rejectPartnerOrderAction,
} from "@/actions/partner-orders.actions";
import { OrderAcceptanceCard } from "./order-acceptance-card";
import { OrderRejectDialog } from "./order-reject-dialog";
import { MissedOrdersList } from "./missed-orders-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { HouseOrderListItemRecord } from "@/dal";

interface AcceptanceQueueProps {
  orders: HouseOrderListItemRecord[];
  missedOrders?: HouseOrderListItemRecord[];
  houseSlug: string;
  waitingAcceptanceCount?: number;
}

/**
 * Priority order acceptance queue with 45-min live timers and quick actions.
 */
export function AcceptanceQueue({
  orders,
  missedOrders = [],
  houseSlug,
  waitingAcceptanceCount,
}: AcceptanceQueueProps) {
  const t = useTranslations("house.dashboard");
  const [handledOrderIds, setHandledOrderIds] = useState<Set<string>>(
    new Set()
  );
  const [rejectingOrder, setRejectingOrder] =
    useState<HouseOrderListItemRecord | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeOrders = orders.filter((o) => !handledOrderIds.has(o.id));
  const totalWaiting = waitingAcceptanceCount ?? activeOrders.length;

  // Sort orders by nearest deadline
  const sortedOrders = [...activeOrders].sort((a, b) => {
    const aTime = a.acceptanceDeadlineAt
      ? new Date(a.acceptanceDeadlineAt).getTime()
      : Infinity;
    const bTime = b.acceptanceDeadlineAt
      ? new Date(b.acceptanceDeadlineAt).getTime()
      : Infinity;
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
      const res = await rejectPartnerOrderAction({
        houseSlug,
        orderId,
        reason,
      });
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
        <Alert variant="success" className="py-2.5">
          <CheckCircle2 className="size-4.5" />
          <AlertDescription className="text-xs font-medium">
            {successNotice}
          </AlertDescription>
        </Alert>
      )}

      {/* Error notice */}
      {errorNotice && (
        <Alert variant="destructive" className="py-2.5">
          <AlertTriangle className="size-4.5" />
          <AlertDescription className="text-xs font-medium">
            {errorNotice}
          </AlertDescription>
        </Alert>
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

      {/* Missed / Expired Section */}
      <MissedOrdersList missedOrders={missedOrders} houseSlug={houseSlug} />

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
