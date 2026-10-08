"use server";

import { getCurrentUser } from "@/services/auth";
import { submitCoverageRequest } from "@/services/coverage/customer-coverage.service";
import { revalidatePath } from "next/cache";

export interface CoverageActionState {
  success: boolean;
  message?: string;
  error?: string;
}

export async function submitCoverageRequestAction(
  _prevState: CoverageActionState,
  formData: FormData
): Promise<CoverageActionState> {
  const phone = formData.get("phone")?.toString() || "";
  const neighborhoodId = formData.get("neighborhoodId")?.toString() || undefined;
  const neighborhoodText = formData.get("neighborhoodText")?.toString() || undefined;

  const user = await getCurrentUser();

  const res = await submitCoverageRequest({
    phone,
    neighborhoodId,
    neighborhoodText,
    userId: user?.id,
  });

  if (!res.ok) {
    return {
      success: false,
      error: res.error,
    };
  }

  revalidatePath("/coverage");
  revalidatePath("/admin/coverage");

  return {
    success: true,
    message: "Votre demande a bien été enregistrée. Nous vous contacterons dès l'ouverture du service dans votre zone !",
  };
}
