import { getTranslations } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
import {
  getAdminPlatformSettings,
  listAdminCoverageDemand,
  listAdminNeighborhoods,
} from "@/services/admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DistanceLimitForm } from "./distance-limit-form";
import { NeighborhoodStatusTable } from "./neighborhood-status-table";
import { CoverageDemandTable } from "./coverage-demand-table";

export async function CoverageStreamContent() {
  const [t, settingsRes, neighRes, demandRes] = await Promise.all([
    getTranslations("admin.coverage"),
    getAdminPlatformSettings(),
    listAdminNeighborhoods(),
    listAdminCoverageDemand(),
  ]);

  const neighborhoods = neighRes.ok ? neighRes.value : [];
  const demand = demandRes.ok ? demandRes.value : [];

  return (
    <div className="space-y-6 animate-enter-fast">
      {settingsRes.ok ? (
        <DistanceLimitForm
          currentLimit={settingsRes.value.maxCoverageDistanceLevel}
        />
      ) : (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>{t("settingsLoadError")}</AlertTitle>
          <AlertDescription className="text-xs">
            {t("settingsLoadErrorDesc")}
          </AlertDescription>
        </Alert>
      )}

      {(!neighRes.ok || !demandRes.ok) && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>{t("errorTitle")}</AlertTitle>
          <AlertDescription className="text-xs">
            {t("errorDescription")}
          </AlertDescription>
        </Alert>
      )}

      <NeighborhoodStatusTable neighborhoods={neighborhoods} />
      <CoverageDemandTable demand={demand} />
    </div>
  );
}
