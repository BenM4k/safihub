import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { guardAdminRoute } from "@/services/auth";
import { PageHeader } from "@/components/admin/shared/page-header";
import { CatalogueStreamContent } from "@/components/admin/catalogue/catalogue-stream-content";
import { AdminCatalogueSkeleton } from "@/components/admin/catalogue/admin-catalogue-skeleton";

export default async function AdminCataloguePage() {
  const [, t] = await Promise.all([
    guardAdminRoute(),
    getTranslations("admin.catalogue"),
  ]);

  return (
    <div className="space-y-6">
      <div className="animate-enter">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      </div>

      <Suspense fallback={<AdminCatalogueSkeleton />}>
        <CatalogueStreamContent />
      </Suspense>
    </div>
  );
}
