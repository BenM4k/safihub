"use client";

import { useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import {
  formatAmount,
  formatDateTime,
  formatOrderReference,
  getOrderStatusConfig,
} from "@/lib/order-formatters";
import type { CustomerDetailedProfile } from "@/services/admin";
import type { OrderStatus } from "@/services/db/schema";
import { StatusPill } from "@/components/admin/shared/status-pill";

interface CustomerTabOrdersProps {
  profile: CustomerDetailedProfile;
}

export function CustomerTabOrders({ profile }: CustomerTabOrdersProps) {
  const t = useTranslations("admin.customers.details");
  const { orders } = profile;

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-ink-500 border-2 border-border-strong rounded-xl bg-card">
        <ShoppingBag className="size-8 text-ink-400 mx-auto mb-2" />
        <div className="font-semibold text-heading">{t("noOrdersTitle")}</div>
        <div className="text-2xs text-ink-500 mt-0.5">{t("noOrdersDesc")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between text-2xs text-ink-500 font-semibold px-1">
        <span>{t("ordersCountTotal", { count: orders.length })}</span>
        <span>{t("sortedByDateDesc")}</span>
      </div>

      <div className="divide-y divide-border-strong border-2 border-border-strong rounded-xl bg-card overflow-hidden">
        {orders.map((o) => {
          const isCancelled = o.status === "cancelled";
          const pillStatus = isCancelled ? "cancelled" : "pending";
          const statusCfg = getOrderStatusConfig(o.status as OrderStatus);

          return (
            <div
              key={o.id}
              className="p-3.5 hover:bg-surface transition-colors flex items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-heading">
                    {formatOrderReference(o.code, o.id)}
                  </span>
                  <span className="text-2xs text-ink-500">· {o.houseName}</span>
                </div>
                <div className="text-2xs text-ink-500 font-mono">
                  {formatDateTime(o.createdAt)}
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="font-mono font-bold text-heading">
                  {formatAmount(o.totalDue, o.currency || "CDF")}
                </div>
                <div>
                  <StatusPill
                    status={pillStatus}
                    customLabel={statusCfg.label}
                    className="scale-90 origin-right"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
