import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { guardHouseRoute } from "@/services/auth";
import { RequestItemModal } from "@/components/house/catalogue/request-item-modal";
import {
  HouseCatalogueSection,
  HouseItemRequestsSection,
} from "@/components/house/catalogue/catalogue-sections";
import {
  PartnerCatalogueSkeleton,
  CatalogueGridSkeleton,
  ItemRequestsSkeleton,
} from "@/components/house/catalogue/partner-catalogue-skeleton";

interface PageProps {
  params: Promise<{ houseSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { houseSlug } = await params;
  const t = await getTranslations("house.catalogue");
  return {
    title: t("metaTitle", { houseSlug }),
    description: t("metaDescription"),
  };
}

async function PartnerCatalogueContent({ params }: PageProps) {
  const { houseSlug } = await params;
  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
  }

  const t = await getTranslations("house.catalogue");

  return (
    <>
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
      <Suspense fallback={<CatalogueGridSkeleton />}>
        <HouseCatalogueSection houseId={houseId} houseSlug={houseSlug} />
      </Suspense>

      {/* Previously requested items */}
      <Suspense fallback={<ItemRequestsSkeleton />}>
        <HouseItemRequestsSection houseId={houseId} />
      </Suspense>
    </>
  );
}

export default function PartnerCataloguePage({ params }: PageProps) {
  return (
    <div className="space-y-6 sm:space-y-8 pb-24 sm:pb-28 font-sans">
      <Suspense fallback={<PartnerCatalogueSkeleton />}>
        <PartnerCatalogueContent params={params} />
      </Suspense>
    </div>
  );
}
