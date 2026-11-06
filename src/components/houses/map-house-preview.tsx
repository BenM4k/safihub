"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, X, ArrowUpRight, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CustomerHouseSummary } from "@/dal";
import { DEFAULT_IMAGE_BLUR_DATA_URL } from "@/lib/image-blur";
import { normalizeStorageUrl } from "@/lib/storage-url";
import { extractClosingTimeDisplay, formatHoursRangeDisplay } from "@/lib/hours-utils";

interface MapHousePreviewProps {
  activeHouse: CustomerHouseSummary;
  onClose: () => void;
}

export function MapHousePreview({
  activeHouse,
  onClose,
}: MapHousePreviewProps) {
  const t = useTranslations("customerHouses");
  const [isLoaded, setIsLoaded] = useState(false);

  const targetSlug = activeHouse.slug || activeHouse.id;
  const displayUrl =
    normalizeStorageUrl(activeHouse.imageUrl) || activeHouse.imageUrl;
  const locationText = [
    activeHouse.neighborhoodName,
    activeHouse.zoneName,
    activeHouse.addressNote,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="absolute bottom-5 right-4 left-4 sm:left-auto z-30 sm:w-80 rounded-2xl bg-card shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      {/* Top House Picture + Open/Closed Status + Close Button */}
      <div className="relative h-32 w-full bg-muted overflow-hidden">
        <Image
          key={displayUrl}
          src={displayUrl}
          alt={activeHouse.name}
          fill
          loading="lazy"
          decoding="async"
          placeholder="blur"
          blurDataURL={DEFAULT_IMAGE_BLUR_DATA_URL}
          onLoad={() => setIsLoaded(true)}
          sizes="320px"
          className={`object-cover transition-all duration-300 ${
            isLoaded ? "blur-0 scale-100" : "blur-sm scale-105"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

        {/* Open / Closed Status Badge */}
        <div className="absolute top-2.5 left-2.5">
          {activeHouse.isOpenNow ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600/95 text-white shadow-2xs backdrop-blur-xs">
              <span className="size-1.5 rounded-full bg-white animate-pulse" />
              <span>
                {extractClosingTimeDisplay(activeHouse.todayHoursText)
                  ? t("openUntil", {
                      time: extractClosingTimeDisplay(activeHouse.todayHoursText)!,
                    })
                  : t("openNow")}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/90 text-white border border-white/20 shadow-2xs backdrop-blur-xs">
              <span className="size-1.5 rounded-full bg-rose-400" />
              <span>{t("closed")}</span>
            </span>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 size-7 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
          aria-label="Fermer"
        >
          <X className="size-3.5" />
        </button>

        {/* House Name overlaid at bottom of image */}
        <div className="absolute bottom-2.5 left-3 right-3">
          <h4 className="text-sm font-black text-white truncate drop-shadow-xs">
            {activeHouse.name}
          </h4>
        </div>
      </div>

      {/* Card Body: Location, Hours & Link to Partner Public Page */}
      <div className="p-3.5 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-start gap-1.5 text-xs text-foreground font-medium">
            <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
            <span className="line-clamp-2">{locationText}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="size-3 shrink-0" />
            <span>{formatHoursRangeDisplay(activeHouse.todayHoursText)}</span>
          </div>
        </div>

        <Link
          href={`/houses/${targetSlug}`}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-2xs transition"
        >
          <span>{t("selectHouse")}</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
