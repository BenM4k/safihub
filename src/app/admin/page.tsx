import { Suspense } from "react";
import { guardAdminRoute } from "@/services/auth";
import { preloadAdminDashboard } from "@/app/admin/_data";
import { DashboardHero } from "@/components/admin/dashboard/dashboard-hero";
import { DashboardMetricsStream } from "@/components/admin/dashboard/dashboard-metrics-stream";
import { DashboardOperationsSection } from "@/components/admin/dashboard/operations";
import { QuickActions } from "@/components/admin/dashboard/quick-actions";
import {
  DashboardMetricsSkeleton,
  DashboardOperationsSkeleton,
} from "@/components/admin/dashboard/dashboard-skeleton";

export default async function AdminPage() {
  const authCtx = await guardAdminRoute();
  preloadAdminDashboard();

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Welcome Hero renders immediately in the shell */}
      <div className="animate-enter">
        <DashboardHero userName={authCtx.user?.name} />
      </div>

      {/* 2. Metrics, Urgent Attention & Donut Pilot Scorecard stream independently */}
      <Suspense fallback={<DashboardMetricsSkeleton />}>
        <DashboardMetricsStream />
      </Suspense>

      {/* 3. Live Operations (Recent Orders + Courier Fleet) stream independently */}
      <Suspense fallback={<DashboardOperationsSkeleton />}>
        <DashboardOperationsSection />
      </Suspense>

      {/* 4. Quick Shortcuts render immediately */}
      <div className="animate-enter">
        <QuickActions />
      </div>
    </div>
  );
}
