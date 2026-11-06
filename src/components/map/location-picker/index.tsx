"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import {
  CheckCircle2,
  ExternalLink,
  LocateFixed,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LazyMap } from "../lazy-map";
import { useGeolocate } from "./use-geolocate";

const DynamicDraggablePin = dynamic(
  () => import("./draggable-pin").then((mod) => mod.DraggablePin),
  { ssr: false }
);
import {
  BUKAVU_DEFAULT_CENTER,
  isWithinBukavuBounds,
  type LatLng,
} from "@/lib/validations/location";
import type { Result } from "@/lib/result";

interface LocationPickerProps {
  initialCoords?: {
    lat: number;
    lng: number;
    isApproximate?: boolean;
  } | null;
  onSave: (coords: LatLng | null) => Promise<Result<void>>;
  title?: string;
  subtitle?: string;
}

export function LocationPicker({
  initialCoords,
  onSave,
  title,
  subtitle,
}: LocationPickerProps) {
  const t = useTranslations("mapLocation");
  const startLat = initialCoords?.lat ?? BUKAVU_DEFAULT_CENTER.lat;
  const startLng = initialCoords?.lng ?? BUKAVU_DEFAULT_CENTER.lng;

  const [coords, setCoords] = useState<LatLng>({ lat: startLat, lng: startLng });
  const [isApproximate, setIsApproximate] = useState<boolean>(
    initialCoords?.isApproximate ?? true
  );
  const [hasUnsavedPin, setHasUnsavedPin] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelectCoords = (next: LatLng) => {
    if (!isWithinBukavuBounds(next)) {
      setFeedback({ kind: "error", text: t("outsideBukavu") });
      return;
    }
    setCoords(next);
    setHasUnsavedPin(true);
    setFeedback(null);
  };

  const { isLocating, geoError, requestGeolocation } =
    useGeolocate((located) => {
      setIsMapOpen(true);
      handleSelectCoords(located);
    });

  const handleSavePin = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await onSave(coords);
      if (!res.ok) {
        setFeedback({ kind: "error", text: res.error });
        return;
      }
      setIsApproximate(false);
      setHasUnsavedPin(false);
      setFeedback({ kind: "success", text: t("savedSuccess") });
    });
  };

  const handleResetToCentroid = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await onSave(null);
      if (!res.ok) {
        setFeedback({ kind: "error", text: res.error });
        return;
      }
      setIsApproximate(true);
      setHasUnsavedPin(false);
      setFeedback({ kind: "success", text: t("resetSuccess") });
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary" />
            <span>{title ?? t("pickerTitle")}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {subtitle ?? t("pickerHint")}
          </p>
        </div>
        <Badge
          variant="outline"
          className={
            isApproximate
              ? "border-amber-500/30 text-amber-800 dark:text-amber-300 text-[10px] font-bold"
              : "border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold"
          }
        >
          {isApproximate ? t("approximateBadge") : t("confirmedBadge")}
        </Badge>
      </div>

      {/* Coordinates & Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <span>
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline font-sans font-semibold"
          >
            <span>{t("openExternalMap")}</span>
            <ExternalLink className="size-3" />
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLocating || isPending}
            onClick={() =>
              requestGeolocation({
                unsupported: t("geoUnsupported"),
                outsideBukavu: t("outsideBukavu"),
                denied: t("geoDenied"),
              })
            }
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <LocateFixed className="size-3.5" />
            <span>{isLocating ? t("locating") : t("useMyPosition")}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsMapOpen((prev) => !prev)}
            className="h-8 text-xs font-semibold"
          >
            {isMapOpen ? t("hideInteractiveMap") : t("adjustOnMap")}
          </Button>
        </div>
      </div>

      {/* Lazy Interactive Map Canvas */}
      {isMapOpen && (
        <div className="h-64 w-full rounded-xl overflow-hidden border border-border">
          <LazyMap
            enabled={isMapOpen}
            center={coords}
            zoom={15}
            onMapClick={handleSelectCoords}
            loadingLabel={t("loadingMap")}
          >
            <DynamicDraggablePin
              coords={coords}
              onChange={handleSelectCoords}
              onOutOfBounds={() =>
                setFeedback({ kind: "error", text: t("outsideBukavu") })
              }
            />
          </LazyMap>
        </div>
      )}

      {(geoError || feedback) && (
        <div
          className={`flex items-center gap-1.5 text-[11px] font-semibold ${
            geoError || feedback?.kind === "error"
              ? "text-destructive"
              : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {feedback?.kind === "success" && <CheckCircle2 className="size-3.5" />}
          <span>{geoError ?? feedback?.text}</span>
        </div>
      )}

      {/* Save / Reset Controls */}
      {(hasUnsavedPin || !isApproximate) && (
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/60">
          {!isApproximate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={handleResetToCentroid}
              className="h-8 text-xs font-semibold gap-1 text-muted-foreground"
            >
              <RotateCcw className="size-3" />
              <span>{t("resetToNeighborhood")}</span>
            </Button>
          )}
          {hasUnsavedPin && (
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={handleSavePin}
              className="h-8 text-xs font-bold"
            >
              {isPending ? t("savingPin") : t("savePin")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

