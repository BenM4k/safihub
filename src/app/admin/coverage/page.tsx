import { getTranslations } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
import { guardAdminRoute } from "@/services/auth";
import {
  getAdminPlatformSettings,
  listAdminCoverageDemand,
  listAdminNeighborhoods,
} from "@/services/admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DistanceLimitForm } from "@/components/admin/coverage/distance-limit-form";
import { NeighborhoodStatusTable } from "@/components/admin/coverage/neighborhood-status-table";
import { CoverageDemandTable } from "@/components/admin/coverage/coverage-demand-table";

export default async function AdminCoveragePage() {
  await guardAdminRoute();
  const t = await getTranslations("admin.coverage");

  const [settingsRes, neighRes, demandRes] = await Promise.all([
    getAdminPlatformSettings(),
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

      {settingsRes.ok ? (
        <DistanceLimitForm currentLimit={settingsRes.value.maxCoverageDistanceLevel} />
      ) : (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>{t("settingsLoadError")}</AlertTitle>
          <AlertDescription className="text-xs">
            {t("settingsLoadErrorDesc")}
          </AlertDescription>
        </Alert>
      )}
      <NeighborhoodStatusTable neighborhoods={neighborhoods} />
      <CoverageDemandTable demand={demand} />
    </div>
  );
}
