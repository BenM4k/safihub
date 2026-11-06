"use client";

import type { MapSurfaceStyle } from "./map-config";

interface MapStyleToggleProps {
  value: MapSurfaceStyle;
  onChange: (next: MapSurfaceStyle) => void;
  planLabel: string;
  satelliteLabel: string;
}

export function MapStyleToggle({
  value,
  onChange,
  planLabel,
  satelliteLabel,
}: MapStyleToggleProps) {
  return (
    <div className="inline-flex p-0.5 bg-card/95 border border-border backdrop-blur-md shadow-md rounded-full text-xs font-bold text-foreground">
      <button
        type="button"
        onClick={() => onChange("map")}
        className={`px-3 py-1 rounded-full transition cursor-pointer ${
          value === "map"
            ? "bg-primary text-white shadow-2xs"
            : "hover:text-primary"
        }`}
      >
        {planLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange("satellite")}
        className={`px-3 py-1 rounded-full transition cursor-pointer ${
          value === "satellite"
            ? "bg-primary text-white shadow-2xs"
            : "hover:text-primary"
        }`}
      >
        {satelliteLabel}
      </button>
    </div>
  );
}

