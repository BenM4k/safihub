import "server-only";
import {
  createCoverageRequest,
  getNeighborhoods,
  type CoverageRequestRecord,
  type NeighborhoodRecord,
} from "@/dal";
import { err, ok, type Result } from "@/lib/result";

export interface SubmitCoverageRequestInput {
  phone: string;
  neighborhoodId?: string | null;
  neighborhoodText?: string | null;
  userId?: string | null;
}

export async function submitCoverageRequest(
  input: SubmitCoverageRequestInput
): Promise<Result<CoverageRequestRecord>> {
  const phone = input.phone.trim();
  if (!phone || phone.length < 8) {
    return err("Numéro de téléphone invalide.");
  }

  if (!input.neighborhoodId && (!input.neighborhoodText || !input.neighborhoodText.trim())) {
    return err("Veuillez spécifier votre quartier ou avenue.");
  }

  try {
    const record = await createCoverageRequest({
      phone,
      neighborhoodId: input.neighborhoodId || null,
      neighborhoodText: input.neighborhoodText?.trim() || null,
      userId: input.userId || null,
    });
    return ok(record);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la demande de couverture:", error);
    return err("Erreur lors de l'enregistrement de la demande.");
  }
}

export async function getCustomerNeighborhoods(): Promise<NeighborhoodRecord[]> {
  return await getNeighborhoods();
}
