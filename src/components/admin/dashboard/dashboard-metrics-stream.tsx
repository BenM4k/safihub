import { getTranslations } from "next-intl/server";
import { getCachedAdminMetricsSummary } from "@/app/admin/_data";
import { OperationalAlerts } from "./operational-alerts";
import { PlatformOverview } from "./platform-overview";
import { PilotSuccessSection } from "./pilot-success";

export async function DashboardMetricsStream() {
  const [t, metricsResult] = await Promise.all([
    getTranslations("admin.dashboard"),
    getCachedAdminMetricsSummary(),
  ]);

  if (!metricsResult.ok) {
    return (
      <div className="p-5 bg-destructive-soft border border-destructive/30 rounded-xl text-xs text-destructive shadow-xs animate-enter">
        {t("metricsError", { error: metricsResult.error })}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-enter">
      <OperationalAlerts metrics={metricsResult.value} />
      <PlatformOverview metrics={metricsResult.value} />
      <PilotSuccessSection metrics={metricsResult.value} />
    </div>
  );
}
