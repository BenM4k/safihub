import "server-only";

import { err, ok, type Result } from "@/lib/result";
import {
  getHouseSettlementDetail,
  getPartnerSettlementsData,
  type GetPartnerSettlementsParams,
} from "@/dal";
import type { PartnerSettlementsPageData } from "@/types/partner-settlements";
import { db, schema } from "@/dal/db";

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

    // If target is order and orderId provided, record dispute
    if (params.targetType === "order" && params.orderId) {
      await db.insert(schema.disputes).values({
        id: crypto.randomUUID(),
        orderId: params.orderId,
        openedBy: params.userId,
        type: "payment",
        description: `[Ticket ${ticketReference}] Catégorie: ${params.reasonCategory}. Message: ${params.message.trim()}`,
        status: "open",
      });
    }

    // Insert audit notification for support
    await db.insert(schema.notifications).values({
      userId: params.userId,
      channel: "in_app",
      templateKey: "partner_settlement_issue_reported",
      locale: "fr",
      title: `Signalement ${ticketReference} reçu`,
      body: `Votre signalement concernant la référence ${params.reference} a été transmis à l'équipe support SafiHub. Réf ticket : ${ticketReference}`,
      status: "pending",
    });

    return ok({ ticketReference });
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Échec de l'envoi du signalement au support"
    );
  }
}
