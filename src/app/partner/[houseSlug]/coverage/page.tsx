import { notFound } from "next/navigation";
import { guardHouseRoute } from "@/services/auth";
import { getHouseCoverageData } from "@/services/house";
import { CoverageManager } from "@/components/house/coverage/coverage-manager";

interface PageProps {
  params: Promise<{ houseSlug: string }>;
}

export default async function PartnerCoveragePage({ params }: PageProps) {
  const { houseSlug } = await params;
  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
  }

  const coverageRes = await getHouseCoverageData(houseId);

  if (!coverageRes.ok) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-medium text-destructive">
        {coverageRes.error}
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10 pb-24 sm:pb-28 max-w-6xl">
      <CoverageManager coverageData={coverageRes.value} />
    </div>
  );
}
