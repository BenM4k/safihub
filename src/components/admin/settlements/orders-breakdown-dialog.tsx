"use client";

import { X, PackageCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney, formatFrenchDate } from "@/lib/cash-formatters";
import type { DeliveredOrderBreakdown } from "./types";

interface OrdersBreakdownDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payeeName: string;
  payeeType: "house" | "courier";
  orders: DeliveredOrderBreakdown[];
}

export function OrdersBreakdownDialog({
  isOpen,
  onClose,
  payeeName,
  payeeType,
  orders,
}: OrdersBreakdownDialogProps) {
  if (!isOpen) return null;

  const isHouse = payeeType === "house";
  const title = isHouse ? "Commandes livrées" : "Missions livrées";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="orders-dialog-title"
    >
      <div className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl border-2 border-border-strong overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b-2 border-border-strong flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <PackageCheck className="size-5" />
            </div>
            <div>
              <h2 id="orders-dialog-title" className="text-sm font-bold text-heading">
                {title} · {payeeName}
              </h2>
              <p className="text-xs text-muted-foreground">
                Détail des {orders.length} {orders.length > 1 ? "commandes constituant" : "commande constituant"} le solde
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-500 hover:text-ink-800 rounded-lg hover:bg-ink-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="overflow-y-auto p-4 flex-1">
          {orders.length === 0 ? (
            <div className="py-8 text-center text-ink-600 text-xs flex flex-col items-center gap-2">
              <AlertCircle className="size-5 text-ink-400" />
              <span>Aucune commande détaillée trouvée pour cette période.</span>
            </div>
          ) : (
            <div className="border-2 border-border-strong rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-border-strong bg-surface text-ink-700 font-semibold">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Date</th>
                    {isHouse ? (
                      <>
                        <th className="py-2.5 px-3 text-right">Brut</th>
                        <th className="py-2.5 px-3 text-right">Commission</th>
                        <th className="py-2.5 px-3 text-right">Net dû</th>
                      </>
                    ) : (
                      <th className="py-2.5 px-3 text-right">Rémunération</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-strong">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-heading">
                        {order.code}
                      </td>
                      <td className="py-2.5 px-3 text-ink-600 font-mono">
                        {formatFrenchDate(order.deliveredAt || order.createdAt)}
                      </td>
                      {isHouse ? (
                        <>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-ink-700">
                            {formatMoney(order.itemsTotal ?? 0, "CDF")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-ink-500">
                            -{formatMoney(order.commissionAmount ?? 0, "CDF")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-heading">
                            {formatMoney(order.owedToHouse ?? 0, "CDF")}
                          </td>
                        </>
                      ) : (
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                          {formatMoney(order.amount ?? 0, "CDF")}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t-2 border-border-strong bg-surface flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="min-h-[40px] px-4 font-semibold text-xs border-border-strong text-ink-700"
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
