import { Badge } from "@/components/ui/badge";
import { formatBukavuDateTime } from "@/services/availability/bukavu-time";
import type { OrderDetailRecord } from "@/dal";
import { Building2, Calendar, Phone, ShieldCheck } from "lucide-react";

interface OrderHeaderProps {
  order: OrderDetailRecord;
}

export function OrderHeader({ order }: OrderHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "created":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "house_accepted":
      case "washing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "ready":
      case "delivery_slot_confirmed":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "delivery_in_progress":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "cancelled":
      case "expired":
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "price_adjusted":
      case "disputed":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Commande #{order.code}
            </h1>
            <Badge variant="outline" className={`font-bold px-2.5 py-0.5 capitalize ${getStatusColor(order.status)}`}>
              {order.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-500">
            <Calendar className="size-4 text-slate-400" />
            <span>Passée le {formatBukavuDateTime(order.createdAt)}</span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Total à régler
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {order.totalDue.toLocaleString()} {order.currency}
          </span>
          <span className="text-xs text-slate-500 block mt-0.5">
            Paiement espèces à la livraison
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <Building2 className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="text-slate-500 font-medium block">Atelier de pressing</span>
            <span className="font-bold text-slate-900 text-sm block">
              {order.houseName || "Pressing Partenaire"}
            </span>
            {order.housePhone && (
              <span className="text-slate-600 flex items-center gap-1 mt-0.5">
                <Phone className="size-3 text-slate-400" />
                {order.housePhone}
              </span>
            )}
          </div>
        </div>

        {order.deliveryConfirmationCode && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <ShieldCheck className="size-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="text-emerald-700 font-bold uppercase tracking-wider block text-[11px]">
                Code de vérification livraison
              </span>
              <span className="font-black text-emerald-950 text-lg tracking-widest block">
                {order.deliveryConfirmationCode}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
