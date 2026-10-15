import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  getHouseSettlementsOverview,
  settleHouseBalance,
  getCourierSettlementsOverview,
  settleCourierPay,
  getSettlementHistoryLogs,
  reverseLedgerEntry,
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
  method?: "mobile_money" | "bank" | "cash";
  period?: string;
  note?: string;
  adminId: string;
}): Promise<Result<{ settlementId?: string; newBalanceCDF: number }>> {
  try {
    if (!params.houseId) return err("Pressing requis");
    if (params.amount <= 0) return err("Le montant du règlement doit être strictement positif");

    if (params.method && params.method !== "cash" && !params.reference?.trim()) {
      return err("Une référence ou un numéro de transaction est requis pour les règlements électroniques ou bancaires");
    }

    // Verify amount does not exceed current pending balance
    const overview = await getHouseSettlementsOverview();
    const house = overview.houses.find((h) => h.houseId === params.houseId);
    if (!house) return err("Pressing introuvable");
    if (params.amount > house.balanceOwedCDF) {
      return err(`Le montant saisi (${params.amount.toLocaleString()} CDF) ne peut pas dépasser le solde restant dû (${house.balanceOwedCDF.toLocaleString()} CDF)`);
    }

    const res = await settleHouseBalance({
      houseId: params.houseId,
      amount: params.amount,
      currency: params.currency ?? "CDF",
      reference: params.reference?.trim(),
      method: params.method,
      period: params.period,
      note: params.note?.trim(),
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
  method?: "mobile_money" | "bank" | "cash";
  period?: string;
  note?: string;
  adminId: string;
}): Promise<Result<{ settlementId?: string; newBalanceCDF: number }>> {
  try {
    if (!params.courierId) return err("Coursier requis");
    if (params.amount <= 0) return err("Le montant de la rémunération doit être supérieur à zéro");

    if (params.method && params.method !== "cash" && !params.reference?.trim()) {
      return err("Une référence ou un numéro de transaction est requis pour les paiements électroniques ou bancaires");
    }

    // Verify amount does not exceed current pending balance
    const overview = await getCourierSettlementsOverview();
    const courier = overview.couriers.find((c) => c.courierId === params.courierId);
    if (!courier) return err("Coursier introuvable");
    if (params.amount > courier.balanceOwedCDF) {
      return err(`Le montant saisi (${params.amount.toLocaleString()} CDF) ne peut pas dépasser le solde restant dû (${courier.balanceOwedCDF.toLocaleString()} CDF)`);
    }

    const res = await settleCourierPay({
      courierId: params.courierId,
      amount: params.amount,
      currency: params.currency ?? "CDF",
      reference: params.reference?.trim(),
      method: params.method,
      period: params.period,
      note: params.note?.trim(),
      adminId: params.adminId,
    });

    if (!res.ok) return err("Échec du règlement du coursier");
    return ok({ settlementId: res.settlementId, newBalanceCDF: res.newBalanceCDF });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors du règlement du coursier");
  }
}

export async function getAdminSettlementHistory(limit = 100) {
  try {
    const data = await getSettlementHistoryLogs(limit);
    return ok(data);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Erreur lors du chargement de l'historique des règlements"
    );
  }
}

export async function reverseAdminSettlement(params: {
  settlementId: string;
  reason: string;
  adminId: string;
}) {
  try {
    if (!params.settlementId) return err("Identifiant de règlement requis");
    if (!params.reason?.trim() || params.reason.trim().length < 3) {
      return err("Un motif d'annulation explicite (au moins 3 caractères) est obligatoire");
    }

    const res = await reverseLedgerEntry({
      entryId: params.settlementId,
      reason: params.reason.trim(),
      reversedBy: params.adminId,
    });

    if (!res.ok) return err(res.error || "Échec de l'annulation du règlement");
    return ok(res);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors de l'annulation du règlement");
  }
}
