import type { OrderItemRecord } from "@/dal";
import { Shirt, CheckCircle2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OrderItemsCardProps {
  items: OrderItemRecord[];
  currency: string;
  itemsTotal: number;
  deliveryFee: number;
  totalDue: number;
}

export function OrderItemsCard({
  items,
  currency,
  itemsTotal,
  deliveryFee,
  totalDue,
}: OrderItemsCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Shirt className="size-4 text-primary" />
          <span>Articles confiés ({items.length})</span>
        </h3>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          const qty = item.receivedQuantity ?? item.pickupQuantity ?? item.declaredQuantity;
          const lineTotal = item.unitPrice * qty;
          const isReturned = item.status === "returned";

          return (
            <div key={item.id} className="py-3 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">
                    {item.itemNameFr || item.customLabel || "Article de linge"}
                  </p>
                  {isReturned ? (
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold">
                      <RotateCcw className="size-3 mr-1" /> Retourné non lavé
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                      <CheckCircle2 className="size-3 mr-1" /> Accepté
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-500">
                  {[item.serviceNameFr, item.fabricNameFr].filter(Boolean).join(" · ")}
                </p>

                <p className="text-xs text-slate-400">
                  Quantité déclarée : {item.declaredQuantity}
                  {item.receivedQuantity !== null && item.receivedQuantity !== item.declaredQuantity && (
                    <span className="text-amber-700 font-semibold ml-2">
                      (Reçu à l&apos;atelier : {item.receivedQuantity})
                    </span>
                  )}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-slate-900">
                  {isReturned ? 0 : lineTotal.toLocaleString()} {currency}
                </p>
                <p className="text-xs text-slate-400">
                  {item.unitPrice.toLocaleString()} {currency} × {qty}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Sous-total articles</span>
          <span className="font-semibold text-slate-900">
            {itemsTotal.toLocaleString()} {currency}
          </span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Frais de transport & livraison</span>
          <span className="font-semibold text-slate-900">
            {deliveryFee.toLocaleString()} {currency}
          </span>
        </div>
        <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
          <span>Total</span>
          <span>
            {totalDue.toLocaleString()} {currency}
          </span>
        </div>
      </div>
    </div>
  );
}
