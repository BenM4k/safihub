"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("account");
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: t("unauthorized") };
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
  return { success: true, message: t("profileSuccess") };
}

export async function createAddressAction(
  _prevState: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getTranslations("account");
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: t("unauthorized") };
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
  return { success: true, message: t("addressCreated") };
}

export async function updateAddressAction(
  addressId: string,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getTranslations("account");
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: t("unauthorized") };
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
  return { success: true, message: t("addressUpdated") };
}

export async function deleteAddressAction(
  addressId: string
): Promise<AccountActionState> {
  const t = await getTranslations("account");
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: t("unauthorized") };
  }

  const res = await removeCustomerAddress(user.id, addressId);
  if (!res.ok) {
    return { success: false, error: res.error };
  }

  revalidatePath("/account");
  return { success: true, message: t("addressDeleted") };
}

export async function setDefaultAddressAction(
  addressId: string
): Promise<AccountActionState> {
  const t = await getTranslations("account");
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: t("unauthorized") };
  }

  const res = await makeDefaultCustomerAddress(user.id, addressId);
  if (!res.ok) {
    return { success: false, error: res.error };
  }

  revalidatePath("/account");
  return { success: true, message: t("addressSetDefault") };
}
