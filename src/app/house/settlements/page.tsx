import { guardHouseRoute } from "@/services/auth";
import { getHouses } from "@/dal";
import { getHousePortalSettlements } from "@/services/house";
import { HouseSettlementSummaryCards } from "@/components/house/settlements/house-settlement-summary-cards";
import { HousePayoutHistoryTable } from "@/components/house/settlements/house-payout-history-table";
import { HouseSettledOrdersTable } from "@/components/house/settlements/house-settled-orders-table";
import { getTranslations } from "next-intl/server";

export default async function HouseSettlementsPage() {
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

  const t = await getTranslations("house.settlements");
  const settlementsRes = await getHousePortalSettlements(houseId);

  if (!settlementsRes.ok) {
    return (
      <div className="p-6 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-sm">
        {settlementsRes.error}
      </div>
    );
  }

  const data = settlementsRes.value;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {t("subtitle")} — {data.name}
        </p>
      </div>

      <HouseSettlementSummaryCards
        balanceOwedCDF={data.balanceOwedCDF}
        totalRevenueCDF={data.totalRevenueCDF}
        totalCommissionCDF={data.totalCommissionCDF}
        totalSettledCDF={data.totalSettledCDF}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HousePayoutHistoryTable payouts={data.settlements} />
        <HouseSettledOrdersTable orders={data.orders} />
      </div>
    </div>
  );
}
