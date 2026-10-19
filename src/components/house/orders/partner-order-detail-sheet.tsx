"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Package, Phone, Shield, User, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";
import type { OrderItemRecord, OrderEventRecord } from "@/dal/order.dal";
import { getPartnerOrderDetailAction } from "@/actions/partner-orders.actions";
import { formatAmount, getOrderStatusConfig } from "@/lib/order-formatters";
import { useAccessibleDialog } from "./use-accessible-dialog";
import { OrderDetailFinancials, OrderDetailTimeline } from "./partner-order-detail-parts";

interface PartnerOrderDetailSheetProps {
  order: PartnerOrderListItemDTO | null;
  houseSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PartnerOrderDetailSheet({
  order,
  houseSlug,
  isOpen,
  onClose,
}: PartnerOrderDetailSheetProps) {
  const t = useTranslations("house.orders");
  const [items, setItems] = useState<OrderItemRecord[]>([]);
  const [events, setEvents] = useState<OrderEventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [prevOrderId, setPrevOrderId] = useState<string | null>(null);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useAccessibleDialog<HTMLDivElement>({
    isOpen,
    onClose,
    initialFocusRef: closeButtonRef,
    trapTab: true,
  });

  if (isOpen && order && order.id !== prevOrderId) {
    setPrevOrderId(order.id);
    setIsLoading(true);
    setErrorMsg(null);
    setItems([]);
    setEvents([]);
  }

  useEffect(() => {
    if (!isOpen || !order) return;
    let isMounted = true;

    getPartnerOrderDetailAction({ houseSlug, orderId: order.id }).then((res) => {
      if (!isMounted) return;
      setIsLoading(false);
      if (res.ok) {
        setItems(res.value.items);
        setEvents(res.value.events);
      } else {
        setErrorMsg(res.error);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, order, houseSlug]);

  if (!isOpen || !order) return null;

  const statusCfg = getOrderStatusConfig(order.status);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-sheet-title"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in"
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="w-full max-w-lg bg-card h-full shadow-2xl border-l border-border flex flex-col font-sans overflow-hidden animate-in slide-in-from-right duration-200 outline-none"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 id="order-sheet-title" className="text-base sm:text-lg font-black text-heading font-mono">
                {order.shortReference}
              </h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusCfg.badgeClass}`}>
                <span className={`size-1.5 rounded-full ${statusCfg.dotClass}`} />
                <span>{statusCfg.label}</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate">{order.code}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
          {/* Customer Privacy Banner */}
          <div className="p-3 bg-surface rounded-xl border border-border flex items-start gap-2.5">
            <Shield className="size-4 text-primary shrink-0 mt-0.5" />
            <div className="text-muted-foreground">
              {order.status === "created" ? (
                <span><strong>AC 15 :</strong> {t("privacyNoticeCreated")}</span>
              ) : (
                <span><strong>{t("actionAccept")} :</strong> {t("privacyNoticeAccepted")}</span>
              )}
            </div>
          </div>

          {/* Customer Card */}
          <div className="p-3.5 bg-surface rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-heading text-sm flex items-center gap-1.5">
                <User className="size-3.5 text-primary" />
                {order.customerDisplayName}
              </span>
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3" />
                {order.neighborhoodName}
              </span>
            </div>
            {order.customerPhone && (
              <div className="flex items-center gap-1.5 text-primary font-mono pt-1 border-t border-border">
                <Phone className="size-3.5" />
                <a href={`tel:${order.customerPhone}`} className="hover:underline font-bold">
                  {order.customerPhone}
                </a>
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <OrderDetailFinancials
            order={order}
            title={t("financialTitle")}
            totalClientLabel={t("financialTotalClient")}
            commissionLabel={t("financialCommission", { percent: order.commissionBps / 100 })}
            partnerShareLabel={t("financialPartnerShare")}
          />

          {/* Items breakdown */}
          <div className="space-y-2">
            <h3 className="font-bold text-heading uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Package className="size-3.5 text-primary" />
              <span>{t("itemsHeader", { count: items.length || order.itemsCount })}</span>
            </h3>

            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin mx-auto mb-1 text-primary" />
                <span>{t("itemsLoading")}</span>
              </div>
            ) : errorMsg ? (
              <div className="p-3 bg-destructive-soft text-destructive rounded-xl text-xs">{errorMsg}</div>
            ) : items.length === 0 ? (
              <div className="p-3 bg-surface rounded-xl text-muted-foreground">{order.itemsSummary}</div>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                {items.map((it) => (
                  <div key={it.id} className="p-3 flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="font-bold text-heading">
                        {it.itemNameFr ?? it.customLabel ?? "Article"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {it.fabricNameFr ?? t("itemsStandardFabric")} • {it.serviceNameFr ?? t("itemsStandardService")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-foreground">
                        {t("itemsQuantity", { count: it.receivedQuantity ?? it.declaredQuantity })}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {formatAmount(it.unitPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <OrderDetailTimeline
            events={events}
            title={t("timelineTitle")}
          />
        </div>
      </div>
    </div>
  );
}
