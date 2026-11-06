"use client";

import { useEffect, useState } from "react";
import { LocateFixed, MapPin, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEFAULT_NEARBY_RADIUS_KM,
  type LatLng,
} from "@/lib/validations/location";

export const USER_COORDS_STORAGE_KEY = "safihub_user_coords";
const PROMPT_STORAGE_KEY = "safihub_geo_prompt_seen";
const RADIUS_ACTIVE_STORAGE_KEY = "safihub_radius_filter_active";
const RADIUS_KM_STORAGE_KEY = "safihub_radius_km";

// Module-level in-memory flag so client-side soft navigations back to `/houses`
// know immediately in 0ms without even touching storage or mounting the Dialog.
let hasSeenPromptInMemory = false;

export function getCachedUserCoords(): LatLng | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(USER_COORDS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { lat?: unknown; lng?: unknown };
    if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
      return { lat: parsed.lat, lng: parsed.lng };
    }
  } catch {
    // Ignore storage/parse errors
  }
  return null;
}

export function isRadiusFilterSavedActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(RADIUS_ACTIVE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setRadiusFilterSavedActive(active: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(RADIUS_ACTIVE_STORAGE_KEY, active ? "1" : "0");
  } catch {
    // Ignore storage errors
  }
}

export function getSavedRadiusKm(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(RADIUS_KM_STORAGE_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function setSavedRadiusKm(radiusKm: number | null): void {
  if (typeof window === "undefined") return;
  try {
    if (radiusKm === null) {
      window.sessionStorage.removeItem(RADIUS_KM_STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(RADIUS_KM_STORAGE_KEY, String(radiusKm));
    }
  } catch {
    // Ignore storage errors
  }
}

export function saveCachedUserCoords(coords: LatLng): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      USER_COORDS_STORAGE_KEY,
      JSON.stringify(coords)
    );
    setRadiusFilterSavedActive(true);
  } catch {
    // Ignore storage errors
  }
}

interface LocationPermissionModalProps {
  onLocationResolved: (coords: LatLng) => void;
}

export function LocationPermissionModal({
  onLocationResolved,
}: LocationPermissionModalProps) {
  const t = useTranslations("mapLocation");
  const [open, setOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (hasSeenPromptInMemory) return;
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      hasSeenPromptInMemory = true;
      return;
    }

    try {
      if (window.sessionStorage.getItem(PROMPT_STORAGE_KEY) === "1") {
        hasSeenPromptInMemory = true;
        return;
      }
    } catch {
      // Ignore storage access errors in strict privacy mode
    }

    const timer = window.setTimeout(() => setOpen(true), 150);
    return () => window.clearTimeout(timer);
  }, []);

  const markPromptSeen = () => {
    hasSeenPromptInMemory = true;
    try {
      window.sessionStorage.setItem(PROMPT_STORAGE_KEY, "1");
    } catch {
      // Ignore storage errors
    }
  };

  const handleDecline = () => {
    markPromptSeen();
    setOpen(false);
  };

  const handleAllow = () => {
    markPromptSeen();
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setErrorText(t("geoUnsupported"));
      return;
    }

    setIsRequesting(true);
    setErrorText(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        };
        saveCachedUserCoords(coords);
        setIsRequesting(false);
        setOpen(false);
        onLocationResolved(coords);
      },
      () => {
        setIsRequesting(false);
        setErrorText(t("geoDenied"));
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
    );
  };

  // Do not mount the Radix Dialog tree at all when closed
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleDecline();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-2">
          <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <LocateFixed className="size-5" />
          </div>
          <DialogTitle className="text-base font-black text-heading">
            {t("permissionModalTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {t("permissionModalDesc", { radiusKm: DEFAULT_NEARBY_RADIUS_KM })}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-muted/40 border border-border/60 p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
          <span>{t("permissionModalPrivacyNote")}</span>
        </div>

        {errorText && (
          <p className="text-xs font-semibold text-destructive">{errorText}</p>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleDecline}
            disabled={isRequesting}
            className="w-full sm:w-auto text-xs font-semibold"
          >
            {t("permissionModalSkip")}
          </Button>
          <Button
            type="button"
            onClick={handleAllow}
            disabled={isRequesting}
            className="w-full sm:w-auto text-xs font-bold gap-1.5"
          >
            <MapPin className="size-3.5" />
            <span>
              {isRequesting
                ? t("locating")
                : t("permissionModalAllow", {
                    radiusKm: DEFAULT_NEARBY_RADIUS_KM,
                  })}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
