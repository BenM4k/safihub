"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { submitPartnerApplication } from "@/services/house/application.service";

export interface PartnerApplicationActionState {
  success: boolean;
  message?: string;
  error?: string;
}

export async function submitPartnerApplicationAction(
  _prevState: PartnerApplicationActionState,
  formData: FormData
): Promise<PartnerApplicationActionState> {
  const reqHeaders = await headers();
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0]?.trim() : undefined;

  const houseName = formData.get("houseName")?.toString() || "";
  const contactName = formData.get("contactName")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const neighborhoodId = formData.get("neighborhoodId")?.toString() || undefined;
  const neighborhoodText = formData.get("neighborhoodText")?.toString() || undefined;
  const addressNote = formData.get("addressNote")?.toString() || undefined;
  const servicesNote = formData.get("servicesNote")?.toString() || undefined;
  const hoursNote = formData.get("hoursNote")?.toString() || undefined;
  const message = formData.get("message")?.toString() || undefined;

  const res = await submitPartnerApplication({
    houseName,
    contactName,
    phone,
    email,
    neighborhoodId,
    neighborhoodText,
    addressNote,
    servicesNote,
    hoursNote,
    message,
    clientIp,
  });

  if (!res.ok) {
    return {
      success: false,
      error: res.error,
    };
  }

  revalidatePath("/partners/apply");
  revalidatePath("/admin/applications");

  return {
    success: true,
    message:
      "Votre candidature a été envoyée avec succès ! Notre équipe va examiner votre demande et vous recontacter très prochainement.",
  };
}
