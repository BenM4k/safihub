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
  applicationId: z.string().uuid("INVALID_APPLICATION_ID"),
  neighborhoodId: z.string().uuid("INVALID_NEIGHBORHOOD_ID").optional(),
  adminNote: z.string().optional(),
  customPassword: z
    .string()
    .min(8, "PASSWORD_TOO_SHORT")
    .optional(),
});

const rejectSchema = z.object({
  applicationId: z.string().uuid("INVALID_APPLICATION_ID"),
  adminNote: z.string().min(1, "REJECTION_REASON_REQUIRED"),
});

export async function approveApplicationAction(formData: FormData): Promise<
  Result<{
    houseId: string;
    houseSlug: string;
    userId: string;
    temporaryPassword: string;
    isNewAccount: boolean;
    passwordApplied: boolean;
  }>
> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const rawNeighborhoodId = formData.get("neighborhoodId")?.toString();
  const rawCustomPassword = formData.get("customPassword")?.toString()?.trim();

  const parsed = approveSchema.safeParse({
    applicationId: formData.get("applicationId"),
    neighborhoodId:
      rawNeighborhoodId && rawNeighborhoodId.trim().length > 0
        ? rawNeighborhoodId
        : undefined,
    adminNote: formData.get("adminNote")?.toString() || undefined,
    customPassword:
      rawCustomPassword && rawCustomPassword.length > 0
        ? rawCustomPassword
        : undefined,
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message || "INVALID_DATA");
  }

  const res = await approvePartnerApplication({
    applicationId: parsed.data.applicationId,
    adminUserId: auth.value.user.id,
    neighborhoodId: parsed.data.neighborhoodId,
    adminNote: parsed.data.adminNote,
    customPassword: parsed.data.customPassword,
  });

  if (!res.ok) return err(res.error);

  revalidatePath("/admin/applications");
  revalidatePath("/admin/houses");
  revalidatePath("/admin/users");

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
