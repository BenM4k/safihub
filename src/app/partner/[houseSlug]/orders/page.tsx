import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { guardHouseRoute } from "@/services/auth";
import { PartnerOrdersInteractive } from "@/components/house/orders/partner-orders-interactive";
import { PartnerOrdersTabsSection } from "@/components/house/orders/partner-orders-tabs-section";
import { PartnerOrdersFilterBarWrapper } from "@/components/house/orders/partner-orders-filter-bar-wrapper";
import { PartnerOrdersListSection } from "@/components/house/orders/partner-orders-list-section";
import {
  PartnerOrdersPageSkeleton,
  PartnerOrdersSkeleton,
  PartnerOrdersTabsSkeleton,
} from "@/components/house/orders/partner-orders-skeleton";

interface PageProps {
  params: Promise<{ houseSlug: string }>;
  searchParams: Promise<{
    tab?: string;
    search?: string;
    date?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { houseSlug } = await params;
  return {
    title: `Commandes — SafiHub Partner (${houseSlug})`,
    description: "Gestion des commandes de pressing, acceptation, lavage et livraison.",
  };
}

async function PartnerOrdersPageContent({
  params,
  searchParams,
}: PageProps) {
  const { houseSlug } = await params;

  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
  }

  const t = await getTranslations("house.orders");

  return (
    <>
      {/* Page Title Shell */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-heading font-display tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Donut interactive client wrapper */}
      <PartnerOrdersInteractive houseSlug={houseSlug}>
        {/* Stage Tabs with live count badges */}
        <Suspense fallback={<PartnerOrdersTabsSkeleton />}>
          <PartnerOrdersTabsSection
            houseId={houseId}
            searchParams={searchParams}
          />
        </Suspense>

        {/* Filter Bar with URL filters and Search button */}
        <PartnerOrdersFilterBarWrapper />

        {/* Orders List / Table & Pagination */}
        <Suspense fallback={<PartnerOrdersSkeleton />}>
          <PartnerOrdersListSection
            houseId={houseId}
            searchParams={searchParams}
          />
        </Suspense>
      </PartnerOrdersInteractive>
    </>
  );
}

export default function PartnerOrdersPage({
  params,
  searchParams,
}: PageProps) {
  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      <Suspense fallback={<PartnerOrdersPageSkeleton />}>
        <PartnerOrdersPageContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
