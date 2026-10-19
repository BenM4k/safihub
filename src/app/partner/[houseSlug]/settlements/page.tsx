import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { guardHouseRoute } from "@/services/auth";
import { getPartnerSettlements } from "@/services/house";
import { PageHeader } from "@/components/shared";
import { SettlementsView } from "@/components/house/settlements/settlements-view";
import type { PeriodType } from "@/types/partner-settlements";

interface PageProps {
  params: Promise<{ houseSlug: string }>;
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}

export default async function PartnerSettlementsPage({
  params,
  searchParams,
}: PageProps) {
  const { houseSlug } = await params;
  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
  }

  const queryParams = await searchParams;
  const t = await getTranslations("house.settlements");

  const validPeriods: PeriodType[] = ["week", "month", "last30", "custom"];
  const period: PeriodType =
    queryParams.period && validPeriods.includes(queryParams.period as PeriodType)
      ? (queryParams.period as PeriodType)
      : "month";

  const settlementsRes = await getPartnerSettlements({
    houseId,
    period,
    from: queryParams.from,
    to: queryParams.to,
  });

  if (!settlementsRes.ok) {
    return (
      <div className="p-6 bg-destructive-light text-destructive-base rounded-2xl border border-destructive-base/30 text-sm">
        <h2 className="font-bold text-base">{t("errorTitle")}</h2>
        <p className="mt-1">{settlementsRes.error}</p>
      </div>
    );
  }

  const data = settlementsRes.value;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={`${t("subtitle")} — ${data.houseName}`}
      />

      <SettlementsView data={data} />
    </div>
  );
}
