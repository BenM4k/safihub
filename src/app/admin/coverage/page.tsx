import { getTranslations } from "next-intl/server";
import { getSettings } from "@/dal";
import { listAdminCoverageDemand, listAdminNeighborhoods } from "@/services/admin";
import { DistanceLimitForm } from "@/components/admin/coverage/distance-limit-form";
import { NeighborhoodStatusTable } from "@/components/admin/coverage/neighborhood-status-table";
import { CoverageDemandTable } from "@/components/admin/coverage/coverage-demand-table";

export default async function AdminCoveragePage() {
  const t = await getTranslations("admin.coverage");

  const [settings, neighRes, demandRes] = await Promise.all([
    getSettings(),
    listAdminNeighborhoods(),
    listAdminCoverageDemand(),
  ]);

  const neighborhoods = neighRes.ok ? neighRes.value : [];
  const demand = demandRes.ok ? demandRes.value : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <DistanceLimitForm currentLimit={settings.maxCoverageDistanceLevel} />
      <NeighborhoodStatusTable neighborhoods={neighborhoods} />
      <CoverageDemandTable demand={demand} />
    </div>
  );
}
