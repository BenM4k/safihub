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
      <div className="p-6 bg-destructive-soft text-destructive rounded-2xl border border-destructive/20 text-sm">
        {coverageRes.error}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <CoverageManager coverageData={coverageRes.value} />
    </div>
  );
}
