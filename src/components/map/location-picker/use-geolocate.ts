"use client";

import { useCallback, useState } from "react";
import { isWithinBukavuBounds, type LatLng } from "@/lib/validations/location";

export function useGeolocate(onLocated: (coords: LatLng) => void) {
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const requestGeolocation = useCallback(
    (errorMessages: {
      unsupported: string;
      outsideBukavu: string;
      denied: string;
    }) => {
      if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
        setGeoError(errorMessages.unsupported);
        return;
      }

      setIsLocating(true);
      setGeoError(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const candidate = {
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
          };
          if (!isWithinBukavuBounds(candidate)) {
            setGeoError(errorMessages.outsideBukavu);
            return;
          }
          onLocated(candidate);
        },
        () => {
          setIsLocating(false);
          setGeoError(errorMessages.denied);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    },
    [onLocated]
  );

  return { isLocating, geoError, setGeoError, requestGeolocation };
}

