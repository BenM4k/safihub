"use server";

import { revalidatePath } from "next/cache";
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

export async function blockCustomerAction(
  formData: FormData
): Promise<Result<void>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const customerId = String(formData.get("userId") || "").trim();
  const reason = String(formData.get("reason") || "").trim();

  if (!customerId) return err("Identifiant client manquant.");
  if (!reason) return err("Un motif de blocage est obligatoire.");

  const res = await blockAdminCustomer({
    customerId,
    reason,
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

  const customerId = String(formData.get("userId") || "").trim();
  if (!customerId) return err("Identifiant client manquant.");

  const res = await unblockAdminCustomer(customerId);
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

  const customerId = String(formData.get("userId") || "").trim();
  const newPassword = String(formData.get("newPassword") || "").trim();

  if (!customerId) return err("Identifiant client manquant.");
  if (!newPassword || newPassword.length < 8) {
    return err("Le mot de passe doit comporter au moins 8 caractères.");
  }

  const res = await resetAdminUserPassword({
    userId: customerId,
    newPassword,
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

  if (!guestUserId || !targetUserId) {
    return err("Veuillez sélectionner les deux comptes à fusionner.");
  }

  return previewCustomerMerge({ guestUserId, targetUserId });
}

export async function mergeCustomerAccountsAction(
  formData: FormData
): Promise<Result<GuestMergeResult>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const guestUserId = String(formData.get("guestUserId") || "").trim();
  const targetUserId = String(formData.get("targetUserId") || "").trim();

  if (!guestUserId || !targetUserId) {
    return err("Identifiants des comptes manquants pour la fusion.");
  }

  const res = await executeCustomerMerge({
    guestUserId,
    targetUserId,
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

  if (!userId) return err("Identifiant requis.");

  return getCustomerDetailedProfile(userId);
}
