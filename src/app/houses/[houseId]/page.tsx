import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Navbar } from "@/components/home/header/navbar";
import { getCurrentUser } from "@/services/auth";
import { getCustomerHouseProfile } from "@/services/house";
import { HouseCatalogueView } from "@/components/houses/detail/house-catalogue-view";

interface HouseDetailPageProps {
  params: Promise<{ houseId: string }>;
}

export async function generateMetadata({
  params,
}: HouseDetailPageProps): Promise<Metadata> {
  const { houseId } = await params;
  const res = await getCustomerHouseProfile(houseId);
  if (!res.ok) {
    return { title: "Pressing introuvable | SafiHub" };
  }
  return {
    title: `${res.value.house.name} - Services & Tarifs | SafiHub Bukavu`,
    description: `Consultez les tarifs de pressing, lavage et repassage de ${res.value.house.name} à Bukavu.`,
  };
}

export default async function CustomerHouseDetailPage({
  params,
}: HouseDetailPageProps) {
  const { houseId } = await params;
  const [user, profileRes] = await Promise.all([
    getCurrentUser(),
    getCustomerHouseProfile(houseId),
  ]);

  if (!profileRes.ok) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar variant="solid" user={user} />
      <main className="flex-1">
        <HouseCatalogueView data={profileRes.value} />
      </main>
    </div>
  );
}
