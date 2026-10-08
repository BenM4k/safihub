import { ReactNode } from "react";
import { guardHouseRoute } from "@/services/auth";
import { getHouseById, getHouses } from "@/dal";
import { HouseHeader } from "@/components/house/house-header";
import { HouseNavTabs } from "@/components/house/house-nav-tabs";

export default async function HouseLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authCtx = await guardHouseRoute();
  let houseId = authCtx.houseId || authCtx.primaryHouseId;

  // Fallback for admin visiting house portal if no specific house assigned
  if (!houseId && authCtx.isAdminOverride) {
    const allHouses = await getHouses();
    if (allHouses.length > 0) {
      houseId = allHouses[0].id;
    }
  }

  const house = houseId ? await getHouseById(houseId) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <HouseHeader houseName={house?.name} isPaused={house?.isPaused} />
      <HouseNavTabs />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
