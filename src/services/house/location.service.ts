import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  findHousesWithinRadius,
  getHouseById,
  updateHouseLocation,
  updateNeighborhoodCentroid,
  type NearbyHouseDistance,
} from "@/dal";
import {
  DEFAULT_NEARBY_RADIUS_KM,
  latLngSchema,
  type LatLng,
} from "@/lib/validations/location";

export async function updateHouseLocationService(params: {
  houseId: string;
  coords: LatLng | null;
}): Promise<Result<void>> {
  try {
    if (params.coords !== null) {
      const parsed = latLngSchema.safeParse(params.coords);
      if (!parsed.success) {
        return err(
          parsed.error.issues[0]?.message ?? "Coordonnées hors du périmètre de Bukavu"
        );
      }
    }

    const house = await getHouseById(params.houseId);
    if (!house) {
      return err("Pressing introuvable");
    }

    const updated = await updateHouseLocation(params.houseId, params.coords);
    if (!updated) {
      return err("Impossible de mettre à jour la position du pressing");
    }

    return ok(undefined);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Erreur lors de la mise à jour de la localisation"
    );
  }
}

export async function updateNeighborhoodCentroidService(params: {
  neighborhoodId: string;
  coords: LatLng | null;
}): Promise<Result<void>> {
  try {
    if (params.coords !== null) {
      const parsed = latLngSchema.safeParse(params.coords);
      if (!parsed.success) {
        return err(
          parsed.error.issues[0]?.message ?? "Coordonnées hors du périmètre de Bukavu"
        );
      }
    }

    const updated = await updateNeighborhoodCentroid(
      params.neighborhoodId,
      params.coords
    );
    if (!updated) {
      return err("Quartier introuvable");
    }

    return ok(undefined);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Erreur lors de la mise à jour du centre du quartier"
    );
  }
}

export async function findNearbyHousesService(params: {
  lat: number;
  lng: number;
  radiusKm?: number;
}): Promise<Result<NearbyHouseDistance[]>> {
  try {
    if (
      !Number.isFinite(params.lat) ||
      params.lat < -90 ||
      params.lat > 90 ||
      !Number.isFinite(params.lng) ||
      params.lng < -180 ||
      params.lng > 180
    ) {
      return err("Coordonnées GPS invalides");
    }

    const radiusKm =
      params.radiusKm && Number.isFinite(params.radiusKm) && params.radiusKm > 0
        ? Math.min(params.radiusKm, 50)
        : DEFAULT_NEARBY_RADIUS_KM;

    const rows = await findHousesWithinRadius({
      lat: params.lat,
      lng: params.lng,
      radiusMeters: Math.round(radiusKm * 1000),
    });

    return ok(rows);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Erreur lors de la recherche géospatiale des pressings"
    );
  }
}

