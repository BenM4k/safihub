import { MapPin, Calendar, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("house.dashboard");

  const pickupSlotStr = order.pickupSlotStart
    ? new Date(order.pickupSlotStart).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Africa/Lubumbashi",
      })
    : null;

  const deliveryStr = order.estimatedDeliveryAt
    ? new Date(order.estimatedDeliveryAt).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "Africa/Lubumbashi",
      })
    : null;

  const itemsTotal = order.adjustedItemsTotal ?? order.itemsTotal;
  const commissionAmount = order.commissionAmount ?? 0;
  const commissionPct = order.commissionBps ? order.commissionBps / 100 : null;

  return (
    <div className="grid sm:grid-cols-2 gap-3.5 text-xs">
      <div className="space-y-1.5">
        <p className="text-muted-foreground">
          {t("clientLabel")}{" "}
          <strong className="text-heading font-bold">
            {order.customerFirstName}
          </strong>
        </p>
        <p className="text-foreground flex items-center gap-1.5">
          <MapPin className="size-3.5 text-muted-foreground shrink-0" />
          <span>
            {t("neighborhoodLabel")}{" "}
            <strong className="text-heading font-semibold">
              {order.neighborhoodName || "Bukavu"}
            </strong>
          </span>
        </p>
        <p className="text-foreground font-medium">
          🧺 {order.itemsSummary || t("laundryArticlesLabel")}
        </p>
        <p className="text-[11px] text-primary font-semibold">
          ✨ {order.servicesSummary || t("standardCleaningLabel")}
        </p>

        {pickupSlotStr && (
          <p className="text-foreground flex items-center gap-1.5 pt-0.5">
            <Truck className="size-3.5 text-muted-foreground shrink-0" />
            <span>
              {t("courierPickupLabel")}{" "}
              <strong className="text-heading">
                {t("pickupFrom", { time: pickupSlotStr })}
              </strong>
            </span>
          </p>
        )}
        {deliveryStr && (
          <p className="text-foreground flex items-center gap-1.5">
            <Calendar className="size-3.5 text-muted-foreground shrink-0" />
            <span>
              {t("promisedDeliveryLabel")}{" "}
              <strong className="text-heading">{deliveryStr}</strong>
            </span>
          </p>
        )}
      </div>

      <div className="sm:border-l sm:border-border/60 sm:pl-4 flex flex-col justify-between">
        <div className="p-2.5 sm:p-3 rounded-xl bg-surface space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground font-semibold text-xs">
            <span>{t("financialLaundryAmount")}</span>
            <span className="font-bold text-foreground">
              {formatAmount(itemsTotal, order.currency)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
            <span>
              {t("financialCommission")}
              {commissionPct ? ` (${commissionPct}%)` : ""}
            </span>
            <span className="font-medium">
              -{formatAmount(commissionAmount, order.currency)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/60 font-bold text-xs bg-success-soft/30 -mx-1 px-2.5 py-1.5 rounded-lg border border-success/20">
            <span className="text-success font-bold">
              {t("financialPartnerNet")}
            </span>
            <span className="text-success font-black font-mono text-sm sm:text-base tabular-nums">
              {formatAmount(netEarnings, order.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
