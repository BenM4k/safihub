import { guardAdminRoute } from "@/services/auth";
import { listAdminHousesEnriched, listAdminNeighborhoods } from "@/services/admin";
import { listAdminPendingHouseReviews } from "@/dal";
import { HousesManagementView } from "@/components/admin/houses/houses-management-view";

export default async function AdminHousesPage() {
  await guardAdminRoute();

  const [housesRes, neighRes, pendingReviews] = await Promise.all([
    listAdminHousesEnriched(),
    listAdminNeighborhoods(),
    listAdminPendingHouseReviews(),
  ]);

  if (!housesRes.ok) {
    throw new Error(housesRes.error || "Failed to load partner houses");
  }

  const housesData = housesRes.value;
  const neighborhoods = neighRes.ok ? neighRes.value : [];

  return (
    <HousesManagementView
      houses={housesData.houses}
      neighborhoods={neighborhoods}
      defaultCommissionBps={housesData.defaultCommissionBps}
      totalHousesCount={housesData.totalHousesCount}
      activeHousesCount={housesData.activeHousesCount}
      totalBalanceOwedCDF={housesData.totalBalanceOwedCDF}
      pendingReviews={pendingReviews}
    />
  );
}
