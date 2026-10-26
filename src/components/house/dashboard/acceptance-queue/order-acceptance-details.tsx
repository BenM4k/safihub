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
  const deliveryFee = order.deliveryFee ?? 0;
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

      <div className="sm:border-l sm:border-border sm:pl-4 flex flex-col justify-between">
        <div className="p-2.5 rounded-xl bg-surface border border-border space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground font-semibold">
            <span>{t("financialClientTotal")}</span>
            <span className="font-bold text-foreground">
              {formatAmount(order.totalDue, order.currency)}
            </span>
          </div>

          <div className="space-y-1 pt-1 border-t border-border/60 text-[11px] text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>• {t("financialLaundryAmount")}</span>
              <span className="font-medium text-foreground">
                {formatAmount(itemsTotal, order.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>• {t("financialDeliveryFee")}</span>
              <span className="font-medium text-foreground">
                {formatAmount(deliveryFee, order.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>
                • {t("financialCommission")}
                {commissionPct ? ` (${commissionPct}%)` : ""}
              </span>
              <span className="text-destructive font-medium">
                -{formatAmount(commissionAmount, order.currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-border font-bold text-xs">
            <span className="text-primary">{t("financialPartnerNet")}</span>
            <span className="text-primary font-black font-mono text-sm">
              {formatAmount(netEarnings, order.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
