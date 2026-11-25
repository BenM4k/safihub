"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import type { GuestMergeResult } from "@/dal";
import {
  blockAdminCustomer,
  executeCustomerMerge,
  getCustomerDetailedProfile,
  previewCustomerMerge,
  resetAdminUserPassword,
  unblockAdminCustomer,
  type CustomerDetailedProfile,
  type CustomerMergePreview,
} from "@/services/admin";

const userIdSchema = z
  .string()
  .trim()
  .min(1, "Identifiant client manquant.")
  .max(128, "Identifiant client invalide.");

const blockCustomerSchema = z.object({
  customerId: userIdSchema,
  reason: z
    .string()
    .trim()
    .min(1, "Un motif de blocage est obligatoire.")
    .max(500, "Le motif ne doit pas dépasser 500 caractères."),
});

const resetCustomerPasswordSchema = z.object({
  customerId: userIdSchema,
  newPassword: z
    .string()
    .trim()
    .min(8, "Le mot de passe doit comporter au moins 8 caractères.")
    .max(128, "Le mot de passe ne doit pas dépasser 128 caractères."),
});

const mergeCustomerSchema = z.object({
  guestUserId: userIdSchema,
  targetUserId: userIdSchema,
});

export async function blockCustomerAction(
  formData: FormData
): Promise<Result<void>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = blockCustomerSchema.safeParse({
    customerId: formData.get("userId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides.");
  }

  const res = await blockAdminCustomer({
    customerId: parsed.data.customerId,
    reason: parsed.data.reason,
    operatorName: auth.value.user.name || auth.value.user.email,
  });

  if (res.ok) {
    revalidatePath("/admin/customers");
    revalidatePath("/admin/users");
  }

  return res;
}

export async function unblockCustomerAction(
  formData: FormData
): Promise<Result<void>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = userIdSchema.safeParse(formData.get("userId"));
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Identifiant client manquant.");
  }

  const res = await unblockAdminCustomer(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/customers");
    revalidatePath("/admin/users");
  }

  return res;
}

export async function resetCustomerPasswordAction(
  formData: FormData
): Promise<Result<void>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = resetCustomerPasswordSchema.safeParse({
    customerId: formData.get("userId"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides.");
  }

  const res = await resetAdminUserPassword({
    userId: parsed.data.customerId,
    newPassword: parsed.data.newPassword,
    operatorId: auth.value.user.id,
    requireCustomerRole: true,
  });

  if (res.ok) {
    revalidatePath("/admin/customers");
    revalidatePath("/admin/users");
  }

  return res;
}

export async function previewCustomerMergeAction(
  guestUserId: string,
  targetUserId: string
): Promise<Result<CustomerMergePreview>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = mergeCustomerSchema.safeParse({ guestUserId, targetUserId });
  if (!parsed.success) {
    return err("Veuillez sélectionner les deux comptes à fusionner.");
  }

  return previewCustomerMerge(parsed.data);
}

export async function mergeCustomerAccountsAction(
  formData: FormData
): Promise<Result<GuestMergeResult>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = mergeCustomerSchema.safeParse({
    guestUserId: formData.get("guestUserId"),
    targetUserId: formData.get("targetUserId"),
  });
  if (!parsed.success) {
    return err("Identifiants des comptes manquants pour la fusion.");
  }

  const res = await executeCustomerMerge({
    guestUserId: parsed.data.guestUserId,
    targetUserId: parsed.data.targetUserId,
    operatorName: auth.value.user.name || auth.value.user.email,
    operatorId: auth.value.user.id,
  });

  if (res.ok) {
    revalidatePath("/admin/customers");
    revalidatePath("/admin/users");
    revalidatePath("/admin/orders");
  }

  return res;
}

export async function getCustomerDetailsAction(
  userId: string
): Promise<Result<CustomerDetailedProfile>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = userIdSchema.safeParse(userId);
  if (!parsed.success) return err("Identifiant requis.");

  return getCustomerDetailedProfile(parsed.data);
}
