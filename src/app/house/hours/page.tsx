import { guardHouseRoute } from "@/services/auth";
import { getHouses } from "@/dal";
import { getHouseHoursData } from "@/services/house";
import { HoursEditor } from "@/components/house/hours/hours-editor";
import { ClosuresManager } from "@/components/house/hours/closures-manager";
import { getTranslations } from "next-intl/server";

export default async function HouseHoursPage() {
  const authCtx = await guardHouseRoute();
  let houseId = authCtx.houseId || authCtx.primaryHouseId;

  if (!houseId && authCtx.isAdminOverride) {
    const allHouses = await getHouses();
    if (allHouses.length > 0) {
      houseId = allHouses[0].id;
    }
  }

  if (!houseId) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
        Aucun pressing assigné à ce compte.
      </div>
    );
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
