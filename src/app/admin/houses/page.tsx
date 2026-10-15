import { listAdminHousesEnriched, listAdminNeighborhoods } from "@/services/admin";
import { HousesManagementView } from "@/components/admin/houses/houses-management-view";

export default async function AdminHousesPage() {
  const [housesRes, neighRes] = await Promise.all([
    listAdminHousesEnriched(),
    listAdminNeighborhoods(),
  ]);

  const housesData = housesRes.ok
    ? housesRes.value
    : {
        houses: [],
        defaultCommissionBps: 2000,
        totalHousesCount: 0,
        activeHousesCount: 0,
        totalBalanceOwedCDF: 0,
      };

  const neighborhoods = neighRes.ok ? neighRes.value : [];

  return (
    <HousesManagementView
      houses={housesData.houses}
      neighborhoods={neighborhoods}
      defaultCommissionBps={housesData.defaultCommissionBps}
      totalHousesCount={housesData.totalHousesCount}
      activeHousesCount={housesData.activeHousesCount}
      totalBalanceOwedCDF={housesData.totalBalanceOwedCDF}
    />
  );
}
