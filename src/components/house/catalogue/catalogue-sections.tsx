import { getHouseById } from "@/dal";
import { getHouseCatalogue, listHouseCatalogueRequests } from "@/services/house";
import { CatalogueView } from "./catalogue-view";
import { ItemRequestsList } from "./item-requests-list";

export async function HouseCatalogueSection({
  houseId,
  houseSlug,
}: {
  houseId: string;
  houseSlug: string;
}) {
  const [catalogueRes, house] = await Promise.all([
    getHouseCatalogue(houseId),
    getHouseById(houseId),
  ]);

  const items = catalogueRes.ok ? catalogueRes.value : [];
  const commissionBps = house?.commissionBps ?? 2000;

  return (
    <CatalogueView
      items={items}
      houseId={houseId}
      houseSlug={houseSlug}
      commissionBps={commissionBps}
    />
  );
}

export async function HouseItemRequestsSection({
  houseId,
}: {
  houseId: string;
}) {
  const requestsRes = await listHouseCatalogueRequests(houseId);
  const requests = requestsRes.ok ? requestsRes.value : [];

  return <ItemRequestsList requests={requests} />;
}

