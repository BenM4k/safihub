import { Suspense } from "react";
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
import {
  CoverageDemandSkeleton,
  CoverageDistanceSkeleton,
  CoverageNeighborhoodsSkeleton,
} from "./admin-coverage-skeleton";

async function CoverageSettingsSection() {
  const [t, settingsRes] = await Promise.all([
    getTranslations("admin.coverage"),
    getAdminPlatformSettings(),
  ]);

  if (!settingsRes.ok) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="size-4" />
        <AlertTitle>{t("settingsLoadError")}</AlertTitle>
        <AlertDescription className="text-xs">
          {t("settingsLoadErrorDesc")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <DistanceLimitForm currentLimit={settingsRes.value.maxCoverageDistanceLevel} />
  );
}

async function CoverageNeighborhoodsSection() {
  const [t, neighRes] = await Promise.all([
    getTranslations("admin.coverage"),
    listAdminNeighborhoods(),
  ]);

  if (!neighRes.ok) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>{t("errorTitle")}</AlertTitle>
          <AlertDescription className="text-xs">
            {t("errorDescription")}
          </AlertDescription>
        </Alert>
        <NeighborhoodStatusTable neighborhoods={[]} />
      </div>
    );
  }

  return <NeighborhoodStatusTable neighborhoods={neighRes.value} />;
}

async function CoverageDemandSection() {
  const [t, demandRes] = await Promise.all([
    getTranslations("admin.coverage"),
    listAdminCoverageDemand(),
  ]);

  if (!demandRes.ok) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>{t("errorTitle")}</AlertTitle>
          <AlertDescription className="text-xs">
            {t("errorDescription")}
          </AlertDescription>
        </Alert>
        <CoverageDemandTable demand={[]} />
      </div>
    );
  }

  return <CoverageDemandTable demand={demandRes.value} />;
}

export function CoverageStreamContent() {
  return (
    <div className="space-y-6 animate-enter-fast">
      <Suspense fallback={<CoverageDistanceSkeleton />}>
        <CoverageSettingsSection />
      </Suspense>

      <Suspense fallback={<CoverageNeighborhoodsSkeleton />}>
        <CoverageNeighborhoodsSection />
      </Suspense>

      <Suspense fallback={<CoverageDemandSkeleton />}>
        <CoverageDemandSection />
      </Suspense>
    </div>
  );
}
