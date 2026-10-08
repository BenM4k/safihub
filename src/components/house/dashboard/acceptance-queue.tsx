import Link from "next/link";
import { Clock, Shield, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { HouseOrderListItemRecord } from "@/dal";
import { AcceptanceTimer } from "./acceptance-timer";
import { OrderActions } from "../orders/order-actions";

export async function AcceptanceQueue({
  orders,
}: {
  orders: HouseOrderListItemRecord[];
}) {
  const t = await getTranslations("house.dashboard");

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
        <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Clock className="size-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          {t("noWaitingOrders")}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Toutes les commandes entrantes ont été traitées. Les nouvelles commandes apparaîtront ici dès leur soumission.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-amber-50/40">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-amber-500 animate-ping" />
          <h2 className="font-bold text-sm sm:text-base text-slate-900">
            {t("waitingTitle")} ({orders.length})
          </h2>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-slate-600 border border-slate-200">
          <Shield className="size-3 text-violet-600" />
          <span className="text-[11px]">AC 15 Protégé</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-sm text-slate-900">
                  {order.code}
                </span>
                <AcceptanceTimer deadline={order.acceptanceDeadlineAt} />
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                <span>
                  Client:{" "}
                  <strong className="text-slate-700 font-semibold">
                    {order.customerFirstName}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Quartier:{" "}
                  <strong className="text-slate-700 font-semibold">
                    {order.neighborhoodName ?? "Bukavu"}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Total:{" "}
                  <strong className="text-emerald-700 font-bold">
                    {order.totalDue.toLocaleString()} {order.currency}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
              <OrderActions
                orderId={order.id}
                currentStatus={order.status}
                compact
              />
              <Link
                href={`/house/orders/${order.id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
              >
                <span>Détail</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
