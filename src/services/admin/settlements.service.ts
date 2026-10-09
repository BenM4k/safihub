import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  getHouseSettlementsOverview,
  settleHouseBalance,
  getCourierSettlementsOverview,
  settleCourierPay,
} from "@/dal";

export async function getAdminHouseSettlements() {
  try {
    const data = await getHouseSettlementsOverview();
    return ok(data);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors du chargement des règlements de pressings");
  }
}

export async function settleAdminHouse(params: {
  houseId: string;
  amount: number;
  currency?: "CDF" | "USD";
  reference?: string;
  adminId: string;
}): Promise<Result<{ settlementId?: string; newBalanceCDF: number }>> {
  try {
    if (!params.houseId) return err("Pressing requis");
    if (params.amount <= 0) return err("Le montant du règlement doit être strictement positif");

    const res = await settleHouseBalance({
      houseId: params.houseId,
      amount: params.amount,
      currency: params.currency ?? "CDF",
      reference: params.reference,
      adminId: params.adminId,
    });

    if (!res.ok) return err(res.error || "Échec du règlement du pressing");
    return ok({ settlementId: res.settlementId, newBalanceCDF: res.newBalanceCDF });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors du règlement du pressing");
  }
}

export async function getAdminCourierSettlements() {
  try {
    const data = await getCourierSettlementsOverview();
    return ok(data);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors du chargement des règlements de coursiers");
  }
}

export async function settleAdminCourier(params: {
  courierId: string;
  amount: number;
  currency?: "CDF" | "USD";
  reference?: string;
  adminId: string;
}): Promise<Result<{ settlementId?: string; newBalanceCDF: number }>> {
  try {
    if (!params.courierId) return err("Coursier requis");
    if (params.amount <= 0) return err("Le montant de la rémunération doit être supérieur à zéro");

    const res = await settleCourierPay({
      courierId: params.courierId,
      amount: params.amount,
      currency: params.currency ?? "CDF",
      reference: params.reference,
      adminId: params.adminId,
    });

    if (!res.ok) return err("Échec du règlement du coursier");
    return ok({ settlementId: res.settlementId, newBalanceCDF: res.newBalanceCDF });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors du règlement du coursier");
  }
}
