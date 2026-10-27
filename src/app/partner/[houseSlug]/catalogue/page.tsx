import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { guardHouseRoute } from "@/services/auth";
import { getHouseById } from "@/dal";
import {
  getHouseCatalogue,
  listHouseCatalogueRequests,
} from "@/services/house";
import { CatalogueView } from "@/components/house/catalogue/catalogue-view";
import { RequestItemModal } from "@/components/house/catalogue/request-item-modal";
import { ItemRequestsList } from "@/components/house/catalogue/item-requests-list";

interface PageProps {
  params: Promise<{ houseSlug: string }>;
}

export default async function PartnerCataloguePage({ params }: PageProps) {
  const { houseSlug } = await params;
  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
  }

  const t = await getTranslations("house.catalogue");

  const [catalogueRes, requestsRes, house] = await Promise.all([
    getHouseCatalogue(houseId),
    listHouseCatalogueRequests(houseId),
    getHouseById(houseId),
  ]);

  const items = catalogueRes.ok ? catalogueRes.value : [];
  const requests = requestsRes.ok ? requestsRes.value : [];
  const commissionBps = house?.commissionBps ?? 2000;

  return (
    <div className="space-y-5 sm:space-y-6 pb-24 sm:pb-28">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-heading tracking-tight font-display">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>

        {/* Secondary Action: Demander un nouvel article */}
        <RequestItemModal houseId={houseId} />
      </div>

      {/* Catalogue Grid View */}
      <CatalogueView
        items={items}
        houseId={houseId}
        houseSlug={houseSlug}
        commissionBps={commissionBps}
      />

      {/* Previously requested items */}
      <ItemRequestsList requests={requests} />
    </div>
  );
}
