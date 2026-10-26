import { Clock, Loader2, Package } from "lucide-react";
import { formatAmount, formatDateTime } from "@/lib/order-formatters";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";
import type { OrderEventRecord, OrderItemRecord } from "@/dal/order.dal";

interface OrderDetailFinancialsProps {
  order: PartnerOrderListItemDTO;
  title: string;
  totalClientLabel: string;
  itemsTotalLabel: string;
  transportLabel: string;
  commissionLabel: string;
  partnerShareLabel: string;
}

export function OrderDetailFinancials({
  order,
  title,
  totalClientLabel,
  itemsTotalLabel,
  transportLabel,
  commissionLabel,
  partnerShareLabel,
}: OrderDetailFinancialsProps) {
  return (
    <div className="p-3.5 bg-surface rounded-xl border border-border space-y-2.5">
      <h3 className="font-bold text-heading uppercase tracking-wider text-[11px]">{title}</h3>
      <div className="space-y-1.5 pt-1 text-xs">
        <div className="flex justify-between text-muted-foreground font-semibold">
          <span>{totalClientLabel}</span>
          <span className="font-bold text-foreground">{formatAmount(order.totalDue, order.currency)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground pl-2 text-[11px]">
          <span>• {itemsTotalLabel}</span>
          <span className="font-medium text-foreground">{formatAmount(order.itemsTotal, order.currency)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground pl-2 text-[11px]">
          <span>• {transportLabel}</span>
          <span className="font-medium text-foreground">{formatAmount(order.deliveryFee, order.currency)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground pl-2 text-[11px]">
          <span>• {commissionLabel}</span>
          <span className="text-destructive font-medium">-{formatAmount(order.commissionAmount, order.currency)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-border font-bold text-sm">
          <span className="text-primary">{partnerShareLabel}</span>
          <span className="text-primary font-black font-mono">{formatAmount(order.netPartnerShare, order.currency)}</span>
        </div>
      </div>
    </div>
  );
}

interface OrderDetailTimelineProps {
  events: OrderEventRecord[];
  title: string;
}

export function OrderDetailTimeline({ events, title }: OrderDetailTimelineProps) {
  if (events.length === 0) return null;

  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <h3 className="font-bold text-heading uppercase tracking-wider text-[11px] flex items-center gap-1.5">
        <Clock className="size-3.5 text-primary" />
        <span>{title}</span>
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
  );
}

interface OrderDetailItemsProps {
  items: OrderItemRecord[];
  fallbackSummary: string;
  isLoading: boolean;
  errorMsg: string | null;
  itemsHeader: string;
  loadingLabel: string;
  standardFabricLabel: string;
  standardServiceLabel: string;
  quantityLabel: (count: number) => string;
}

export function OrderDetailItems({
  items,
  fallbackSummary,
  isLoading,
  errorMsg,
  itemsHeader,
  loadingLabel,
  standardFabricLabel,
  standardServiceLabel,
  quantityLabel,
}: OrderDetailItemsProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-bold text-heading uppercase tracking-wider text-[11px] flex items-center gap-1.5">
        <Package className="size-3.5 text-primary" />
        <span>{itemsHeader}</span>
      </h3>

      {isLoading ? (
        <div className="p-6 text-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin mx-auto mb-1 text-primary" />
          <span>{loadingLabel}</span>
        </div>
      ) : errorMsg ? (
        <div className="p-3 bg-destructive-soft text-destructive rounded-xl text-xs">
          {errorMsg}
        </div>
      ) : items.length === 0 ? (
        <div className="p-3 bg-surface rounded-xl text-muted-foreground">
          {fallbackSummary}
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
          {items.map((it) => (
            <div
              key={it.id}
              className="p-3 flex items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-heading">
                  {it.itemNameFr ?? it.customLabel ?? "Article"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {it.fabricNameFr ?? standardFabricLabel} •{" "}
                  {it.serviceNameFr ?? standardServiceLabel}
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-foreground">
                  {quantityLabel(it.receivedQuantity ?? it.declaredQuantity)}
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
  );
}

