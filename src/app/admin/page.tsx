import { getTranslations } from "next-intl/server";
import { getAdminMetricsSummary } from "@/services/admin";
import { MetricsGrid } from "@/components/admin/dashboard/metrics-grid";
import { QuickActions } from "@/components/admin/dashboard/quick-actions";

export default async function AdminPage() {
  const t = await getTranslations("admin.dashboard");
  const metricsResult = await getAdminMetricsSummary();

  const metrics = metricsResult.ok
    ? metricsResult.value
    : {
        totalOrders: 0,
        ordersByStatus: {},
        ordersPendingAcceptance: 0,
        activeDisputes: 0,
        pendingCoverageRequests: 0,
        activeHousesCount: 0,
        activeCouriersCount: 0,
        totalCashCollectedCDF: 0,
        unassignedMissionsCount: 0,
      };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      <MetricsGrid metrics={metrics} />
      <QuickActions />
    </div>
  );
}
