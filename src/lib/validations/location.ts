import { z } from "zod";

/**
 * Geographic bounding box for Bukavu, South Kivu, DRC (WGS84 / SRID 4326).
 * Matches the PostgreSQL CHECK constraint `ST_MakeEnvelope(28.75, -2.60, 28.95, -2.40, 4326)`.
 */
export const BUKAVU_BOUNDS = {
  minLat: -2.6,
  maxLat: -2.4,
  minLng: 28.75,
  maxLng: 28.95,
} as const;

export const BUKAVU_DEFAULT_CENTER = {
  lat: -2.5083,
  lng: 28.8608,
} as const;

export const latLngSchema = z.object({
  lat: z
    .number()
    .finite()
    .min(BUKAVU_BOUNDS.minLat, "Latitude hors du périmètre de Bukavu")
    .max(BUKAVU_BOUNDS.maxLat, "Latitude hors du périmètre de Bukavu"),
  lng: z
    .number()
    .finite()
    .min(BUKAVU_BOUNDS.minLng, "Longitude hors du périmètre de Bukavu")
    .max(BUKAVU_BOUNDS.maxLng, "Longitude hors du périmètre de Bukavu"),
});

export type LatLng = z.infer<typeof latLngSchema>;

export function isWithinBukavuBounds(coords: { lat: number; lng: number }): boolean {
  return latLngSchema.safeParse(coords).success;
}

export const DEFAULT_NEARBY_RADIUS_KM = 5;
export const NEARBY_RADIUS_OPTIONS_KM = [5, 10, 15] as const;
export type NearbyRadiusKm = (typeof NEARBY_RADIUS_OPTIONS_KM)[number];


/**
 * Calculates great-circle distance in kilometers between two WGS84 points using the Haversine formula.
 */
export function calculateDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const EARTH_RADIUS_KM = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}


