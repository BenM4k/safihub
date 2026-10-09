import { getTranslations } from "next-intl/server";
import { getAdminHouseSettlements, getAdminCourierSettlements } from "@/services/admin";
import { HousesSettlementsTable } from "@/components/admin/settlements/houses-settlements-table";
import { CouriersSettlementsTable } from "@/components/admin/settlements/couriers-settlements-table";
import { Building2, Bike } from "lucide-react";

export default async function AdminSettlementsPage() {
  const t = await getTranslations("admin.settlements");

  const [housesResult, couriersResult] = await Promise.all([
    getAdminHouseSettlements(),
    getAdminCourierSettlements(),
  ]);

  const housesData = housesResult.ok
    ? housesResult.value
    : { houses: [], totalOwedToHousesCDF: 0 };

  const couriersData = couriersResult.ok
    ? couriersResult.value
    : { couriers: [], totalOwedToCouriersCDF: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">{t("housesTab")}</p>
            <p className="text-xl font-black text-heading mt-1">
              {housesData.totalOwedToHousesCDF.toLocaleString()} CDF
            </p>
            <p className="text-2xs text-muted-foreground mt-0.5">{t("balanceOwed")}</p>
          </div>
          <div className="size-10 rounded-lg flex items-center justify-center border text-violet-600 bg-violet-50 border-violet-200">
            <Building2 className="size-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">{t("couriersTab")}</p>
            <p className="text-xl font-black text-heading mt-1">
              {couriersData.totalOwedToCouriersCDF.toLocaleString()} CDF
            </p>
            <p className="text-2xs text-muted-foreground mt-0.5">{t("balanceOwed")}</p>
          </div>
          <div className="size-10 rounded-lg flex items-center justify-center border text-emerald-600 bg-emerald-50 border-emerald-200">
            <Bike className="size-5" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-heading flex items-center gap-2">
          <Building2 className="size-4 text-violet-600" />
          {t("housesTab")}
        </h2>
        <HousesSettlementsTable houses={housesData.houses} />
      </div>

      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-bold text-heading flex items-center gap-2">
          <Bike className="size-4 text-emerald-600" />
          {t("couriersTab")}
        </h2>
        <CouriersSettlementsTable couriers={couriersData.couriers} />
      </div>
    </div>
  );
}
