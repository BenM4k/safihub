import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { guardHouseRoute } from "@/services/auth";
import { getHouseDashboardData } from "@/services/house";
import { AcceptanceQueue } from "@/components/house/dashboard/acceptance-queue";
import { WorkloadMetrics } from "@/components/house/dashboard/workload-metrics";
import { QuickShortcuts } from "@/components/house/dashboard/quick-shortcuts";

interface PageProps {
  params: Promise<{ houseSlug: string }>;
}

export default async function PartnerDashboardPage({ params }: PageProps) {
  const { houseSlug } = await params;
  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
  }

  const t = await getTranslations("house.dashboard");
  const dashboardRes = await getHouseDashboardData(houseId);

  if (!dashboardRes.ok) {
    return (
      <div className="p-6 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-sm">
        {dashboardRes.error}
      </div>
    );
  }

  const metrics = dashboardRes.value;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Orders waiting for acceptance with remaining time */}
      <AcceptanceQueue
        orders={metrics.waitingAcceptanceOrders}
        houseSlug={houseSlug}
      />

      {/* Today's workload metrics & capacity */}
      <WorkloadMetrics metrics={metrics} />

      {/* Quick shortcuts */}
      <QuickShortcuts houseSlug={houseSlug} />
    </div>
  );
}
