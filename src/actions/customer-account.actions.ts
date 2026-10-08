"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/services/auth";
import {
  addCustomerAddress,
  editCustomerAddress,
  makeDefaultCustomerAddress,
  removeCustomerAddress,
  updateCustomerProfileInfo,
} from "@/services/customer/account.service";

export interface AccountActionState {
  success: boolean;
  message?: string;
  error?: string;
}

export async function updateProfileAction(
  _prevState: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const name = formData.get("name")?.toString();
  const contactPhone = formData.get("contactPhone")?.toString();

  const res = await updateCustomerProfileInfo(user.id, {
    name,
    contactPhone,
  });

  if (!res.ok) {
    return { success: false, error: res.error };
  }

  revalidatePath("/account");
  return { success: true, message: "Profil mis à jour avec succès." };
}

export async function createAddressAction(
  _prevState: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const label = formData.get("label")?.toString() || null;
  const neighborhoodId = formData.get("neighborhoodId")?.toString() || "";
  const landmark = formData.get("landmark")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const isDefault = formData.get("isDefault") === "true";

  const res = await addCustomerAddress(user.id, {
    label,
    neighborhoodId,
    landmark,
    phone,
    isDefault,
  });

  if (!res.ok) {
    return { success: false, error: res.error };
  }

  revalidatePath("/account");
  return { success: true, message: "Adresse enregistrée." };
}

export async function updateAddressAction(
  addressId: string,
  formData: FormData
): Promise<AccountActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const label = formData.get("label")?.toString() || null;
  const neighborhoodId = formData.get("neighborhoodId")?.toString();
  const landmark = formData.get("landmark")?.toString();
  const phone = formData.get("phone")?.toString();
  const isDefault = formData.get("isDefault") === "true";

  const res = await editCustomerAddress(user.id, addressId, {
    label,
    neighborhoodId,
    landmark,
    phone,
    isDefault,
  });

  if (!res.ok) {
    return { success: false, error: res.error };
  }

  revalidatePath("/account");
  return { success: true, message: "Adresse modifiée." };
}

export async function deleteAddressAction(
  addressId: string
): Promise<AccountActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const res = await removeCustomerAddress(user.id, addressId);
  if (!res.ok) {
    return { success: false, error: res.error };
  }

  revalidatePath("/account");
  return { success: true, message: "Adresse supprimée." };
}

export async function setDefaultAddressAction(
  addressId: string
): Promise<AccountActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const res = await makeDefaultCustomerAddress(user.id, addressId);
  if (!res.ok) {
    return { success: false, error: res.error };
  }

  revalidatePath("/account");
  return { success: true, message: "Adresse définie par défaut." };
}
