"use client";

import { memo } from "react";
import { MapPin } from "lucide-react";
import { Marker } from "react-map-gl/maplibre";
import type { CustomerHouseSummary } from "@/dal";

interface HousePriceMarkerProps {
  house: CustomerHouseSummary;
  offsetLng: number;
  offsetLat: number;
  isSelected: boolean;
  isCurrentlySelected: boolean;
  onSelectHouse: (id: string | null) => void;
  onHoverHouse: (id: string | null) => void;
}

export const HousePriceMarker = memo(function HousePriceMarker({
  house,
  offsetLng,
  offsetLat,
  isSelected,
  isCurrentlySelected,
  onSelectHouse,
  onHoverHouse,
}: HousePriceMarkerProps) {
  return (
    <Marker
      latitude={house.coords.lat + offsetLat}
      longitude={house.coords.lng + offsetLng}
      anchor="bottom"
    >
      <button
        type="button"
        aria-label={house.name}
        onClick={(e) => {
          e.stopPropagation();
          onSelectHouse(isCurrentlySelected ? null : house.id);
        }}
        onMouseEnter={() => onHoverHouse(house.id)}
        onMouseLeave={() => onHoverHouse(null)}
        className={`group relative flex flex-col items-center transition-transform duration-200 cursor-pointer ${
          isSelected ? "scale-125 z-30" : "hover:scale-110 z-20"
        }`}
      >
        {/* Pin head */}
        <div
          className={`relative size-9 rounded-full flex items-center justify-center shadow-lg transition-colors ${
            isSelected
              ? "bg-primary text-white ring-4 ring-primary/30"
              : "bg-card text-primary border-2 border-primary hover:bg-primary hover:text-white"
          }`}
        >
          <MapPin className="size-4.5" />
          {/* Open / Closed status dot */}
          <span
            className={`absolute -top-0.5 -right-0.5 size-3 rounded-full border-2 border-card ${
              house.isOpenNow ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
        </div>

        {/* Pin pointer stem & shadow */}
        <div
          className={`w-0.5 h-2 transition-colors ${
            isSelected ? "bg-primary" : "bg-primary/80"
          }`}
        />
        <div className="size-2 rounded-full bg-black/35 blur-[0.5px]" />
      </button>
    </Marker>
  );
});
