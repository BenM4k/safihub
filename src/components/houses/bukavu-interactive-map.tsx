"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { CustomerHouseSummary } from "@/dal";
import { MapSkeleton } from "@/components/map/map-skeleton";
import { MapStyleToggle } from "@/components/map/map-style-toggle";
import { useDeferUntilVisible } from "@/components/map/use-defer-until-visible";
import type { MapSurfaceStyle } from "@/components/map/map-config";
import { BUKAVU_DEFAULT_CENTER, type LatLng } from "@/lib/validations/location";
import { MapHousePreview } from "./map-house-preview";

const DynamicBukavuMapCanvas = dynamic(
  () =>
    import("./map/bukavu-map-canvas").then((mod) => mod.BukavuMapCanvas),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

interface BukavuInteractiveMapProps {
  houses: CustomerHouseSummary[];
  hoveredHouseId: string | null;
  onHoverHouse: (id: string | null) => void;
  selectedHouseId: string | null;
  onSelectHouse: (id: string | null) => void;
  userLocation?: LatLng | null;
  enabled?: boolean;
}

/**
 * Computes tiny spiral offsets for houses that share identical coordinates (e.g. same neighborhood centroid)
 * so price markers remain individually clickable without mutating stored coordinates.
 */
function computeMarkerOffsets(
  houses: CustomerHouseSummary[]
): Map<string, { offsetLat: number; offsetLng: number }> {
  const byCoordKey = new Map<string, CustomerHouseSummary[]>();
  for (const h of houses) {
    const key = `${h.coords.lat.toFixed(4)}_${h.coords.lng.toFixed(4)}`;
    const group = byCoordKey.get(key) ?? [];
    group.push(h);
    byCoordKey.set(key, group);
  }

  const offsets = new Map<string, { offsetLat: number; offsetLng: number }>();
  for (const group of byCoordKey.values()) {
    if (group.length === 1) {
      offsets.set(group[0].id, { offsetLat: 0, offsetLng: 0 });
      continue;
    }
    group.forEach((house, idx) => {
      if (idx === 0) {
        offsets.set(house.id, { offsetLat: 0, offsetLng: 0 });
        return;
      }
      const angle = (idx * 2 * Math.PI) / Math.min(group.length, 8);
      const ring = Math.ceil(idx / 8);
      const radius = 0.00055 * ring;
      offsets.set(house.id, {
        offsetLat: Number((Math.sin(angle) * radius).toFixed(6)),
        offsetLng: Number((Math.cos(angle) * radius).toFixed(6)),
      });
    });
  }
  return offsets;
}

export function BukavuInteractiveMap({
  houses,
  hoveredHouseId,
  onHoverHouse,
  selectedHouseId,
  onSelectHouse,
  userLocation,
  enabled = true,
}: BukavuInteractiveMapProps) {
  const t = useTranslations("customerHouses");
  const tMap = useTranslations("mapLocation");
  const [mapType, setMapType] = useState<MapSurfaceStyle>("map");
  const { containerRef, isReady } = useDeferUntilVisible<HTMLDivElement>(enabled);

  const activeHouse = houses.find(
    (h) => h.id === (hoveredHouseId || selectedHouseId)
  );

  const markerOffsets = useMemo(() => computeMarkerOffsets(houses), [houses]);

  const initialCenter = useMemo(() => {
    if (userLocation) {
      return userLocation;
    }
    if (houses.length === 0) return BUKAVU_DEFAULT_CENTER;
    const sum = houses.reduce(
      (acc, h) => ({
        lat: acc.lat + h.coords.lat,
        lng: acc.lng + h.coords.lng,
      }),
      { lat: 0, lng: 0 }
    );
    return {
      lat: sum.lat / houses.length,
      lng: sum.lng / houses.length,
    };
  }, [houses, userLocation]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[450px] bg-slate-900 overflow-hidden select-none"
    >
      {/* Top-right Map Style Toggle: Plan (OpenFreeMap) vs Satellite (MapTiler) */}
      <div className="absolute top-4 right-4 z-20">
        <MapStyleToggle
          value={mapType}
          onChange={setMapType}
          planLabel={t("mapPlan")}
          satelliteLabel={t("mapSatellite")}
        />
      </div>

      {/* Truly lazy-loaded MapLibre GL WebGL Canvas + Markers */}
      {enabled && isReady ? (
        <DynamicBukavuMapCanvas
          houses={houses}
          markerOffsets={markerOffsets}
          center={initialCenter}
          styleMode={mapType}
          hoveredHouseId={hoveredHouseId}
          selectedHouseId={selectedHouseId}
          onHoverHouse={onHoverHouse}
          onSelectHouse={onSelectHouse}
          userLocation={userLocation}
          yourPositionLabel={tMap("yourPositionLabel")}
        />
      ) : (
        <MapSkeleton label={tMap("loadingMap")} />
      )}

      {/* Active House Preview Popup at Bottom Right */}
      {activeHouse && (
        <MapHousePreview
          key={activeHouse.id}
          activeHouse={activeHouse}
          onClose={() => {
            onSelectHouse(null);
            onHoverHouse(null);
          }}
        />
      )}
    </div>
  );
}
