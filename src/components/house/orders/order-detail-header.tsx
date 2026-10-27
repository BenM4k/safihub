import { Calendar, Clock, MapPin, Shield, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import type { HouseOrderDetailRecord } from "@/dal";
import { formatAmount, formatDateTime, getOrderStatusConfig } from "@/lib/order-formatters";
import { AcceptanceTimer } from "../dashboard/acceptance-timer";
import { OrderActions } from "./order-actions";

export async function OrderDetailHeader({
  order,
}: {
  order: HouseOrderDetailRecord;
}) {
  const t = await getTranslations("house.orders");
  const statusCfg = getOrderStatusConfig(order.status);

  return (
    <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-heading font-mono tracking-tight">
              {order.code}
            </h1>
            <Badge variant="outline" className={`gap-1.5 font-bold ${statusCfg.badgeClass}`}>
              <span className={`size-1.5 rounded-full ${statusCfg.dotClass}`} />
              <span>{statusCfg.label}</span>
            </Badge>
            {order.status === "created" && (
              <AcceptanceTimer deadline={order.acceptanceDeadlineAt} />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(order.createdAt)}
          </p>
        </div>

        {order.status === "created" && (
          <OrderActions orderId={order.id} currentStatus={order.status} />
        )}
      </div>

      {/* AC 15 Privacy Shield Notice */}
      <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-start gap-2.5">
        <Shield className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-foreground">
          <strong className="text-heading font-semibold">{t("privacyBadge")} :</strong>{" "}
          {t("privacyNotice")}
        </div>
      </div>

      {/* Customer summary (AC 15 Restricted projection) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
        <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
          <span className="text-muted-foreground mb-0.5 flex items-center gap-1">
            <User className="size-3" /> {t("customerPseudonym")}
          </span>
          <strong className="text-heading font-bold text-sm">
            {order.customerFirstName}
          </strong>
        </div>

        <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
          <span className="text-muted-foreground mb-0.5 flex items-center gap-1">
            <MapPin className="size-3" /> {t("neighborhood")}
          </span>
          <strong className="text-heading font-bold text-sm">
            {order.neighborhoodName ?? "Bukavu"}
          </strong>
        </div>

        <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
          <span className="text-muted-foreground mb-0.5 flex items-center gap-1">
            <Calendar className="size-3" /> {t("pickupSlot")}
          </span>
          <strong className="text-heading font-semibold">
            {formatDateTime(order.pickupSlotStart)}
          </strong>
        </div>

        <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
          <span className="text-muted-foreground mb-0.5 flex items-center gap-1 text-[11px]">
            <Clock className="size-3" /> {t("financialItemsTotal")}
          </span>
          <strong className="text-foreground font-bold text-sm block">
            {formatAmount(order.adjustedItemsTotal ?? order.itemsTotal, order.currency)}
          </strong>
          <span className="text-[11px] text-success font-black font-mono block pt-0.5">
            {t("financialPartnerShare")}:{" "}
            {formatAmount(
              (order.adjustedItemsTotal ?? order.itemsTotal) - (order.commissionAmount ?? 0),
              order.currency
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
