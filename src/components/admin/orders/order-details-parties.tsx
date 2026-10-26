"use client";

import { MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderListItemRecord } from "@/dal";
import { Separator } from "@/components/ui/separator";
import { formatCustomerDisplay } from "@/lib/order-formatters";

interface OrderDetailsPartiesProps {
  order: OrderListItemRecord;
}

export function OrderDetailsParties({ order }: OrderDetailsPartiesProps) {
  const t = useTranslations("admin.orders");
  const customer = formatCustomerDisplay(order.customerName, order.customerPhone);

  return (
    <div className="space-y-4 text-xs">
      {/* Customer section */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
          {t("colCustomer")}
        </p>
        <p className="font-semibold text-foreground text-sm">
          {customer.displayName || t("customer")}
          {customer.isGuest && (
            <span className="ml-1.5 text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              {t("guestTag")}
            </span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <a
            href={`tel:${order.customerPhone}`}
            className="inline-flex items-center gap-1.5 font-mono text-primary hover:underline font-semibold"
          >
            <Phone className="size-3" />
            <span>{customer.formattedPhone}</span>
          </a>
          {order.neighborhoodName && (
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="size-3 text-muted-foreground" />
              <span>{order.neighborhoodName}</span>
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Pressing section */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
          {t("colPressing")}
        </p>
        <p className="font-semibold text-foreground text-sm">{order.houseName || "—"}</p>
        {order.housePhone && (
          <a
            href={`tel:${order.housePhone}`}
            className="inline-flex items-center gap-1.5 font-mono text-muted-foreground hover:text-foreground"
          >
            <Phone className="size-3" />
            <span>{order.housePhone}</span>
          </a>
        )}
      </div>
    </div>
  );
}
