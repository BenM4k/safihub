import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SessionNavbar } from "@/components/home/header/session-navbar";
import { Footer } from "@/components/home/footer/footer";
import { getPublicTrackingOrder } from "@/services/order";
import { getOrderPhotosWithSignedUrlsService } from "@/services/storage";
import { OrderHeader } from "@/components/orders/detail/order-header";
import { OrderItemsCard } from "@/components/orders/detail/order-items-card";
import { OrderStatusTimeline } from "@/components/orders/detail/order-status-timeline";
import { PriceAdjustmentCard } from "@/components/orders/detail/price-adjustment-card";
import { DeliverySlotConfirmationCard } from "@/components/orders/detail/delivery-slot-confirmation-card";
import { OrderDetailSkeleton } from "@/components/orders/detail/order-detail-skeleton";
import { DeliveryCodeBadge } from "@/components/track/delivery-code-badge";
import { OrderPhotosGallery } from "@/components/photos/order-photos-gallery";

interface TrackOrderPageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: "Suivi de votre commande — SafiHub",
  description:
    "Suivez en direct l'avancement du traitement et de la livraison de votre commande de pressing à Bukavu.",
};

async function TrackOrderContent({ params }: TrackOrderPageProps) {
  const [{ token }, t] = await Promise.all([params, getTranslations("track")]);

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
    <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/track"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="size-3.5" />
          <span>{t("otherLookup")}</span>
        </Link>
        <span className="text-xs text-muted-foreground font-medium">
          {t("guestTrackingBadge")}
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
        trackingToken={token}
      />

      <DeliverySlotConfirmationCard
        orderId={order.id}
        status={order.status}
        deliverySlotStart={order.deliverySlotStart}
        deliverySlotEnd={order.deliverySlotEnd}
        method="tracking_link"
        trackingToken={token}
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
  );
}

export default function TrackOrderPage({ params }: TrackOrderPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SessionNavbar variant="solid" />
      <main className="flex-1 flex flex-col py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<OrderDetailSkeleton />}>
          <TrackOrderContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
