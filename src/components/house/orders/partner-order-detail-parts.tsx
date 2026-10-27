import { Clock, Loader2, Package } from "lucide-react";
import { formatAmount, formatDateTime } from "@/lib/order-formatters";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";
import type { OrderEventRecord, OrderItemRecord } from "@/dal/order.dal";

interface OrderDetailFinancialsProps {
  order: PartnerOrderListItemDTO;
  title: string;
  itemsTotalLabel: string;
  commissionLabel: string;
  partnerShareLabel: string;
}

export function OrderDetailFinancials({
  order,
  title,
  itemsTotalLabel,
  commissionLabel,
  partnerShareLabel,
}: OrderDetailFinancialsProps) {
  return (
    <div className="space-y-2.5 pb-4 border-b border-border/60">
      <h3 className="font-bold text-heading uppercase tracking-wider text-[11px]">
        {title}
      </h3>
      <div className="space-y-1.5 pt-0.5 text-xs">
        <div className="flex justify-between text-muted-foreground font-semibold">
          <span>{itemsTotalLabel}</span>
          <span className="font-bold text-foreground">
            {formatAmount(order.itemsTotal, order.currency)}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground text-[11px]">
          <span>{commissionLabel}</span>
          <span className="text-destructive font-medium">
            -{formatAmount(order.commissionAmount, order.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-success-soft/30 border border-success/20 text-success font-bold text-sm mt-2">
          <span className="font-sans font-bold text-xs text-foreground">
            {partnerShareLabel}
          </span>
          <span className="font-black font-mono">
            {formatAmount(order.netPartnerShare, order.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface OrderDetailTimelineProps {
  events: OrderEventRecord[];
  title: string;
}

export function OrderDetailTimeline({
  events,
  title,
}: OrderDetailTimelineProps) {
  if (events.length === 0) return null;

  return (
    <div className="space-y-2.5 pt-1">
      <h3 className="font-bold text-heading uppercase tracking-wider text-[11px] flex items-center gap-1.5">
        <Clock className="size-3.5 text-primary" />
        <span>{title}</span>
      </h3>
      <div className="space-y-3 pl-2 border-l border-border/70 ml-1.5">
        {events.map((ev) => (
          <div key={ev.id} className="pl-3 space-y-0.5 relative">
            <div className="size-1.5 rounded-full bg-primary absolute -left-[17px] top-1.5" />
            <div className="font-semibold text-foreground text-xs">
              {ev.note || ev.type}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {formatDateTime(ev.createdAt)}
            </div>
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
    <div className="space-y-2.5 pb-4 border-b border-border/60">
      <h3 className="font-bold text-heading uppercase tracking-wider text-[11px] flex items-center gap-1.5">
        <Package className="size-3.5 text-primary" />
        <span>{itemsHeader}</span>
      </h3>

      {isLoading ? (
        <div className="py-6 text-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin mx-auto mb-1 text-primary" />
          <span>{loadingLabel}</span>
        </div>
      ) : errorMsg ? (
        <div className="p-3 bg-destructive-soft text-destructive rounded-xl text-xs">
          {errorMsg}
        </div>
      ) : items.length === 0 ? (
        <div className="py-2 text-muted-foreground">
          {fallbackSummary}
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {items.map((it) => (
            <div
              key={it.id}
              className="py-2.5 flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-heading text-xs">
                  {it.itemNameFr ?? it.customLabel ?? "Article"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {it.fabricNameFr ?? standardFabricLabel} •{" "}
                  {it.serviceNameFr ?? standardServiceLabel}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-black text-foreground text-xs">
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
