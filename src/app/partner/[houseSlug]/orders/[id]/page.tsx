import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { guardHouseRoute } from "@/services/auth";
import { getHouseOrderDetail } from "@/services/house";
import { getOrderPhotosWithSignedUrlsService } from "@/services/storage";
import { OrderDetailHeader } from "@/components/house/orders/order-detail-header";
import { OrderDetailItems } from "@/components/house/orders/order-detail-items";
import { ReceptionCountForm } from "@/components/house/orders/reception-count-form";
import { MarkReadyButton } from "@/components/house/orders/mark-ready-button";
import { OrderPhotosGallery } from "@/components/photos/order-photos-gallery";

interface PageProps {
  params: Promise<{ houseSlug: string; id: string }>;
}

export default async function PartnerOrderDetailPage({ params }: PageProps) {
  const { houseSlug, id } = await params;
  const t = await getTranslations("house.orders");
  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
  }

  const detailRes = await getHouseOrderDetail(houseId, id);
  if (!detailRes.ok) {
    notFound();
  }

  const { order, items } = detailRes.value;

  const photosRes = await getOrderPhotosWithSignedUrlsService({
    user: { id: authCtx.user.id, role: authCtx.user.role },
    orderId: id,
  });
  const photos = photosRes.ok ? photosRes.value : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href={`/partner/${houseSlug}/orders`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition mb-3"
        >
          <ArrowLeft className="size-3.5" />
          <span>{t("backToOrders")}</span>
        </Link>
      </div>

      {/* Header with order code, restricted customer view (AC 15), status & transition actions */}
      <OrderDetailHeader order={order} />

      {/* Items list with declared / counted quantities */}
      <OrderDetailItems items={items} />

      {/* Order photos gallery */}
      {photos.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-heading uppercase tracking-wider">
            {t("orderPhotos", { count: photos.length })}
          </h2>
          <OrderPhotosGallery photos={photos} />
        </div>
      )}

      {/* Reception item count check if order arrived at house (AC 10) */}
      {order.status === "received" && (
        <ReceptionCountForm orderId={order.id} houseId={houseId} items={items} />
      )}

      {/* Mark ready button for washing status */}
      {order.status === "washing" && (
        <MarkReadyButton orderId={order.id} houseId={houseId} />
      )}
    </div>
  );
}
