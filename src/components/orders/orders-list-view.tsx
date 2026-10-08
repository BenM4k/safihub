import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { OrderListCard } from "./orders-list-card";
import type { OrderListItemRecord } from "@/dal";

export function OrdersListView({ orders }: { orders: OrderListItemRecord[] }) {
  if (orders.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto">
        <div className="size-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="size-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Aucune commande en cours
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Vous n&apos;avez pas encore passé de commande de pressing à Bukavu.
        </p>
        <Link
          href="/houses"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition shadow-sm"
        >
          <span>Découvrir les pressings</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderListCard key={order.id} order={order} />
      ))}
    </div>
  );
}
