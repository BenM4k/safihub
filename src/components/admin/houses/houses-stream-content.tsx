import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
  listAdminHousesEnriched,
  listAdminNeighborhoods,
  listAdminPendingReviews,
} from "@/services/admin";
import type { AdminHousesQueryParams } from "@/lib/admin-houses-query";
import { Button } from "@/components/ui/button";
import { HousesManagementView } from "./houses-management-view";

interface HousesStreamContentProps {
  query: AdminHousesQueryParams;
}

export async function HousesStreamContent({ query }: HousesStreamContentProps) {
  const [t, housesRes, neighRes, pendingReviews] = await Promise.all([
    getTranslations("admin.houses"),
    listAdminHousesEnriched(),
    listAdminNeighborhoods(),
    listAdminPendingReviews(),
  ]);

  if (!housesRes.ok) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 rounded-2xl border border-destructive/30 bg-destructive-soft mt-6 font-sans animate-enter">
        <div className="size-12 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-heading font-display">
            {t("errorTitle")}
          </h2>
          <p className="text-xs text-destructive">{housesRes.error}</p>
        </div>
        <Button asChild size="sm" className="min-h-11 px-4 text-xs">
          <Link href="/admin/houses">
            <RefreshCw className="size-3.5 mr-1.5" />
            {t("retry")}
          </Link>
        </Button>
      </div>
    );
  }

  const housesData = housesRes.value;
  const neighborhoods = neighRes.ok ? neighRes.value : [];

  return (
    <HousesManagementView
      houses={housesData.houses}
      neighborhoods={neighborhoods}
      defaultCommissionBps={housesData.defaultCommissionBps}
      totalHousesCount={housesData.totalHousesCount}
      activeHousesCount={housesData.activeHousesCount}
      totalBalanceOwedCDF={housesData.totalBalanceOwedCDF}
      pendingReviews={pendingReviews}
      initialQuery={query}
    />
  );
}
