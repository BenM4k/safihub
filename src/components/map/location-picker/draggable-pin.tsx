"use client";

import { Marker, type MarkerDragEvent } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";
import { isWithinBukavuBounds, type LatLng } from "@/lib/validations/location";

interface DraggablePinProps {
  coords: LatLng;
  onChange: (next: LatLng) => void;
  onOutOfBounds?: () => void;
}

export function DraggablePin({
  coords,
  onChange,
  onOutOfBounds,
}: DraggablePinProps) {
  const handleDragEnd = (evt: MarkerDragEvent) => {
    const candidate = {
      lat: Number(evt.lngLat.lat.toFixed(6)),
      lng: Number(evt.lngLat.lng.toFixed(6)),
    };
    if (!isWithinBukavuBounds(candidate)) {
      onOutOfBounds?.();
      return;
    }
    onChange(candidate);
  };

  return (
    <Marker
      latitude={coords.lat}
      longitude={coords.lng}
      anchor="bottom"
      draggable
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col items-center cursor-grab active:cursor-grabbing">
        <div className="px-2.5 py-1 rounded-full bg-primary text-white text-[11px] font-black shadow-lg flex items-center gap-1 ring-4 ring-primary/30">
          <MapPin className="size-3.5" />
          <span>
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </span>
        </div>
        <div className="w-0.5 h-2.5 bg-primary shadow-sm" />
        <div className="size-2 rounded-full bg-primary/60" />
      </div>
    </Marker>
  );
}

