import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { guardAdminRoute } from "@/services/auth";
import { PageHeader } from "@/components/admin/shared/page-header";
import { getWeekBounds } from "@/components/admin/settlements/period-utils";
import { SettlementsStreamContent } from "@/components/admin/settlements/settlements-stream-content";
import { SettlementsLoadingSkeleton } from "@/components/admin/settlements/settlements-loading-skeleton";

interface AdminSettlementsPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function AdminSettlementsPage({
  searchParams,
}: AdminSettlementsPageProps) {
  const [, params, t] = await Promise.all([
    guardAdminRoute(),
    searchParams,
    getTranslations("admin.settlements"),
  ]);

  const currentBounds = getWeekBounds();
  const selectedPeriod =
    params.period && /^\d{4}-W\d{2}$/.test(params.period)
      ? params.period
      : currentBounds.weekString;

  return (
    <div className="space-y-6">
      <div className="animate-enter">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      </div>

      <Suspense fallback={<SettlementsLoadingSkeleton />}>
        <SettlementsStreamContent selectedPeriod={selectedPeriod} />
      </Suspense>
    </div>
  );
}
