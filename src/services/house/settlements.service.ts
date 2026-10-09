import "server-only";
import { err, ok } from "@/lib/result";
import { getHouseSettlementDetail } from "@/dal";

export async function getHousePortalSettlements(houseId: string) {
  try {
    if (!houseId) return err("Identifiant du pressing requis");
    const data = await getHouseSettlementDetail(houseId);
    return ok(data);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors du chargement des règlements");
  }
}
