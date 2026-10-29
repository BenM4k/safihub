import { Suspense } from "react";
import type { Metadata } from "next";
import { SessionNavbar } from "@/components/home/header/session-navbar";
import { getCachedCustomerHousesData } from "@/lib/cached-data";
import { HousesSplitView } from "@/components/houses/houses-split-view";
import { HousesSearchSkeleton } from "@/components/houses/houses-search-skeleton";

export const metadata: Metadata = {
  title: "Trouver un Pressing à Bukavu | SafiHub",
  description:
    "Recherchez et comparez les meilleures maisons de pressing à Bukavu par quartier, tarifs et délais de livraison.",
};

interface CustomerHousesPageProps {
  searchParams: Promise<{ neighborhoodId?: string; query?: string }>;
}

async function HousesResultsContent({
  searchParams,
}: CustomerHousesPageProps) {
  const params = await searchParams;
  const pageData = await getCachedCustomerHousesData({
    neighborhoodId: params.neighborhoodId,
    query: params.query,
  });

  return (
    <HousesSplitView
      initialData={pageData}
      initialNeighborhoodId={params.neighborhoodId}
    />
  );
}

export default function CustomerHousesPage({
  searchParams,
}: CustomerHousesPageProps) {
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
