import "server-only";

import { err, ok, type Result } from "@/lib/result";
import {
  getHouseSettlementDetail,
  getPartnerSettlementsData,
  recordSettlementSupportReport,
  type GetPartnerSettlementsParams,
} from "@/dal";
import type { PartnerSettlementsPageData } from "@/types/partner-settlements";

export async function getHousePortalSettlements(houseId: string) {
  try {
    if (!houseId) return err("Identifiant du pressing requis");
    const data = await getHouseSettlementDetail(houseId);
    return ok(data);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors du chargement des règlements");
  }
}

export async function getPartnerSettlements(
  params: GetPartnerSettlementsParams
): Promise<Result<PartnerSettlementsPageData>> {
  try {
    if (!params.houseId) return err("Identifiant du pressing requis");
    const data = await getPartnerSettlementsData(params);
    return ok(data);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Erreur lors du chargement des revenus et versements"
    );
  }
}

export interface ReportSettlementIssueParams {
  houseId: string;
  userId: string;
  reference: string;
  targetType: "order" | "settlement";
  orderId?: string;
  settlementId?: string;
  reasonCategory: string;
  message: string;
}

export async function reportPartnerSettlementIssue(
  params: ReportSettlementIssueParams
): Promise<Result<{ ticketReference: string }>> {
  try {
    if (!params.houseId || !params.userId) {
      return err("Session de pressing non authentifiée");
    }
    if (!params.message?.trim() || params.message.trim().length < 5) {
      return err("Veuillez fournir une description détaillée (au moins 5 caractères)");
    }

    const cleanRef = params.reference.replace(/[^a-zA-Z0-9_-]/g, "");
    const ticketReference = `TIC-${params.targetType === "order" ? "ORD" : "VER"}-${cleanRef.slice(-6)}-${Date.now().toString(36).toUpperCase()}`;

    const reportRes = await recordSettlementSupportReport({
      houseId: params.houseId,
      userId: params.userId,
      ticketReference,
      reference: params.reference,
      targetType: params.targetType,
      orderId: params.orderId,
      settlementId: params.settlementId,
      reasonCategory: params.reasonCategory,
      message: params.message.trim(),
    });

    if (!reportRes.ok) {
      return err(reportRes.error);
    }

    return ok({ ticketReference });
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Échec de l'envoi du signalement au support"
    );
  }
}
