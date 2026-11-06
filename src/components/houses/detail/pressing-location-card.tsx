"use client";

import { useState } from "react";
import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LazyMap } from "@/components/map/lazy-map";
import { BUKAVU_DEFAULT_CENTER } from "@/lib/validations/location";

interface PressingLocationCardProps {
  houseName: string;
  neighborhoodName: string;
  zoneName?: string;
  coords?: {
    lat: number;
    lng: number;
    isApproximate?: boolean;
  };
}

export function PressingLocationCard({
  houseName,
  neighborhoodName,
  zoneName,
  coords,
}: PressingLocationCardProps) {
  const t = useTranslations("mapLocation");
  const [isMapOpen, setIsMapOpen] = useState(false);

  const lat = coords?.lat ?? BUKAVU_DEFAULT_CENTER.lat;
  const lng = coords?.lng ?? BUKAVU_DEFAULT_CENTER.lng;
  const isApproximate = coords?.isApproximate ?? true;

  return (
    <div className="pt-4 border-t border-border/60 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-heading">
            <MapPin className="size-4 text-primary shrink-0" />
            <span>{t("detailCardTitle")}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {isApproximate
              ? t("detailApproximateNote", { neighborhood: neighborhoodName })
              : t("detailConfirmedNote", { neighborhood: neighborhoodName })}
            {zoneName ? ` • ${zoneName}` : ""}
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

      {/* Actions: Click-to-load interactive map or open external directions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsMapOpen((prev) => !prev)}
          className="h-8 text-xs font-semibold gap-1.5"
        >
          <Navigation className="size-3.5 text-primary" />
          <span>
            {isMapOpen ? t("hideInteractiveMap") : t("showInteractiveMap")}
          </span>
        </Button>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition"
        >
          <span>{t("directionsExternal")}</span>
          <ExternalLink className="size-3.5 text-muted-foreground" />
        </a>
      </div>

      {isMapOpen && (
        <div className="h-60 w-full rounded-xl overflow-hidden border border-border">
          <LazyMap
            enabled={isMapOpen}
            center={{ lat, lng }}
            zoom={isApproximate ? 14 : 15.5}
            loadingLabel={t("loadingMap")}
            pinMarker={{ lat, lng, label: houseName }}
          />
        </div>
      )}
    </div>
  );
}

