import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { guardHouseRoute } from "@/services/auth";
import { getHouseHoursData } from "@/services/house";
import { HoursEditor } from "@/components/house/hours/hours-editor";
import { ClosuresManager } from "@/components/house/hours/closures-manager";

interface PageProps {
  params: Promise<{ houseSlug: string }>;
}

export default async function PartnerHoursPage({ params }: PageProps) {
  const { houseSlug } = await params;
  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
  }

  const t = await getTranslations("house.hours");
  const hoursDataRes = await getHouseHoursData(houseId);

  const hours = hoursDataRes.ok ? hoursDataRes.value.hours : [];
  const closures = hoursDataRes.ok ? hoursDataRes.value.closures : [];

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

      {/* Weekly schedule editor */}
      <HoursEditor initialHours={hours} houseId={houseId} />

      {/* Temporary closures manager */}
      <ClosuresManager closures={closures} houseId={houseId} />
    </div>
  );
}
