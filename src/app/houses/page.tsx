import { Metadata } from "next";
import { Navbar } from "@/components/home/header/navbar";
import { getCurrentUser } from "@/services/auth";
import { getCustomerHousesData } from "@/services/house/customer-search.service";
import { HousesSplitView } from "@/components/houses/houses-split-view";

export const metadata: Metadata = {
  title: "Trouver un Pressing à Bukavu | SafiHub",
  description:
    "Recherchez et comparez les meilleures maisons de pressing à Bukavu par quartier, tarifs et délais de livraison.",
};

interface CustomerHousesPageProps {
  searchParams: Promise<{ neighborhoodId?: string; query?: string }>;
}

export default async function CustomerHousesPage({
  searchParams,
}: CustomerHousesPageProps) {
  const params = await searchParams;
  const [user, pageData] = await Promise.all([
    getCurrentUser(),
    getCustomerHousesData({
      neighborhoodId: params.neighborhoodId,
      query: params.query,
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar variant="solid" user={user} />
      <main className="flex-1 overflow-hidden">
        <HousesSplitView initialData={pageData} />
      </main>
    </div>
  );
}
