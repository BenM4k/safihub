"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import {
  blockAdminUser,
  createAdminStaffAccount,
  mergeAdminGuestCustomer,
  resetAdminUserPassword,
  unblockAdminUser,
  updateAdminUserRole,
} from "@/services/admin";

const createStaffSchema = z
  .object({
    name: z.string().min(1, "Nom requis"),
    email: z.string().email("Email valide requis"),
    role: z.enum(["courier", "house", "admin"]),
    phone: z.string().optional().nullable(),
    password: z.string().min(8, "Mot de passe d'au moins 8 caractères"),
    houseId: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "house" && (!data.houseId || !data.houseId.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["houseId"],
        message: "Un pressing doit être sélectionné pour le rôle pressing",
      });
    }
  });

const updateRoleSchema = z
  .object({
    userId: z.string().min(1, "Identifiant utilisateur requis"),
    newRole: z.enum(["admin", "courier", "house", "customer"]),
    houseId: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.newRole === "house" && (!data.houseId || !data.houseId.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["houseId"],
        message: "Un pressing doit être sélectionné pour le rôle Pressing",
      });
    }
  });

export async function updateUserRoleAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = updateRoleSchema.safeParse({
    userId: formData.get("userId"),
    newRole: formData.get("newRole"),
    houseId: formData.get("houseId"),
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données de rôle invalides");
  }

  // Guardrail: self demotion warning
  if (auth.value.user.id === parsed.data.userId && parsed.data.newRole !== "admin") {
    const confirmed = formData.get("confirmedSelfAction") === "true";
    if (!confirmed) {
      return err(
        "Avertissement : Vous êtes sur le point de modifier votre propre rôle d'administrateur. Veuillez confirmer cette action explicitement."
      );
    }
  }

  const res = await updateAdminUserRole(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/users");
    revalidatePath("/admin/houses");
    revalidatePath("/admin/couriers");
  }
  return res;
}

const userIdSchema = z
  .string()
  .trim()
  .min(1, "Identifiant utilisateur requis")
  .max(128, "Identifiant utilisateur invalide");

const blockUserSchema = z.object({
  userId: userIdSchema,
  reason: z
    .string()
    .trim()
    .min(1, "Un motif est obligatoire pour bloquer un compte utilisateur")
    .max(500, "Le motif ne doit pas dépasser 500 caractères"),
});

const resetUserPasswordSchema = z.object({
  userId: userIdSchema,
  newPassword: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le mot de passe ne doit pas dépasser 128 caractères"),
});

const mergeGuestSchema = z.object({
  guestUserId: userIdSchema,
  targetUserId: userIdSchema,
});

export async function blockUserAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = blockUserSchema.safeParse({
    userId: formData.get("userId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  // Guardrail: self block protection
  if (auth.value.user.id === parsed.data.userId) {
    const confirmed = formData.get("confirmedSelfAction") === "true";
    if (!confirmed) {
      return err(
        "Avertissement : Vous êtes sur le point de bloquer votre propre compte actuellement connecté. Veuillez confirmer cette action explicitement."
      );
    }
  }

  const res = await blockAdminUser(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/users");
    revalidatePath("/admin/customers");
  }
  return res;
}

export async function unblockUserAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = userIdSchema.safeParse(formData.get("userId"));
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Identifiant utilisateur requis");
  }

  const res = await unblockAdminUser(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/users");
    revalidatePath("/admin/customers");
  }
  return res;
}

export async function resetUserPasswordAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = resetUserPasswordSchema.safeParse({
    userId: formData.get("userId"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await resetAdminUserPassword({
    ...parsed.data,
    operatorId: auth.value.user.id,
  });
  if (res.ok) {
    revalidatePath("/admin/users");
  }
  return res;
}

export async function createStaffAccountAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = createStaffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    houseId: formData.get("houseId"),
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await createAdminStaffAccount(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/users");
    revalidatePath("/admin/houses");
    revalidatePath("/admin/couriers");
  }
  return res;
}

export async function mergeGuestAccountAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = mergeGuestSchema.safeParse({
    guestUserId: formData.get("guestUserId"),
    targetUserId: formData.get("targetUserId"),
  });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await mergeAdminGuestCustomer(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/users");
    revalidatePath("/admin/customers");
    revalidatePath("/admin/orders");
  }
  return res;
}
