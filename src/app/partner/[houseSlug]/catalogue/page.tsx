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
    <div className="space-y-6 sm:space-y-8 pb-24 sm:pb-28 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-heading font-display tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Secondary Action: Demander un nouvel article */}
        <div className="shrink-0">
          <RequestItemModal houseId={houseId} />
        </div>
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
