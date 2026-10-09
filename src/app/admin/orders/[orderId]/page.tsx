import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrderDetail } from "@/services/admin";
import { OrderItemsList } from "@/components/admin/orders/order-items-list";
import { OnBehalfActions } from "@/components/admin/orders/on-behalf-actions";
import { FirstOrderScreeningActions } from "@/components/admin/orders/first-order-screening-actions";
import { OrderTimeline } from "@/components/admin/orders/order-timeline";
import { Button } from "@/components/ui/button";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const res = await getAdminOrderDetail(orderId);

  if (!res.ok || !res.value) {
    notFound();
  }

  const { order, items, events } = res.value;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EAECF0] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#667085]">
                ← Retour aux commandes
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#101828] font-mono">
              Commande #{order.code}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2824D5]/10 text-[#2824D5]">
              {order.status}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#F2F4F7] text-[#344054]">
              Canal: {order.source}
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-1 font-mono">Token: {order.trackingToken}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/track/${order.trackingToken}`} target="_blank">
            <Button variant="outline" size="sm" className="text-xs border-[#D0D5DD]">
              Vue de suivi client ↗
            </Button>
          </Link>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer card */}
        <div className="p-4 rounded-xl border border-[#EAECF0] bg-white shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase text-[#667085]">Client</h3>
          <p className="text-sm font-semibold text-[#101828]">{order.customerName || "Client invité"}</p>
          <p className="text-xs text-[#344054] font-mono">{order.customerPhone}</p>
          <p className="text-xs text-[#475467]">
            Quartier: <span className="font-medium">{order.neighborhoodName || "Non spécifié"}</span>
          </p>
          <p className="text-xs text-[#475467]">Repère: {order.landmark}</p>
        </div>

        {/* House card */}
        <div className="p-4 rounded-xl border border-[#EAECF0] bg-white shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase text-[#667085]">Pressing partenaire</h3>
          <p className="text-sm font-semibold text-[#101828]">{order.houseName || order.houseId}</p>
          <p className="text-xs text-[#475467]">
            Créneau collecte:{" "}
            <span className="font-medium text-[#101828]">
              {new Date(order.pickupSlotStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
              {new Date(order.pickupSlotEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </p>
          {order.deliveryConfirmationCode && (
            <p className="text-xs text-[#027A48] font-mono font-bold bg-[#ECFDF3] p-1.5 rounded">
              Code de livraison: {order.deliveryConfirmationCode}
            </p>
          )}
        </div>

        {/* Financials card */}
        <div className="p-4 rounded-xl border border-[#EAECF0] bg-white shadow-sm space-y-1.5 text-xs text-[#475467]">
          <h3 className="text-xs font-bold uppercase text-[#667085] mb-2">Finances & Tarification</h3>
          <div className="flex justify-between">
            <span>Articles:</span>
            <span className="font-medium text-[#101828]">
              {order.itemsTotal.toLocaleString()} {order.currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Frais livraison:</span>
            <span className="font-medium text-[#101828]">
              {order.deliveryFee.toLocaleString()} {order.currency}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-[#EAECF0] font-semibold text-[#101828]">
            <span>Total dû:</span>
            <span className="text-[#2824D5]">
              {order.totalDue.toLocaleString()} {order.currency}
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-[#667085] pt-1">
            <span>Commission ({order.commissionBps / 100}%):</span>
            <span>
              {order.commissionAmount.toLocaleString()} {order.currency}
            </span>
          </div>
          {order.exchangeRateUsed && (
            <div className="text-[11px] text-[#667085]">
              Taux gelé: 1 USD = {order.exchangeRateUsed} CDF
            </div>
          )}
        </div>
      </div>

      {/* Main split: Items & On-behalf actions vs Event Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OrderItemsList items={items} currency={order.currency} />
          {order.status === "awaiting_confirmation" ? (
            <FirstOrderScreeningActions orderId={order.id} />
          ) : (
            <OnBehalfActions order={order} />
          )}
        </div>
        <div className="lg:col-span-1">
          <OrderTimeline orderId={order.id} events={events} />
        </div>
      </div>
    </div>
  );
}
