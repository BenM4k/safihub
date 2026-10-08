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

export default async function CustomerHousesPage() {
  const [user, pageData] = await Promise.all([
    getCurrentUser(),
    getCustomerHousesData(),
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
