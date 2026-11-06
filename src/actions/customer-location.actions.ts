"use server";

import { z } from "zod";
import { err, type Result } from "@/lib/result";
import type { NearbyHouseDistance } from "@/dal";
import { findNearbyHousesService } from "@/services/house";
import { DEFAULT_NEARBY_RADIUS_KM } from "@/lib/validations/location";

const nearbySearchSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  radiusKm: z
    .number()
    .finite()
    .positive()
    .max(50)
    .default(DEFAULT_NEARBY_RADIUS_KM),
});

export async function findNearbyHousesAction(input: {
  lat: number;
  lng: number;
  radiusKm?: number;
}): Promise<Result<NearbyHouseDistance[]>> {
  const parsed = nearbySearchSchema.safeParse(input);
  if (!parsed.success) {
    return err(
      parsed.error.issues[0]?.message ?? "Paramètres de localisation invalides"
    );
  }

  return findNearbyHousesService(parsed.data);
}

