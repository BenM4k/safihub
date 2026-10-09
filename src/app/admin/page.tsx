import { getTranslations } from "next-intl/server";
import { getAdminMetricsSummary } from "@/services/admin";
import { MetricsGrid } from "@/components/admin/dashboard/metrics-grid";
import { SuccessCriteriaGrid } from "@/components/admin/dashboard/success-criteria-grid";
import { QuickActions } from "@/components/admin/dashboard/quick-actions";

export default async function AdminPage() {
  const t = await getTranslations("admin.dashboard");
  const metricsResult = await getAdminMetricsSummary();
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

      {!metricsResult.ok ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-destructive">
          {t("metricsError", { error: metricsResult.error })}
        </div>
      ) : (
        <>
          <SuccessCriteriaGrid metrics={metricsResult.value} />
          <MetricsGrid metrics={metricsResult.value} />
        </>
      )}
      <QuickActions />
    </div>
  );
}
