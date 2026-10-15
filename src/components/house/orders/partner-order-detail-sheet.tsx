"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2, MapPin, Package, Phone, Shield, User, X } from "lucide-react";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";
import type { OrderItemRecord, OrderEventRecord } from "@/dal/order.dal";
import { getPartnerOrderDetailAction } from "@/actions/partner-orders.actions";
import { formatAmount, formatDateTime, getOrderStatusConfig } from "@/lib/order-formatters";

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
  const [items, setItems] = useState<OrderItemRecord[]>([]);
  const [events, setEvents] = useState<OrderEventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [prevOrderId, setPrevOrderId] = useState<string | null>(null);

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
      <div className="w-full max-w-lg bg-card h-full shadow-2xl border-l border-border flex flex-col font-sans overflow-hidden animate-in slide-in-from-right duration-200">
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
            type="button"
            onClick={onClose}
            aria-label="Fermer"
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
                <span><strong>Protection AC 15 :</strong> Coordonnées complètes masquées avant acceptation.</span>
              ) : (
                <span><strong>Acceptée :</strong> Coordonnées client débloquées pour coordination pressing.</span>
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
          <div className="p-3.5 bg-surface rounded-xl border border-border space-y-2">
            <h3 className="font-bold text-heading uppercase tracking-wider text-[11px]">Règlement & Rémunération</h3>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Total facturé au client :</span>
                <span className="font-semibold text-foreground">{formatAmount(order.totalDue, order.currency)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Commission SafiHub ({order.commissionBps / 100}%) :</span>
                <span className="text-destructive font-medium">-{formatAmount(order.commissionAmount, order.currency)}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-border font-bold text-sm">
                <span className="text-primary">Votre part atelier :</span>
                <span className="text-primary font-black font-mono">{formatAmount(order.netPartnerShare, order.currency)}</span>
              </div>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-2">
            <h3 className="font-bold text-heading uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Package className="size-3.5 text-primary" />
              <span>Articles ({items.length || order.itemsCount})</span>
            </h3>

            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin mx-auto mb-1 text-primary" />
                <span>Chargement des articles...</span>
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
                        {it.fabricNameFr ?? "Standard"} • {it.serviceNameFr ?? "Lavage"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-foreground">
                        Qté: {it.receivedQuantity ?? it.declaredQuantity}
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
          {events.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <h3 className="font-bold text-heading uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                <span>Historique des étapes</span>
              </h3>
              <div className="space-y-2 pl-2 border-l-2 border-border ml-1">
                {events.map((ev) => (
                  <div key={ev.id} className="pl-3 space-y-0.5">
                    <div className="font-semibold text-foreground">{ev.note || ev.type}</div>
                    <div className="text-[10px] text-muted-foreground">{formatDateTime(ev.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
