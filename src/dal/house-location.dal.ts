import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { BUKAVU_DEFAULT_CENTER, type LatLng } from "@/lib/validations/location";

export interface NearbyHouseDistance {
  houseId: string;
  distanceMeters: number;
}

export interface ResolvedHouseCoordinates {
  lat: number;
  lng: number;
  isApproximate: boolean;
  locationUpdatedAt: Date | null;
}

/**
 * Pure helper to resolve a house's coordinates from raw DB numbers (exact location vs neighborhood centroid).
 */
export function resolveHouseCoords(params: {
  houseLat?: number | null;
  houseLng?: number | null;
  centroidLat?: number | null;
  centroidLng?: number | null;
  locationUpdatedAt?: Date | null;
}): ResolvedHouseCoordinates {
  if (
    typeof params.houseLat === "number" &&
    Number.isFinite(params.houseLat) &&
    typeof params.houseLng === "number" &&
    Number.isFinite(params.houseLng)
  ) {
    return {
      lat: Number(params.houseLat.toFixed(6)),
      lng: Number(params.houseLng.toFixed(6)),
      isApproximate: false,
      locationUpdatedAt: params.locationUpdatedAt ?? null,
    };
  }

  if (
    typeof params.centroidLat === "number" &&
    Number.isFinite(params.centroidLat) &&
    typeof params.centroidLng === "number" &&
    Number.isFinite(params.centroidLng)
  ) {
    return {
      lat: Number(params.centroidLat.toFixed(6)),
      lng: Number(params.centroidLng.toFixed(6)),
      isApproximate: true,
      locationUpdatedAt: null,
    };
  }

  return {
    lat: BUKAVU_DEFAULT_CENTER.lat,
    lng: BUKAVU_DEFAULT_CENTER.lng,
    isApproximate: true,
    locationUpdatedAt: null,
  };
}

/**
 * Atomically updates a house's PostGIS point in SRID 4326 (lon, lat).
 */
export async function updateHouseLocation(
  houseId: string,
  coords: LatLng | null
): Promise<boolean> {
  const now = new Date();
  const updated = await db
    .update(schema.houses)
    .set({
      location: coords
        ? sql`ST_SetSRID(ST_MakePoint(${coords.lng}, ${coords.lat}), 4326)`
        : null,
      locationUpdatedAt: coords ? now : null,
      updatedAt: now,
    })
    .where(eq(schema.houses.id, houseId))
    .returning({ id: schema.houses.id });

  return updated.length > 0;
}

/**
 * Atomically updates a neighborhood's centroid PostGIS point in SRID 4326 (lon, lat).
 */
export async function updateNeighborhoodCentroid(
  neighborhoodId: string,
  coords: LatLng | null
): Promise<boolean> {
  const now = new Date();
  const updated = await db
    .update(schema.neighborhoods)
    .set({
      centroid: coords
        ? sql`ST_SetSRID(ST_MakePoint(${coords.lng}, ${coords.lat}), 4326)`
        : null,
      updatedAt: now,
    })
    .where(eq(schema.neighborhoods.id, neighborhoodId))
    .returning({ id: schema.neighborhoods.id });

  return updated.length > 0;
}

/**
 * Uses PostGIS `ST_DWithin` and `ST_Distance` on `::geography` (WGS84 spheroid in meters)
 * to find approved active laundry houses within `radiusMeters` of the user's coordinates.
 */
export async function findHousesWithinRadius(params: {
  lat: number;
  lng: number;
  radiusMeters: number;
}): Promise<NearbyHouseDistance[]> {
  const userGeog = sql`ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326)::geography`;
  const houseGeog = sql`COALESCE(${schema.houses.location}, ${schema.neighborhoods.centroid})::geography`;

  return db
    .select({
      houseId: schema.houses.id,
      distanceMeters: sql<number>`ROUND(ST_Distance(${houseGeog}, ${userGeog}))::int`,
    })
    .from(schema.houses)
    .innerJoin(
      schema.neighborhoods,
      eq(schema.houses.neighborhoodId, schema.neighborhoods.id)
    )
    .where(
      and(
        eq(schema.houses.isActive, true),
        eq(schema.houses.reviewStatus, "approved"),
        sql`ST_DWithin(${houseGeog}, ${userGeog}, ${params.radiusMeters})`
      )
    )
    .orderBy(sql`ST_Distance(${houseGeog}, ${userGeog}) ASC`);
}

