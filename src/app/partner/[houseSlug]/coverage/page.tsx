import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
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

  const t = await getTranslations("house.coverage");
  const coverageRes = await getHouseCoverageData(houseId);

  if (!coverageRes.ok) {
    return (
      <div className="p-6 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-sm">
        {coverageRes.error}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t("subtitle")}
        </p>
      </div>

      <CoverageManager coverageData={coverageRes.value} />
    </div>
  );
}
