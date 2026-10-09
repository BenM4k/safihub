import Link from "next/link";
import { ArrowRight, Calendar, Store, Clock } from "lucide-react";
import type { OrderListItemRecord } from "@/dal";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  created: { label: "En attente d'acceptation", variant: "outline", className: "bg-amber-50 text-amber-700 border-amber-200" },
  accepted: { label: "Acceptée par le pressing", variant: "default" },
  pickup_assigned: { label: "Coursier assigné (collecte)", variant: "secondary" },
  pickup_in_progress: { label: "Coursier en route", variant: "secondary" },
  picked_up: { label: "Linge collecté", variant: "secondary" },
  received: { label: "Linge reçu à l'atelier", variant: "secondary" },
  price_adjusted: { label: "Ajustement de prix requis", variant: "outline", className: "bg-orange-50 text-orange-700 border-orange-200" },
  washing: { label: "En cours de lavage / repassage", variant: "default" },
  ready: { label: "Prêt pour livraison", variant: "outline", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  delivery_slot_confirmed: { label: "Créneau confirmé", variant: "default" },
  delivery_assigned: { label: "Coursier assigné (livraison)", variant: "secondary" },
  delivery_in_progress: { label: "En cours de livraison", variant: "default" },
  delivered: { label: "Livrée", variant: "outline", className: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold" },
  expired: { label: "Expirée", variant: "destructive" },
  cancelled: { label: "Annulée", variant: "outline" },
  disputed: { label: "En litige", variant: "destructive" },
};

export function OrderListCard({ order }: { order: OrderListItemRecord }) {
  const statusCfg = STATUS_CONFIG[order.status] || {
    label: order.status,
    variant: "outline" as const,
  };

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block p-5 bg-white rounded-2xl border border-slate-200 hover:border-primary/50 hover:shadow-xs transition group"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-slate-900 group-hover:text-primary transition">
            {order.code}
          </span>
          <Badge variant={statusCfg.variant} className={statusCfg.className}>
            {statusCfg.label}
          </Badge>
        </div>

        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Calendar className="size-3 text-slate-400" />
          <span>
            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="space-y-1">
          <p className="text-slate-700 font-bold flex items-center gap-1.5">
            <Store className="size-3.5 text-slate-400" />
            <span>{order.houseName || "Pressing"}</span>
            <span className="font-normal text-slate-400">· {order.neighborhoodName}</span>
          </p>
          <p className="text-slate-500 flex items-center gap-1.5">
            <Clock className="size-3.5 text-slate-400" />
            <span>
              Collecte :{" "}
              {new Date(order.pickupSlotStart).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-base font-black text-slate-900">
            {order.totalDue.toLocaleString("fr-FR")} CDF
          </span>
          <ArrowRight className="size-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition" />
        </div>
      </div>
    </Link>
  );
}
