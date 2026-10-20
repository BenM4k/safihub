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
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case "house_accepted":
      case "washing":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "ready":
      case "delivery_slot_confirmed":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      case "delivery_in_progress":
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
      case "delivered":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "cancelled":
      case "expired":
      case "rejected":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
      case "price_adjusted":
      case "disputed":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="bg-card rounded-3xl border border-border p-6 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-heading tracking-tight">
              Commande #{order.code}
            </h1>
            <Badge variant="outline" className={`font-bold px-2.5 py-0.5 capitalize ${getStatusColor(order.status)}`}>
              {order.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="size-4 text-muted-foreground/70" />
            <span>Passée le {formatBukavuDateTime(order.createdAt)}</span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            Total à régler
          </span>
          <span className="text-2xl sm:text-3xl font-black text-heading">
            {order.totalDue.toLocaleString()} {order.currency}
          </span>
          <span className="text-xs text-muted-foreground block mt-0.5">
            Paiement espèces à la livraison
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/50 border border-border">
          <Building2 className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="text-muted-foreground font-medium block">Atelier de pressing</span>
            <span className="font-bold text-heading text-sm block">
              {order.houseName || "Pressing Partenaire"}
            </span>
            {order.housePhone && (
              <span className="text-muted-foreground flex items-center gap-1 mt-0.5">
                <Phone className="size-3 text-muted-foreground/70" />
                {order.housePhone}
              </span>
            )}
          </div>
        </div>

        {order.deliveryConfirmationCode && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider block text-[11px]">
                Code de vérification livraison
              </span>
              <span className="font-black text-emerald-800 dark:text-emerald-200 text-lg tracking-widest block">
                {order.deliveryConfirmationCode}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
