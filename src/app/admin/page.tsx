import { getTranslations } from "next-intl/server";
import { guardAdminRoute } from "@/services/auth";
import { getAdminMetricsSummary } from "@/services/admin";
import { DashboardHero } from "@/components/admin/dashboard/dashboard-hero";
import { OperationalAlerts } from "@/components/admin/dashboard/operational-alerts";
import { PlatformOverview } from "@/components/admin/dashboard/platform-overview";
import { PilotSuccessSection } from "@/components/admin/dashboard/pilot-success";
import { DashboardOperationsSection } from "@/components/admin/dashboard/operations";
import { QuickActions } from "@/components/admin/dashboard/quick-actions";

export default async function AdminPage() {
  const t = await getTranslations("admin.dashboard");
  const authCtx = await guardAdminRoute();
  const metricsResult = await getAdminMetricsSummary();

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Welcome Header with Date Range & New Order */}
      <DashboardHero userName={authCtx.user?.name} />

      {!metricsResult.ok ? (
        <div className="p-5 bg-destructive/10 border border-destructive/30 rounded-xl text-xs text-destructive shadow-xs">
          {t("metricsError", { error: metricsResult.error })}
        </div>
      ) : (

        <>
          {/* 2. Urgent Attention Section (Dominant Awaiting Acceptance Card + Stat Chips) */}
          <OperationalAlerts metrics={metricsResult.value} />

          {/* 3. Activity Overview (4 KPI Cards with Sparklines & Trend) */}
          <PlatformOverview metrics={metricsResult.value} />

          {/* 4. Pilot Success Centerpiece (Single-Card Collapsible Scorecard) */}
          <PilotSuccessSection metrics={metricsResult.value} />

          {/* 5. Live Operations (Recent Orders Table + Courier Fleet Status) */}
          <DashboardOperationsSection />

          {/* 6. Quick Shortcuts (2x3 Equal Grid) */}
          <QuickActions />
        </>
      )}
    </div>
  );
}
