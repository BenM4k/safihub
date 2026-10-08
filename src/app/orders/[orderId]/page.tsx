import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getCurrentUser } from "@/services/auth";
import { getCustomerOrderDetail } from "@/services/order";
import { OrderHeader } from "@/components/orders/detail/order-header";
import { OrderItemsCard } from "@/components/orders/detail/order-items-card";
import { OrderStatusTimeline } from "@/components/orders/detail/order-status-timeline";
import { OrderCancelCard } from "@/components/orders/detail/order-cancel-card";
import { ExpiredSwitchCard } from "@/components/orders/detail/expired-switch-card";
import { PriceAdjustmentCard } from "@/components/orders/detail/price-adjustment-card";
import { DeliverySlotConfirmationCard } from "@/components/orders/detail/delivery-slot-confirmation-card";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await getCurrentUser();
  const { orderId } = await params;

  if (!user) {
    redirect(`/login?callbackUrl=/orders/${orderId}`);
  }

  const res = await getCustomerOrderDetail(orderId, user.id);
  if (!res.ok) {
    notFound();
  }

  const { order, items, events } = res.value;

  const canDispute = ["delivered", "ready", "washing", "delivery_in_progress", "price_adjusted", "price_declined"].includes(
    order.status
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="size-3.5" />
            <span>Toutes mes commandes</span>
          </Link>

          {canDispute && order.status !== "disputed" && (
            <Link
              href={`/orders/${order.id}/dispute`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition"
            >
              <AlertCircle className="size-3.5 text-rose-500" />
              <span>Signaler un litige / problème</span>
            </Link>
          )}
        </div>

        <OrderHeader order={order} />

        <ExpiredSwitchCard order={order} items={items} />
        <PriceAdjustmentCard
          orderId={order.id}
          status={order.status}
          totalDue={order.totalDue}
          items={items}
          method="app"
        />
        <DeliverySlotConfirmationCard
          orderId={order.id}
          status={order.status}
          deliverySlotStart={order.deliverySlotStart}
          deliverySlotEnd={order.deliverySlotEnd}
          method="app"
        />
        <OrderCancelCard orderId={order.id} status={order.status} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2">
            <OrderItemsCard
              items={items}
              currency={order.currency}
              itemsTotal={order.itemsTotal}
              deliveryFee={order.deliveryFee}
              totalDue={order.totalDue}
            />
          </div>

          <div className="md:col-span-1">
            <OrderStatusTimeline events={events} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
