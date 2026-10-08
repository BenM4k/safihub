import { guardHouseRoute } from "@/services/auth";
import { getHouses, getMasterItems, getMasterFabrics } from "@/dal";
import { getHouseSettings } from "@/services/house";
import { GeneralSettingsForm } from "@/components/house/settings/general-settings-form";
import { ExclusionsManager } from "@/components/house/settings/exclusions-manager";
import { getTranslations } from "next-intl/server";

export default async function HouseSettingsPage() {
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

  const t = await getTranslations("house.settings");

  const [settingsRes, masterItems, masterFabrics] = await Promise.all([
    getHouseSettings(houseId),
    getMasterItems(),
    getMasterFabrics(),
  ]);

  if (!settingsRes.ok) {
    return (
      <div className="p-6 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-sm">
        {settingsRes.error}
      </div>
    );
  }

  const { house, exclusions } = settingsRes.value;

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

      {/* General Settings */}
      <GeneralSettingsForm house={house} />

      {/* Exclusions Manager */}
      <ExclusionsManager
        exclusions={exclusions}
        masterItems={masterItems}
        masterFabrics={masterFabrics}
        houseId={houseId}
      />
    </div>
  );
}
