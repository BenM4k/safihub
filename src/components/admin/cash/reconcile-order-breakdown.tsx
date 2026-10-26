"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, PackageCheck } from "lucide-react";
import { formatMoney, formatFrenchDateTime } from "@/lib/cash-formatters";
import { formatPhone } from "@/lib/order-formatters";

export interface ReconcileOrder {
  id: string;
  code: string;
  amount: number;
  currency: "CDF" | "USD";
  customerPhone?: string | null;
  createdAt?: Date | string;
}

interface ReconcileOrderBreakdownProps {
  orders: ReconcileOrder[];
  expectedCashCDF: number;
}

export function ReconcileOrderBreakdown({
  orders,
  expectedCashCDF,
}: ReconcileOrderBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!orders || orders.length === 0) {
    return (
      <div className="p-3 bg-muted/30 rounded-xl border border-border text-xs text-muted-foreground flex items-center gap-2">
        <PackageCheck className="size-4 text-muted-foreground" />
        <span>Aucune commande enregistrée pour cette journée.</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between text-left font-semibold text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
          <span>Détail des livraisons incluses ({orders.length})</span>
        </div>
        <span className="font-mono text-xs font-bold text-foreground tabular-nums">
          {formatMoney(expectedCashCDF)}
        </span>
      </button>

      {isExpanded && (
        <div className="p-3 pt-0 border-t border-border/60 divide-y divide-border/60 max-h-48 overflow-y-auto">
          {orders.map((ord, idx) => (
            <div key={ord.id || idx} className="py-2 flex items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-foreground">
                  #{ord.code.replace(/^(ORD|SAF)-/i, "")}
                </span>
                {ord.customerPhone && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatPhone(ord.customerPhone)}
                  </span>
                )}
                {ord.createdAt && (
                  <span className="block text-xs text-muted-foreground">
                    {formatFrenchDateTime(ord.createdAt)}
                  </span>
                )}
              </div>
              <span className="font-mono font-medium text-foreground tabular-nums shrink-0">
                {formatMoney(ord.amount, ord.currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
