import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { guardAdminRoute } from "@/services/auth";
import { PageHeader } from "@/components/admin/shared/page-header";
import { CoverageStreamContent } from "@/components/admin/coverage/coverage-stream-content";
import { AdminCoverageSkeleton } from "@/components/admin/coverage/admin-coverage-skeleton";

export default async function AdminCoveragePage() {
  const [, t] = await Promise.all([
    guardAdminRoute(),
    getTranslations("admin.coverage"),
  ]);

  return (
    <div className="space-y-6">
      <div className="animate-enter">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      </div>

      <Suspense fallback={<AdminCoverageSkeleton />}>
        <CoverageStreamContent />
      </Suspense>
    </div>
  );
}
