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
    // 1. Rate limiting by IP or email
    const rateLimitIdentifier = params.clientIp || params.email.toLowerCase();
    const rateLimitRes = await rateLimitPartnerApplication(rateLimitIdentifier);
    if (!rateLimitRes.allowed) {
      return err(
        "Trop de tentatives d'inscription. Veuillez patienter avant de soumettre à nouveau."
      );
    }

    // 2. Validate essential fields
    if (!params.houseName?.trim() || params.houseName.trim().length < 2) {
      return err("Le nom de l'atelier de pressing est requis.");
    }
    if (!params.contactName?.trim() || params.contactName.trim().length < 2) {
      return err("Le nom du responsable ou contact est requis.");
    }
    if (!params.phone?.trim() || params.phone.trim().length < 6) {
      return err("Un numéro de téléphone valide est requis.");
    }
    if (!params.email?.trim() || !params.email.includes("@")) {
      return err("Une adresse email valide est requise.");
    }

    const hasNeighborhood =
      (params.neighborhoodId && params.neighborhoodId.trim().length > 0) ||
      (params.neighborhoodText && params.neighborhoodText.trim().length > 0);

    if (!hasNeighborhood) {
      return err("Le quartier ou la localisation de l'atelier est requis.");
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
    return err(
      error instanceof Error
        ? error.message
        : "Une erreur est survenue lors de l'enregistrement de votre candidature."
    );
  }
}
