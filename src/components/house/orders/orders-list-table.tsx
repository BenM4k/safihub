import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { HouseOrderListItemRecord } from "@/dal";
import { OrderActions } from "./order-actions";
import { AcceptanceTimer } from "../dashboard/acceptance-timer";

export async function OrdersListTable({
  orders,
  houseSlug,
}: {
  orders: HouseOrderListItemRecord[];
  houseSlug?: string;
}) {
  const t = await getTranslations("house.orders");

  if (orders.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center space-y-3 shadow-xs">
        <Package className="size-10 text-muted-foreground/40 mx-auto" />
        <p className="text-sm font-semibold text-heading">{t("empty")}</p>
      </div>
    );
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "created":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-warning-soft text-warning border border-warning/30">À accepter</span>;
      case "accepted":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-soft text-primary border border-primary/20">Acceptée</span>;
      case "received":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-soft text-primary border border-primary/20">Reçue (à compter)</span>;
      case "price_adjusted":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-warning-soft text-warning border border-warning/30">Prix ajusté</span>;
      case "washing":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-soft text-primary border border-primary/20">En lavage</span>;
      case "ready":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-success-soft text-success border border-success/30">Prête</span>;
      case "delivered":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary text-muted-foreground border border-border">Livrée</span>;
      case "rejected":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive-soft text-destructive border border-destructive/30">Refusée</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary text-foreground border border-border">{status}</span>;
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
      <div className="divide-y divide-border">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-secondary/40 transition"
          >
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-sm text-heading">
                  {order.code}
                </span>
                {getStatusBadge(order.status)}
                {order.status === "created" && (
                  <AcceptanceTimer deadline={order.acceptanceDeadlineAt} />
                )}
              </div>

              {/* AC 15 Customer Privacy: first name & neighborhood only */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted-foreground">
                <span>
                  Client: <strong className="text-heading font-semibold">{order.customerFirstName}</strong>
                </span>
                <span>•</span>
                <span>
                  Quartier: <strong className="text-heading font-semibold">{order.neighborhoodName ?? "Bukavu"}</strong>
                </span>
                <span>•</span>
                <span>
                  Articles: <strong className="text-heading font-semibold">{order.itemsTotal.toLocaleString()} {order.currency}</strong>
                </span>
                <span>•</span>
                <span>
                  Total dû: <strong className="text-success font-bold">{order.totalDue.toLocaleString()} {order.currency}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
              {order.status === "created" && (
                <OrderActions orderId={order.id} currentStatus={order.status} compact />
              )}

              <Link
                href={houseSlug ? `/partner/${houseSlug}/orders/${order.id}` : `/partner/orders/${order.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground hover:text-heading bg-secondary hover:bg-secondary/80 transition"
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
