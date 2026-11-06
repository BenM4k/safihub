import { Suspense } from "react";
import type { Metadata } from "next";
import { SessionNavbar } from "@/components/home/header/session-navbar";
import { getCachedCustomerHousesData } from "@/lib/cached-data";
import { HousesSplitView } from "@/components/houses/houses-split-view";
import { HousesSearchSkeleton } from "@/components/houses/houses-search-skeleton";
import type { CustomerHouseSearchFilter } from "@/services/house/customer-search.service";
import {
  latLngSchema,
  NEARBY_RADIUS_OPTIONS_KM,
  type NearbyRadiusKm,
} from "@/lib/validations/location";

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
  const rawLat = parseOptionalNumber(getFirstParam(params.lat));
  const rawLng = parseOptionalNumber(getFirstParam(params.lng));
  const rawRadiusKm = parseOptionalNumber(getFirstParam(params.radiusKm));

  let lat: number | undefined;
  let lng: number | undefined;
  let radiusKm: number | undefined;

  if (
    rawLat !== undefined &&
    rawLng !== undefined &&
    rawRadiusKm !== undefined
  ) {
    const parsedCoords = latLngSchema.safeParse({ lat: rawLat, lng: rawLng });
    const isSupportedRadius = NEARBY_RADIUS_OPTIONS_KM.includes(
      rawRadiusKm as NearbyRadiusKm
    );
    if (parsedCoords.success && isSupportedRadius) {
      lat = Number(rawLat.toFixed(3));
      lng = Number(rawLng.toFixed(3));
      radiusKm = rawRadiusKm;
    }
  }
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
