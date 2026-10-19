"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireHouseAccess } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import { reportPartnerSettlementIssue } from "@/services/house/settlements.service";

const reportIssueSchema = z.object({
  houseSlug: z.string().min(1, "Slug pressing requis"),
  reference: z.string().min(1, "Référence requise"),
  targetType: z.enum(["order", "settlement"]),
  orderId: z.string().uuid().optional(),
  settlementId: z.string().uuid().optional(),
  reasonCategory: z.string().min(1, "Catégorie requise"),
  message: z.string().min(5, "Description détaillée requise (au moins 5 caractères)"),
});

export type ReportPartnerSettlementIssueInput = z.infer<typeof reportIssueSchema>;

export async function reportPartnerSettlementIssueAction(
  input: ReportPartnerSettlementIssueInput
): Promise<Result<{ ticketReference: string }>> {
  const parsed = reportIssueSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message || "Paramètres invalides");
  }

  const { houseSlug, reference, targetType, orderId, settlementId, reasonCategory, message } =
    parsed.data;

  const authRes = await requireHouseAccess({ houseSlug });
  if (!authRes.ok) return authRes;

  const houseId = authRes.value.houseId;
  if (!houseId) {
    return err("Aucun atelier sélectionné ou associé à ce compte.");
  }

  const result = await reportPartnerSettlementIssue({
    houseId,
    userId: authRes.value.user.id,
    reference,
    targetType,
    orderId,
    settlementId,
    reasonCategory,
    message,
  });

  if (result.ok) {
    revalidatePath(`/partner/${houseSlug}/settlements`);
  }

  return result;
}
