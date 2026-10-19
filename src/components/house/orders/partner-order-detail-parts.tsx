import { Clock } from "lucide-react";
import { formatAmount, formatDateTime } from "@/lib/order-formatters";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";
import type { OrderEventRecord } from "@/dal/order.dal";

interface OrderDetailFinancialsProps {
  order: PartnerOrderListItemDTO;
  title: string;
  totalClientLabel: string;
  commissionLabel: string;
  partnerShareLabel: string;
}

export function OrderDetailFinancials({
  order,
  title,
  totalClientLabel,
  commissionLabel,
  partnerShareLabel,
}: OrderDetailFinancialsProps) {
  return (
    <div className="p-3.5 bg-surface rounded-xl border border-border space-y-2">
      <h3 className="font-bold text-heading uppercase tracking-wider text-[11px]">{title}</h3>
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-muted-foreground">
          <span>{totalClientLabel}</span>
          <span className="font-semibold text-foreground">{formatAmount(order.totalDue, order.currency)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>{commissionLabel}</span>
          <span className="text-destructive font-medium">-{formatAmount(order.commissionAmount, order.currency)}</span>
        </div>
        <div className="flex justify-between pt-1.5 border-t border-border font-bold text-sm">
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
