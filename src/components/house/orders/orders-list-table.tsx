import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { HouseOrderListItemRecord } from "@/dal";
import { OrderActions } from "./order-actions";
import { AcceptanceTimer } from "../dashboard/acceptance-timer";

export async function OrdersListTable({
  orders,
}: {
  orders: HouseOrderListItemRecord[];
}) {
  const t = await getTranslations("house.orders");

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
        <Package className="size-10 text-slate-300 mx-auto" />
        <p className="text-sm font-semibold text-slate-700">{t("empty")}</p>
      </div>
    );
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "created":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">À accepter</span>;
      case "accepted":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Acceptée</span>;
      case "received":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">Reçue (à compter)</span>;
      case "price_adjusted":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">Prix ajusté</span>;
      case "washing":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">En lavage</span>;
      case "ready":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Prête</span>;
      case "delivered":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">Livrée</span>;
      case "rejected":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Refusée</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="divide-y divide-slate-100">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
          >
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-sm text-slate-900">
                  {order.code}
                </span>
                {getStatusBadge(order.status)}
                {order.status === "created" && (
                  <AcceptanceTimer deadline={order.acceptanceDeadlineAt} />
                )}
              </div>

              {/* AC 15 Customer Privacy: first name & neighborhood only */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                <span>
                  Client: <strong className="text-slate-800 font-semibold">{order.customerFirstName}</strong>
                </span>
                <span>•</span>
                <span>
                  Quartier: <strong className="text-slate-800 font-semibold">{order.neighborhoodName ?? "Bukavu"}</strong>
                </span>
                <span>•</span>
                <span>
                  Articles: <strong className="text-slate-800 font-semibold">{order.itemsTotal.toLocaleString()} {order.currency}</strong>
                </span>
                <span>•</span>
                <span>
                  Total dû: <strong className="text-emerald-700 font-bold">{order.totalDue.toLocaleString()} {order.currency}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              {order.status === "created" && (
                <OrderActions orderId={order.id} currentStatus={order.status} compact />
              )}

              <Link
                href={`/house/orders/${order.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
              >
                <span>Détail</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
