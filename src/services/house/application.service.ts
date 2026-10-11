import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  createHouseApplication,
  type HouseApplicationRecord,
} from "@/dal/house-application.dal";
import { rateLimitPartnerApplication } from "@/services/abuse/rate-limiter";

export async function submitPartnerApplication(params: {
  houseName: string;
  contactName: string;
  phone: string;
  email: string;
  neighborhoodId?: string | null;
  neighborhoodText?: string | null;
  addressNote?: string | null;
  servicesNote?: string | null;
  hoursNote?: string | null;
  message?: string | null;
  clientIp?: string;
}): Promise<Result<HouseApplicationRecord>> {
  try {
    // 1. Rate limiting by IP and email
    if (params.clientIp) {
      const ipLimit = await rateLimitPartnerApplication(`ip:${params.clientIp}`);
      if (!ipLimit.allowed) {
        return err("RATE_LIMITED");
      }
    }
    if (params.email?.trim()) {
      const emailLimit = await rateLimitPartnerApplication(
        `email:${params.email.trim().toLowerCase()}`
      );
      if (!emailLimit.allowed) {
        return err("RATE_LIMITED");
      }
    }

    // 2. Validate essential fields
    if (!params.houseName?.trim() || params.houseName.trim().length < 2) {
      return err("HOUSE_NAME_REQUIRED");
    }
    if (!params.contactName?.trim() || params.contactName.trim().length < 2) {
      return err("CONTACT_NAME_REQUIRED");
    }
    if (!params.phone?.trim() || params.phone.trim().length < 6) {
      return err("PHONE_REQUIRED");
    }
    if (!params.email?.trim() || !params.email.includes("@")) {
      return err("EMAIL_REQUIRED");
    }

    const hasNeighborhood =
      Boolean(params.neighborhoodId && params.neighborhoodId.trim().length > 0) ||
      Boolean(params.neighborhoodText && params.neighborhoodText.trim().length > 0);

    if (!hasNeighborhood) {
      return err("NEIGHBORHOOD_REQUIRED");
    }

    // 3. Persist application
    const application = await createHouseApplication({
      houseName: params.houseName,
      contactName: params.contactName,
      phone: params.phone,
      email: params.email,
      neighborhoodId: params.neighborhoodId || null,
      neighborhoodText: params.neighborhoodText || null,
      addressNote: params.addressNote || null,
      servicesNote: params.servicesNote || null,
      hoursNote: params.hoursNote || null,
      message: params.message || null,
    });

    return ok(application);
  } catch (error) {
    console.error("submitPartnerApplication unexpected error:", error);
    return err("CREATE_FAILED");
  }
}
