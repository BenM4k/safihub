"use client";

import { ShoppingBag } from "lucide-react";
import { formatAmount, formatDateTime, formatOrderReference } from "@/lib/order-formatters";
import type { CustomerDetailedProfile } from "@/services/admin";
import { StatusPill, type StatusPillType } from "@/components/admin/shared/status-pill";

interface CustomerTabOrdersProps {
  profile: CustomerDetailedProfile;
}

export function CustomerTabOrders({ profile }: CustomerTabOrdersProps) {
  const { orders } = profile;

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-ink-500 border-2 border-border-strong rounded-xl bg-card">
        <ShoppingBag className="size-8 text-ink-400 mx-auto mb-2" />
        <div className="font-semibold text-heading">Aucune commande enregistrée</div>
        <div className="text-2xs text-ink-500 mt-0.5">Ce client n&apos;a pas encore passé de commande.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between text-2xs text-ink-500 font-semibold px-1">
        <span>{orders.length} commande(s) au total</span>
        <span>Trié par date décroissante</span>
      </div>

      <div className="divide-y divide-border-strong border-2 border-border-strong rounded-xl bg-card overflow-hidden">
        {orders.map((o) => (
          <div key={o.id} className="p-3.5 hover:bg-surface transition-colors flex items-center justify-between gap-3">
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
                <StatusPill status={o.status as StatusPillType} className="scale-90 origin-right" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
