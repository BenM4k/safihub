import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { guardAdminRoute } from "@/services/auth";
import { PageHeader } from "@/components/admin/shared/page-header";
import { DeliveryFeesStreamContent } from "@/components/admin/delivery-fees/delivery-fees-stream-content";
import { AdminDeliveryFeesSkeleton } from "@/components/admin/delivery-fees/admin-delivery-fees-skeleton";

export default async function AdminDeliveryFeesPage() {
  const [, t] = await Promise.all([
    guardAdminRoute(),
    getTranslations("admin.deliveryFees"),
  ]);

  return (
    <div className="space-y-6">
      <div className="animate-enter">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      </div>

      <Suspense fallback={<AdminDeliveryFeesSkeleton />}>
        <DeliveryFeesStreamContent />
      </Suspense>
    </div>
  );
}
