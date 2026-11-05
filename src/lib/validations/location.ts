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
