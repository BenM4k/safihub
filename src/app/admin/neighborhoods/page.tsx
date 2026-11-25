import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { guardAdminRoute } from "@/services/auth";
import { PageHeader } from "@/components/admin/shared/page-header";
import { NeighborhoodsStreamContent } from "@/components/admin/neighborhoods/neighborhoods-stream-content";
import { AdminNeighborhoodsSkeleton } from "@/components/admin/neighborhoods/admin-neighborhoods-skeleton";

export default async function AdminNeighborhoodsPage() {
  const [, t] = await Promise.all([
    guardAdminRoute(),
    getTranslations("admin.neighborhoods"),
  ]);

  return (
    <div className="space-y-6">
      <div className="animate-enter">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      </div>

      <Suspense fallback={<AdminNeighborhoodsSkeleton />}>
        <NeighborhoodsStreamContent />
      </Suspense>
    </div>
  );
}
