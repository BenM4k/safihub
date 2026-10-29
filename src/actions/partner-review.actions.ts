"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireHouseAccess, requireRole } from "@/services/auth";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  getHouseChecklistDerivation,
  transitionHouseReviewStatus,
  type HouseReviewStatus,
} from "@/dal";
import { err, ok, type Result } from "@/lib/result";
import {
  trackSubmittedForReview,
  trackHouseReviewApproved,
  trackHouseReviewNeedsChanges,
  trackHouseReviewSuspended,
} from "@/services/analytics/analytics.service";

const submitReviewSchema = z.object({
  houseId: z.string().uuid("ID de pressing invalide"),
});

export async function submitHouseForValidationAction(
  houseId: string
): Promise<Result<{ success: boolean }>> {
  const parsed = submitReviewSchema.safeParse({ houseId });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const auth = await requireHouseAccess({ houseId });
  if (!auth.ok) {
    return err(auth.error);
  }

  const checklist = await getHouseChecklistDerivation(houseId);
  if (!checklist) {
    return err("Pressing introuvable.");
  }

  if (!checklist.isReadyForSubmission) {
    return err(
      "Veuillez compléter toutes les étapes obligatoires (1 à 6) avant de soumettre pour validation."
    );
  }

  if (checklist.reviewStatus === "pending_review") {
    return err("Votre pressing est déjà en attente de validation par l'équipe SafiHub.");
  }

  if (checklist.reviewStatus === "approved") {
    return err("Votre pressing est déjà validé et en ligne.");
  }

  if (checklist.reviewStatus === "suspended") {
    return err("Votre pressing est actuellement suspendu. Veuillez contacter l'administration de SafiHub.");
  }

  if (checklist.reviewStatus !== "draft" && checklist.reviewStatus !== "needs_changes") {
    return err("La soumission pour validation n'est pas autorisée dans cet état.");
  }

  try {
    await transitionHouseReviewStatus({
      houseId,
      fromStatus: checklist.reviewStatus,
      toStatus: "pending_review",
      performedBy: auth.value.user.id,
    });
  } catch {
    return err(
      "Le statut du pressing a été modifié par un autre utilisateur. Veuillez rafraîchir la page."
    );
  }

  await trackSubmittedForReview({
    userId: auth.value.user.id,
    houseId,
    completedItems: checklist.completedCount,
  });

  revalidatePath(`/partner/${checklist.houseSlug}`);
  revalidatePath("/admin/houses");

  return ok({ success: true });
}

const adminReviewSchema = z.object({
  houseId: z.string().uuid("ID de pressing invalide"),
  action: z.enum(["approve", "request_changes", "suspend"]),
  note: z.string().optional().nullable(),
});

export async function adminReviewHouseAction(params: {
  houseId: string;
  action: "approve" | "request_changes" | "suspend";
  note?: string | null;
}): Promise<Result<{ toStatus: HouseReviewStatus }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) {
    return err(auth.error);
  }

  const parsed = adminReviewSchema.safeParse(params);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  const checklist = await getHouseChecklistDerivation(params.houseId);
  if (!checklist) {
    return err("Pressing introuvable.");
  }

  if (params.action === "request_changes" && (!params.note || params.note.trim().length === 0)) {
    return err("Veuillez indiquer une note explicative des corrections demandées.");
  }

  let toStatus: HouseReviewStatus;
  if (params.action === "approve") {
    toStatus = "approved";
  } else if (params.action === "request_changes") {
    toStatus = "needs_changes";
  } else {
    toStatus = "suspended";
  }

  try {
    await transitionHouseReviewStatus({
      houseId: params.houseId,
      fromStatus: checklist.reviewStatus,
      toStatus,
      note: params.note?.trim() || null,
      performedBy: auth.value.user.id,
    });
  } catch {
    return err(
      "Le statut du pressing a été modifié par un autre utilisateur. Veuillez rafraîchir la page."
    );
  }

  if (toStatus === "approved") {
    await trackHouseReviewApproved({
      adminId: auth.value.user.id,
      houseId: params.houseId,
    });
  } else if (toStatus === "needs_changes") {
    await trackHouseReviewNeedsChanges({
      adminId: auth.value.user.id,
      houseId: params.houseId,
      note: params.note?.trim() || undefined,
    });
  } else {
    await trackHouseReviewSuspended({
      adminId: auth.value.user.id,
      houseId: params.houseId,
      note: params.note?.trim() || undefined,
    });
  }

  revalidateTag(CACHE_TAGS.housesList, "max");
  revalidateTag(CACHE_TAGS.house(params.houseId), "max");
  revalidateTag(CACHE_TAGS.house(checklist.houseSlug), "max");
  revalidatePath(`/partner/${checklist.houseSlug}`);
  revalidatePath("/admin/houses");
  revalidatePath("/houses");
  revalidatePath(`/houses/${checklist.houseSlug}`);

  return ok({ toStatus });
}
