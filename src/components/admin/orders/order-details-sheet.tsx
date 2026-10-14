"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeft,
  Check,
  Copy,
  ExternalLink,
  MapPin,
  Phone,
  X,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderEventRecord, OrderItemRecord, OrderListItemRecord } from "@/dal";
import { getAdminOrderDetailAction } from "@/actions/admin-order.actions";
import { Button } from "@/components/ui/button";
import {
  formatAmount,
  formatCustomerDisplay,
  formatDateTime,
  formatOrderReference,
  getOrderStatusConfig,
  getSourceConfig,
} from "@/lib/order-formatters";
import { OrderDetailsTimeline } from "./order-details-timeline";

interface OrderDetailsSheetProps {
  order: OrderListItemRecord | null;
  onClose: () => void;
  onOpenReassign: (order: OrderListItemRecord) => void;
  onOpenCancel: (order: OrderListItemRecord) => void;
}

export function OrderDetailsSheet({
  order,
  onClose,
  onOpenReassign,
  onOpenCancel,
}: OrderDetailsSheetProps) {
  const t = useTranslations("admin.orders");
  const [copied, setCopied] = useState(false);
  const [events, setEvents] = useState<OrderEventRecord[]>([]);
  const [items, setItems] = useState<OrderItemRecord[]>([]);
  const [loadedOrderId, setLoadedOrderId] = useState<string | null>(null);

  const orderId = order?.id;
  const isLoadingDetail = Boolean(orderId && loadedOrderId !== orderId);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    getAdminOrderDetailAction(orderId)
      .then((res) => {
        if (!cancelled && res.ok && res.value) {
          setEvents(res.value.events);
          setItems(res.value.items);
          setLoadedOrderId(orderId);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadedOrderId(orderId);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (!order) return null;

  const statusConfig = getOrderStatusConfig(order.status);
  const sourceConfig = getSourceConfig(order.source);
  const customer = formatCustomerDisplay(order.customerName, order.customerPhone);
  const reference = formatOrderReference(order.code, order.id);

  function copyUuid() {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-details-title"
      className="fixed inset-0 z-50 flex justify-end bg-ink-950/40 backdrop-blur-xs animate-in fade-in font-sans"
    >
      <div className="w-full max-w-lg bg-card h-full shadow-2xl flex flex-col border-l-2 border-border-strong overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border-strong flex items-center justify-between bg-surface">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 id="order-details-title" className="font-mono text-base font-bold text-heading">
                {reference}
              </h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs ${statusConfig.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
                <span>{statusConfig.label}</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Créée le {formatDateTime(order.createdAt)} · Canal : {sourceConfig.label}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-400 hover:text-heading hover:bg-muted transition-colors cursor-pointer"
            aria-label="Fermer le volet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* UUID with copy */}
          <div className="p-3 bg-surface rounded-xl border border-border-strong shadow-xs flex items-center justify-between">
            <div className="min-w-0 mr-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Identifiant système (UUID)
              </p>
              <p className="font-mono text-xs text-heading truncate select-all">{order.id}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyUuid}
              className="h-8 px-2.5 text-xs font-semibold gap-1 border-border-strong shadow-xs shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success-base" />
                  <span className="text-success-base">{t("copied")}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{t("copyId")}</span>
                </>
              )}
            </Button>
          </div>

          {/* Customer & Pressing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-border-strong bg-card shadow-xs space-y-1.5">
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                {t("colCustomer")}
              </p>
              <p className="font-semibold text-heading text-sm">
                {customer.displayName || "Client"}
                {customer.isGuest && (
                  <span className="ml-1.5 text-[10px] font-normal px-1.5 py-0.2 rounded bg-surface border border-border-strong text-ink-600">
                    {t("guestTag")}
                  </span>
                )}
              </p>
              <a
                href={`tel:${order.customerPhone}`}
                className="inline-flex items-center gap-1.5 font-mono text-primary hover:underline font-semibold"
              >
                <Phone className="w-3 h-3" />
                <span>{customer.formattedPhone}</span>
              </a>
              {order.neighborhoodName && (
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-ink-400" />
                  <span>{order.neighborhoodName}</span>
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl border border-border-strong bg-card shadow-xs space-y-1.5">
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                {t("colPressing")}
              </p>
              <p className="font-semibold text-heading text-sm">{order.houseName || "—"}</p>
              {order.housePhone && (
                <a
                  href={`tel:${order.housePhone}`}
                  className="inline-flex items-center gap-1.5 font-mono text-muted-foreground hover:text-heading"
                >
                  <Phone className="w-3 h-3" />
                  <span>{order.housePhone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Pricing summary */}
          <div className="p-3.5 rounded-xl border border-border-strong bg-surface shadow-xs text-xs space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Articles ({items.length || "—"})</span>
              <span className="font-mono">{formatAmount(order.itemsTotal, order.currency)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Frais de livraison</span>
              <span className="font-mono">{formatAmount(order.deliveryFee, order.currency)}</span>
            </div>
            <div className="flex justify-between text-heading font-bold text-sm pt-1 border-t border-border-strong">
              <span>{t("colAmount")}</span>
              <span className="font-mono text-primary">
                {formatAmount(order.totalDue, order.currency)}
              </span>
            </div>
          </div>

          {/* Audit Timeline Subcomponent */}
          <OrderDetailsTimeline
            orderId={order.id}
            events={events}
            isLoading={isLoadingDetail}
            onEventAdded={() => loadDetails(order.id)}
          />
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t-2 border-border-strong bg-surface flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/orders/${order.id}`}
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Page complète</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <Link
              href={`/track/${order.trackingToken}`}
              target="_blank"
              className="text-xs text-muted-foreground hover:text-heading inline-flex items-center gap-1"
            >
              <span>Suivi client</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenReassign(order)}
              className="h-8 text-xs font-semibold border-border-strong shadow-xs hover:shadow-sm gap-1 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-ink-500" />
              <span>{t("actionReassign")}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenCancel(order)}
              className="h-8 text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive-soft shadow-xs hover:shadow-sm gap-1 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{t("actionCancel")}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
