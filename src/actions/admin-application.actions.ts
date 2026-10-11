"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, ok, type Result } from "@/lib/result";
import {
  approvePartnerApplication,
  rejectPartnerApplication,
} from "@/services/admin/partner-application.service";

const approveSchema = z.object({
  applicationId: z.string().uuid("ID de candidature invalide"),
  neighborhoodId: z.string().uuid("Quartier invalide").optional(),
  adminNote: z.string().optional(),
});

const rejectSchema = z.object({
  applicationId: z.string().uuid("ID de candidature invalide"),
  adminNote: z.string().min(1, "Un motif de rejet est obligatoire"),
});

export async function approveApplicationAction(
  formData: FormData
): Promise<Result<{ houseId: string; houseSlug: string; userId: string }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const rawNeighborhoodId = formData.get("neighborhoodId")?.toString();
  const parsed = approveSchema.safeParse({
    applicationId: formData.get("applicationId"),
    neighborhoodId:
      rawNeighborhoodId && rawNeighborhoodId.trim().length > 0
        ? rawNeighborhoodId
        : undefined,
    adminNote: formData.get("adminNote")?.toString() || undefined,
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message || "Données invalides");
  }

  const res = await approvePartnerApplication({
    applicationId: parsed.data.applicationId,
    adminUserId: auth.value.user.id,
    neighborhoodId: parsed.data.neighborhoodId,
    adminNote: parsed.data.adminNote,
  });

  if (!res.ok) return err(res.error);

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${parsed.data.applicationId}`);
  revalidatePath("/admin/houses");

  return ok(res.value);
}

export async function rejectApplicationAction(
  formData: FormData
): Promise<Result<void>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = rejectSchema.safeParse({
    applicationId: formData.get("applicationId"),
    adminNote: formData.get("adminNote"),
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message || "Données invalides");
  }

  const res = await rejectPartnerApplication({
    applicationId: parsed.data.applicationId,
    adminUserId: auth.value.user.id,
    adminNote: parsed.data.adminNote,
  });

  if (!res.ok) return err(res.error);

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${parsed.data.applicationId}`);

  return ok(undefined);
}
