import { BUKAVU_BOUNDS, BUKAVU_DEFAULT_CENTER } from "@/lib/validations/location";

export type MapSurfaceStyle = "map" | "satellite";

export const DEFAULT_PLAN_STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
  "https://tiles.openfreemap.org/styles/liberty";

export const BUKAVU_VIEWPORT = {
  latitude: BUKAVU_DEFAULT_CENTER.lat,
  longitude: BUKAVU_DEFAULT_CENTER.lng,
  zoom: 13.4,
  minZoom: 11,
  maxZoom: 18,
} as const;

/**
 * MapLibre maxBounds tuple: [west, south, east, north]
 */
export const BUKAVU_MAX_BOUNDS: [number, number, number, number] = [
  BUKAVU_BOUNDS.minLng,
  BUKAVU_BOUNDS.minLat,
  BUKAVU_BOUNDS.maxLng,
  BUKAVU_BOUNDS.maxLat,
];

export function hasSatelliteStyleSupport(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_MAPTILER_KEY);
}

/**
 * Resolves the MapLibre style URL or inline style spec.
 * - "map" (Plan): OpenFreeMap Liberty (zero key, zero quota) or custom NEXT_PUBLIC_MAP_STYLE_URL.
 * - "satellite": MapTiler hybrid satellite when NEXT_PUBLIC_MAPTILER_KEY is set, otherwise OpenFreeMap dark/positron fallback.
 */
export function resolveMapStyleUrl(style: MapSurfaceStyle): string {
  if (style === "satellite") {
    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (maptilerKey) {
      return `https://api.maptiler.com/maps/hybrid/style.json?key=${encodeURIComponent(maptilerKey)}`;
    }
    return "https://tiles.openfreemap.org/styles/positron";
  }
  return DEFAULT_PLAN_STYLE_URL;
}

