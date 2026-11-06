import { Suspense } from "react";
import type { Metadata } from "next";
import { SessionNavbar } from "@/components/home/header/session-navbar";
import { getCachedCustomerHousesData } from "@/lib/cached-data";
import { HousesSplitView } from "@/components/houses/houses-split-view";
import { HousesSearchSkeleton } from "@/components/houses/houses-search-skeleton";
import type { CustomerHouseSearchFilter } from "@/services/house/customer-search.service";

export const metadata: Metadata = {
  title: "Trouver un Pressing à Bukavu | SafiHub",
  description:
    "Recherchez et comparez les meilleures maisons de pressing à Bukavu par quartier, tarifs et délais de livraison.",
};

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>;

function getFirstParam(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

function parseOptionalNumber(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const num = Number(raw);
  return Number.isFinite(num) ? num : undefined;
}

function parseSearchFilter(
  params: Record<string, string | string[] | undefined>
): CustomerHouseSearchFilter {
  const query = getFirstParam(params.query)?.trim() || undefined;
  const neighborhoodId =
    getFirstParam(params.neighborhoodId)?.trim() || undefined;
  const serviceSlug = getFirstParam(params.service)?.trim() || undefined;
  const openNow = getFirstParam(params.openNow) === "1" ? true : undefined;
  const maxTurnaround = parseOptionalNumber(
    getFirstParam(params.maxTurnaround)
  );
  const maxMinOrder = parseOptionalNumber(getFirstParam(params.maxMinOrder));
  const lat = parseOptionalNumber(getFirstParam(params.lat));
  const lng = parseOptionalNumber(getFirstParam(params.lng));
  const radiusKm = parseOptionalNumber(getFirstParam(params.radiusKm));
  const rawSort = getFirstParam(params.sort);
  const sort =
    rawSort === "turnaround" ||
    rawSort === "price" ||
    rawSort === "rating" ||
    rawSort === "recommended"
      ? rawSort
      : undefined;

  return {
    query,
    neighborhoodId,
    serviceSlug,
    openNow,
    maxTurnaround,
    maxMinOrder,
    lat,
    lng,
    radiusKm,
    sort,
  };
}

async function HousesResultsContent({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}) {
  const resolvedParams = await searchParams;
  const filter = parseSearchFilter(resolvedParams);
  const pageData = await getCachedCustomerHousesData(filter);

  return (
    <HousesSplitView
      initialData={pageData}
      initialFilter={filter}
      initialNeighborhoodId={filter.neighborhoodId}
    />
  );
}

export default function CustomerHousesPage({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SessionNavbar variant="solid" />
      <main className="flex-1 overflow-hidden">
        <Suspense fallback={<HousesSearchSkeleton />}>
          <HousesResultsContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
