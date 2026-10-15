import { MapPin, Calendar, Truck } from "lucide-react";
import { formatAmount } from "@/lib/order-formatters";
import type { HouseOrderListItemRecord } from "@/dal";

interface OrderAcceptanceDetailsProps {
  order: HouseOrderListItemRecord;
  netEarnings: number;
}

export function OrderAcceptanceDetails({
  order,
  netEarnings,
}: OrderAcceptanceDetailsProps) {
  const pickupSlotStr = order.pickupSlotStart
    ? new Date(order.pickupSlotStart).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const deliveryStr = order.estimatedDeliveryAt
    ? new Date(order.estimatedDeliveryAt).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <div className="grid sm:grid-cols-2 gap-3 text-xs">
      <div className="space-y-1.5">
        <p className="text-muted-foreground">
          Client :{" "}
          <strong className="text-heading font-bold">
            {order.customerFirstName}
          </strong>
        </p>
        <p className="text-foreground flex items-center gap-1.5">
          <MapPin className="size-3.5 text-muted-foreground shrink-0" />
          <span>
            Quartier :{" "}
            <strong className="text-heading font-semibold">
              {order.neighborhoodName || "Bukavu"}
            </strong>
          </span>
        </p>
        <p className="text-foreground font-medium">
          🧺 {order.itemsSummary || "Articles de linge"}
        </p>
        <p className="text-[11px] text-primary font-semibold">
          ✨ {order.servicesSummary || "Pressing standard"}
        </p>
      </div>

      <div className="space-y-1.5 sm:border-l sm:border-border sm:pl-4">
        {pickupSlotStr && (
          <p className="text-foreground flex items-center gap-1.5">
            <Truck className="size-3.5 text-muted-foreground shrink-0" />
            <span>
              Collecte coursier :{" "}
              <strong className="text-heading">dès {pickupSlotStr}</strong>
            </span>
          </p>
        )}
        {deliveryStr && (
          <p className="text-foreground flex items-center gap-1.5">
            <Calendar className="size-3.5 text-muted-foreground shrink-0" />
            <span>
              Livraison promise :{" "}
              <strong className="text-heading">{deliveryStr}</strong>
            </span>
          </p>
        )}
        <div className="pt-1">
          <span className="text-muted-foreground text-[11px] block">
            Montant client : {formatAmount(order.totalDue)}
          </span>
          <span className="text-success font-black text-sm">
            Votre part : {formatAmount(netEarnings)}
          </span>
        </div>
      </div>
    </div>
  );
}
