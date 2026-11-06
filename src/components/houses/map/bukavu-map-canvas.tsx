"use client";

import { Marker } from "react-map-gl/maplibre";
import type { CustomerHouseSummary } from "@/dal";
import { BaseMap } from "@/components/map/base-map";
import type { MapSurfaceStyle } from "@/components/map/map-config";
import type { LatLng } from "@/lib/validations/location";
import { HousePriceMarker } from "./house-price-marker";

export interface BukavuMapCanvasProps {
  houses: CustomerHouseSummary[];
  markerOffsets: Map<string, { offsetLat: number; offsetLng: number }>;
  center: LatLng;
  styleMode: MapSurfaceStyle;
  hoveredHouseId: string | null;
  selectedHouseId: string | null;
  onHoverHouse: (id: string | null) => void;
  onSelectHouse: (id: string | null) => void;
  userLocation?: LatLng | null;
  yourPositionLabel: string;
}

export function BukavuMapCanvas({
  houses,
  markerOffsets,
  center,
  styleMode,
  hoveredHouseId,
  selectedHouseId,
  onHoverHouse,
  onSelectHouse,
  userLocation,
  yourPositionLabel,
}: BukavuMapCanvasProps) {
  const activeId = hoveredHouseId || selectedHouseId;

  return (
    <BaseMap
      center={center}
      zoom={13.5}
      styleMode={styleMode}
      onMapClick={() => onSelectHouse(null)}
    >
      {userLocation && (
        <Marker
          latitude={userLocation.lat}
          longitude={userLocation.lng}
          anchor="center"
        >
          <div
            title={yourPositionLabel}
            className="relative flex items-center justify-center"
          >
            <span className="absolute size-7 rounded-full bg-sky-500/30 animate-ping" />
            <span className="size-3.5 rounded-full bg-sky-500 border-2 border-white shadow-md" />
          </div>
        </Marker>
      )}

      {houses.map((house) => {
        const offset = markerOffsets.get(house.id) ?? {
          offsetLat: 0,
          offsetLng: 0,
        };

        return (
          <HousePriceMarker
            key={house.id}
            house={house}
            offsetLat={offset.offsetLat}
            offsetLng={offset.offsetLng}
            isSelected={house.id === activeId}
            isCurrentlySelected={house.id === selectedHouseId}
            onSelectHouse={onSelectHouse}
            onHoverHouse={onHoverHouse}
          />
        );
      })}
    </BaseMap>
  );
}

