import { notFound } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { guardHouseRoute } from "@/services/auth";
import { getPartnerSettlements } from "@/services/house";
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
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3 font-sans">
        <AlertCircle className="size-5 shrink-0 mt-0.5 text-destructive" />
        <div>
          <h2 className="font-bold text-base mb-1 font-display">{t("errorTitle")}</h2>
          <p className="text-xs leading-relaxed">{settlementsRes.error}</p>
        </div>
      </div>
    );
  }

  const data = settlementsRes.value;

  return (
    <div className="space-y-6 sm:space-y-8 pb-24 sm:pb-28 font-sans">
      <div className="border-b border-border/60 pb-5">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-heading font-display tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
          {t("subtitle")} — {data.houseName}
        </p>
      </div>

      <SettlementsView data={data} />
    </div>
  );
}
