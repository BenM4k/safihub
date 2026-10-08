import { guardHouseRoute } from "@/services/auth";
import { getHouses } from "@/dal";
import { getHouseCatalogue, listHouseCatalogueRequests } from "@/services/house";
import { CatalogueTable } from "@/components/house/catalogue/catalogue-table";
import { RequestItemModal } from "@/components/house/catalogue/request-item-modal";
import { ItemRequestsList } from "@/components/house/catalogue/item-requests-list";
import { getTranslations } from "next-intl/server";

export default async function HouseCataloguePage() {
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

  const t = await getTranslations("house.catalogue");

  const [catalogueRes, requestsRes] = await Promise.all([
    getHouseCatalogue(houseId),
    listHouseCatalogueRequests(houseId),
  ]);

  const items = catalogueRes.ok ? catalogueRes.value : [];
  const requests = requestsRes.ok ? requestsRes.value : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t("subtitle")}
          </p>
        </div>

        <RequestItemModal houseId={houseId} />
      </div>

      {/* Catalogue Table */}
      <CatalogueTable items={items} houseId={houseId} />

      {/* Previously requested items */}
      <ItemRequestsList requests={requests} />
    </div>
  );
}
