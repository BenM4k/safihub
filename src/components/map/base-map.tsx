"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MapPin } from "lucide-react";
import * as maplibregl from "maplibre-gl";
import Map, {
  Marker,
  NavigationControl,
  type MapRef,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import { isWithinBukavuBounds } from "@/lib/validations/location";
import {
  BUKAVU_MAX_BOUNDS,
  BUKAVU_VIEWPORT,
  resolveMapStyleUrl,
  type MapSurfaceStyle,
} from "./map-config";

// Configure MapLibre's Web Worker URL explicitly so Next.js 16 Turbopack
// doesn't rewrite `import.meta.url` to a non-existent `/_next/static/chunks/maplibre-gl-worker.mjs`.
if (typeof window !== "undefined") {
  maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");
}

export interface BaseMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  styleMode?: MapSurfaceStyle;
  interactive?: boolean;
  showNavigationControl?: boolean;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  pinMarker?: { lat: number; lng: number; label: string };
  children?: ReactNode;
  className?: string;
}

export function BaseMap({
  center,
  zoom = BUKAVU_VIEWPORT.zoom,
  styleMode = "map",
  interactive = true,
  showNavigationControl = true,
  onMapClick,
  pinMarker,
  children,
  className = "",
}: BaseMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  // Gate `<Marker>` children on MapLibre's `onLoad` / `onRemove` lifecycle events so
  // markers never attach to a destroyed map instance when Next.js 16 `<Activity>`
  // unmounts and remounts effects across client-side navigations.
  const [isMapReady, setIsMapReady] = useState(false);
  const mapStyle = resolveMapStyleUrl(styleMode);

  // Smoothly fly/recenter the map whenever `center` changes (e.g. when the user
  // consents to share their GPS position or resets the 5 km filter).
  const centerLat = center?.lat;
  const centerLng = center?.lng;
  useEffect(() => {
    if (!isMapReady || centerLat === undefined || centerLng === undefined) {
      return;
    }
    mapRef.current?.flyTo({
      center: [centerLng, centerLat],
      zoom,
      duration: 850,
    });
  }, [isMapReady, centerLat, centerLng, zoom]);

  const effectiveMaxBounds =
    center && !isWithinBukavuBounds(center) ? undefined : BUKAVU_MAX_BOUNDS;

  const handleClick = (evt: MapLayerMouseEvent) => {
    if (!onMapClick) return;
    onMapClick({
      lat: Number(evt.lngLat.lat.toFixed(6)),
      lng: Number(evt.lngLat.lng.toFixed(6)),
    });
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={{
          latitude: center?.lat ?? BUKAVU_VIEWPORT.latitude,
          longitude: center?.lng ?? BUKAVU_VIEWPORT.longitude,
          zoom,
        }}
        minZoom={BUKAVU_VIEWPORT.minZoom}
        maxZoom={BUKAVU_VIEWPORT.maxZoom}
        maxBounds={effectiveMaxBounds}
        mapStyle={mapStyle}
        interactive={interactive}
        onClick={handleClick}
        onLoad={() => setIsMapReady(true)}
        onRemove={() => setIsMapReady(false)}
        attributionControl={{ compact: true }}
        style={{ width: "100%", height: "100%" }}
      >
        {showNavigationControl && (
          <NavigationControl position="bottom-left" showCompass={false} />
        )}
        {isMapReady && pinMarker && (
          <Marker
            latitude={pinMarker.lat}
            longitude={pinMarker.lng}
            anchor="bottom"
          >
            <div className="flex flex-col items-center">
              <div className="px-2.5 py-1 rounded-full bg-primary text-white text-xs font-black shadow-lg flex items-center gap-1 ring-4 ring-primary/30">
                <MapPin className="size-3.5" />
                <span className="max-w-[160px] truncate">
                  {pinMarker.label}
                </span>
              </div>
              <div className="w-0.5 h-2 bg-primary" />
              <div className="size-2 rounded-full bg-primary/60" />
            </div>
          </Marker>
        )}
        {isMapReady && children}
      </Map>
    </div>
  );
}
