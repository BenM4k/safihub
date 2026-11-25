import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { guardAdminRoute } from "@/services/auth";
import { parseAdminCouriersSearchParams } from "@/lib/admin-couriers-query";
import { HousesWithoutCourierAlert } from "@/components/admin/couriers/houses-without-courier-alert";
import { CouriersStreamContent } from "@/components/admin/couriers/couriers-stream-content";
import { AdminCouriersSkeleton } from "@/components/admin/couriers/admin-couriers-skeleton";

interface AdminCouriersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminCouriersPage({
  searchParams,
}: AdminCouriersPageProps) {
  const [, rawSearchParams, t] = await Promise.all([
    guardAdminRoute(),
    searchParams,
    getTranslations("admin.couriers"),
  ]);

  const query = parseAdminCouriersSearchParams(rawSearchParams);

  return (
    <div className="space-y-6">
      <div className="animate-enter">
        <h1 className="text-2xl font-black text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <Suspense fallback={null}>
        <HousesWithoutCourierAlert />
      </Suspense>

      <Suspense fallback={<AdminCouriersSkeleton />}>
        <CouriersStreamContent query={query} />
      </Suspense>
    </div>
  );
}
