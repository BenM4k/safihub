import { Suspense } from "react";
import { notFound } from "next/navigation";
import { guardHouseRoute } from "@/services/auth";
import { getHouseCoverageData } from "@/services/house";
import { CoverageManager } from "@/components/house/coverage/coverage-manager";
import { CoverageSkeleton } from "@/components/house/coverage/coverage-skeleton";

interface PageProps {
  params: Promise<{ houseSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { houseSlug } = await params;
  return {
    title: `Zone de couverture — SafiHub Partner (${houseSlug})`,
    description: "Gérez les quartiers desservis par votre pressing et configurez votre périmètre de livraison.",
  };
}

async function PartnerCoverageContent({ params }: PageProps) {
  const { houseSlug } = await params;
  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
  }

  const coverageRes = await getHouseCoverageData(houseId);

  if (!coverageRes.ok) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-medium text-destructive font-sans">
        {coverageRes.error}
      </div>
    );
  }

  return <CoverageManager coverageData={coverageRes.value} />;
}

export default function PartnerCoveragePage({ params }: PageProps) {
  return (
    <div className="space-y-8 sm:space-y-10 pb-24 sm:pb-28 max-w-6xl font-sans">
      <Suspense fallback={<CoverageSkeleton />}>
        <PartnerCoverageContent params={params} />
      </Suspense>
    </div>
  );
}
