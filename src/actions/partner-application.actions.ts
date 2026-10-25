"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
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
  const realIp = reqHeaders.get("x-real-ip")?.trim();
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  const rightmostForwarded = forwardedFor
    ? forwardedFor.split(",").map((s) => s.trim()).filter(Boolean).pop()
    : undefined;
  const clientIp = realIp || rightmostForwarded;

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
    const t = await getTranslations("partnerApply");
    type PartnerApplyErrorKey =
      | "rateLimitError"
      | "houseNameRequired"
      | "contactNameRequired"
      | "phoneRequired"
      | "emailRequired"
      | "emailInvalid"
      | "applicationPending"
      | "neighborhoodRequired"
      | "createFailed";

    const errorMap: Record<string, PartnerApplyErrorKey> = {
      RATE_LIMITED: "rateLimitError",
      HOUSE_NAME_REQUIRED: "houseNameRequired",
      CONTACT_NAME_REQUIRED: "contactNameRequired",
      PHONE_REQUIRED: "phoneRequired",
      EMAIL_REQUIRED: "emailRequired",
      EMAIL_INVALID: "emailInvalid",
      APPLICATION_PENDING: "applicationPending",
      NEIGHBORHOOD_REQUIRED: "neighborhoodRequired",
      CREATE_FAILED: "createFailed",
    };
    const errorKey: PartnerApplyErrorKey = errorMap[res.error] ?? "createFailed";
    return {
      success: false,
      error: t(errorKey),
    };
  }

  revalidatePath("/partners/apply");
  revalidatePath("/admin/applications");

  return {
    success: true,
  };
}
