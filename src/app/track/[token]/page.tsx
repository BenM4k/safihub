import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/services/auth";
import { Navbar } from "@/components/home/header/navbar";
import { Footer } from "@/components/home/footer/footer";
import { getPublicTrackingOrder } from "@/services/order";
import { getOrderPhotosWithSignedUrlsService } from "@/services/storage";
import { OrderHeader } from "@/components/orders/detail/order-header";
import { OrderItemsCard } from "@/components/orders/detail/order-items-card";
import { OrderStatusTimeline } from "@/components/orders/detail/order-status-timeline";
import { PriceAdjustmentCard } from "@/components/orders/detail/price-adjustment-card";
import { DeliverySlotConfirmationCard } from "@/components/orders/detail/delivery-slot-confirmation-card";
import { DeliveryCodeBadge } from "@/components/track/delivery-code-badge";
import { OrderPhotosGallery } from "@/components/photos/order-photos-gallery";

interface TrackOrderPageProps {
  params: Promise<{ token: string }>;
}

export const metadata = {
  title: "Suivi de commande — SafiHub",
  description: "Suivez l'état de votre commande de pressing en direct sans connexion.",
};

export default async function TrackOrderPage({ params }: TrackOrderPageProps) {
  const { token } = await params;
  const user = await getCurrentUser();

  const res = await getPublicTrackingOrder(token);
  if (!res.ok) {
    notFound();
  }

  const { order, items, events } = res.value;

  const photosRes = await getOrderPhotosWithSignedUrlsService({
    orderId: order.id,
    guestToken: token,
  });
  const photos = photosRes.ok ? photosRes.value : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar variant="solid" user={user} />
      <main className="flex-1 flex flex-col py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href="/track"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft className="size-3.5" />
              <span>Autre recherche de suivi</span>
            </Link>
            <span className="text-xs text-slate-400 font-medium">
              Lien de suivi invité sécurisé
            </span>
          </div>

        <DeliveryCodeBadge code={order.deliveryConfirmationCode} />

        <OrderHeader order={order} />

        <PriceAdjustmentCard
          orderId={order.id}
          status={order.status}
          totalDue={order.totalDue}
          items={items}
          method="tracking_link"
        />

        <DeliverySlotConfirmationCard
          orderId={order.id}
          status={order.status}
          deliverySlotStart={order.deliverySlotStart}
          deliverySlotEnd={order.deliverySlotEnd}
          method="tracking_link"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 space-y-6">
            <OrderItemsCard
              items={items}
              currency={order.currency}
              itemsTotal={order.itemsTotal}
              deliveryFee={order.deliveryFee}
              totalDue={order.totalDue}
            />

            <OrderPhotosGallery photos={photos} />
          </div>

          <div className="md:col-span-1">
            <OrderStatusTimeline events={events} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);
}
