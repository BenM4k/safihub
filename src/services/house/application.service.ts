import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  createHouseApplication,
  getPendingApplicationByEmail,
  type HouseApplicationRecord,
} from "@/dal/house-application.dal";
import { rateLimitPartnerApplication } from "@/services/abuse/rate-limiter";
import { partnerApplicationSchema } from "@/lib/validations/partner-application.schema";

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
    const ipKey = params.clientIp?.trim() ? `ip:${params.clientIp.trim()}` : "ip:fallback";
    const ipLimit = await rateLimitPartnerApplication(ipKey);
    if (!ipLimit.allowed) {
      return err("RATE_LIMITED");
    }
    if (params.email?.trim()) {
      const emailLimit = await rateLimitPartnerApplication(
        `email:${params.email.trim().toLowerCase()}`
      );
      if (!emailLimit.allowed) {
        return err("RATE_LIMITED");
      }
    }

    // 2. Validate essential fields via shared Zod schema
    const parsed = partnerApplicationSchema.safeParse(params);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "CREATE_FAILED";
      return err(firstIssue);
    }

    // 3. Guard against duplicate pending application for the same email
    const existingPending = await getPendingApplicationByEmail(parsed.data.email);
    if (existingPending) {
      return err("APPLICATION_PENDING");
    }

    // 4. Persist application
    const application = await createHouseApplication({
      houseName: parsed.data.houseName,
      contactName: parsed.data.contactName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      neighborhoodId: parsed.data.neighborhoodId || null,
      neighborhoodText: parsed.data.neighborhoodText || null,
      addressNote: parsed.data.addressNote || null,
      servicesNote: parsed.data.servicesNote || null,
      hoursNote: parsed.data.hoursNote || null,
      message: parsed.data.message || null,
    });

    return ok(application);
  } catch (error) {
    console.error("submitPartnerApplication unexpected error:", error);
    return err("CREATE_FAILED");
  }
}
