import { CheckCircle2, Clock, AlertTriangle, Truck, Sparkles, XCircle } from "lucide-react";
import type { OrderEventRecord } from "@/dal";

interface OrderStatusTimelineProps {
  events: OrderEventRecord[];
  currentStatus: string;
}

export function OrderStatusTimeline({ events }: OrderStatusTimelineProps) {
  const getEventIcon = (type: string, toStatus: string | null) => {
    if (toStatus === "cancelled" || toStatus === "expired" || toStatus === "rejected") {
      return <XCircle className="size-4 text-rose-600" />;
    }
    if (toStatus === "price_adjusted" || toStatus === "disputed") {
      return <AlertTriangle className="size-4 text-amber-600" />;
    }
    if (toStatus === "washing" || toStatus === "ready") {
      return <Sparkles className="size-4 text-primary" />;
    }
    if (toStatus === "delivery_in_progress" || toStatus === "delivered") {
      return <Truck className="size-4 text-emerald-600" />;
    }
    return <CheckCircle2 className="size-4 text-slate-400" />;
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Clock className="size-4 text-primary" />
        <span>Historique & Suivi d&apos;état</span>
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((ev) => (
          <div key={ev.id} className="relative group">
            <span className="absolute -left-6 top-0.5 size-5 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center">
              {getEventIcon(ev.type, ev.toStatus)}
            </span>

            <div className="space-y-0.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <p className="text-xs font-bold text-slate-900">
                  {ev.note || ev.toStatus || ev.type}
                </p>
                <span className="text-[11px] text-slate-400">
                  {new Date(ev.createdAt).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" · "}
                  {new Date(ev.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>

              {ev.approvalMethod && (
                <p className="text-[11px] text-emerald-700 font-medium">
                  Méthode de validation : {ev.approvalMethod}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
