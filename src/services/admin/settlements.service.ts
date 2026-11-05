import "server-only";
import { err, ok, type Result } from "@/lib/result";
import * as dal from "@/dal";
import { sendWhatsAppBusinessSettlementNotice } from "@/services/whatsapp";

export async function getAdminHouseSettlements() {
  try {
    const data = await dal.getHouseSettlementsOverview();
    return ok(data);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors du chargement des règlements de pressings");
  }
}

export async function settleAdminHouse(params: {
  houseId: string;
  houseName?: string;
  contactPhone?: string;
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

    const res = await dal.settleHouseBalance({
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

    // Non-blocking WhatsApp notification to the partner laundry house
    Promise.resolve()
      .then(async () => {
        let houseName = params.houseName;
        let contactPhone = params.contactPhone;

        if (!contactPhone && "getHouseById" in dal && typeof dal.getHouseById === "function") {
          const house = await dal.getHouseById(params.houseId);
          houseName = houseName || house?.name;
          contactPhone = house?.contactPhone ?? undefined;
        }

        if (contactPhone) {
          await sendWhatsAppBusinessSettlementNotice({
            houseId: params.houseId,
            houseName: houseName || "Pressing Partenaire",
            contactPhone,
            amount: params.amount,
            currency: params.currency ?? "CDF",
            reference: params.reference?.trim() || res.settlementId || "CASH",
            method: params.method,
            period: params.period,
          });
        }
      })
      .catch(() => {});

    return ok({ settlementId: res.settlementId, newBalanceCDF: res.newBalanceCDF });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors du règlement du pressing");
  }
}

export async function getAdminCourierSettlements() {
  try {
    const data = await dal.getCourierSettlementsOverview();
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

    const res = await dal.settleCourierPay({
      courierId: params.courierId,
      amount: params.amount,
      currency: params.currency ?? "CDF",
      reference: params.reference?.trim(),
      method: params.method,
      period: params.period,
      note: params.note?.trim(),
      adminId: params.adminId,
    });

    if (!res.ok) return err(res.error || "Échec du règlement du coursier");
    return ok({ settlementId: res.settlementId, newBalanceCDF: res.newBalanceCDF });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors du règlement du coursier");
  }
}

export async function getAdminSettlementHistory(limit = 100) {
  try {
    const data = await dal.getSettlementHistoryLogs(limit);
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

    const res = await dal.reverseLedgerEntry({
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
