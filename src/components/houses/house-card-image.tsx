"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "@ui-sdk/react/toast";
import { normalizeStorageUrl } from "@/lib/storage-url";
import { DEFAULT_IMAGE_BLUR_DATA_URL } from "@/lib/image-blur";
import {
  extractClosingTimeDisplay,
  formatHoursRangeDisplay,
} from "@/lib/hours-utils";

interface HouseCardImageProps {
  imageUrl: string;
  name: string;
  isOpenNow: boolean;
  todayHoursText: string;
  targetSlug: string;
  priority?: boolean;
}

/**
 * Full-bleed background cover photo with contrast scrim, top-left open status
 * pill, and top-right favorite/share actions for a partner house card.
 */
export function HouseCardImage({
  imageUrl,
  name,
  isOpenNow,
  todayHoursText,
  targetSlug,
  priority = false,
}: HouseCardImageProps) {
  const t = useTranslations("customerHouses");
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const displayUrl = normalizeStorageUrl(imageUrl) || imageUrl;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/houses/${targetSlug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `Pressing ${name} à Bukavu`,
          url,
        });
      } catch {
        // Ignored if cancelled
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Lien copié dans le presse-papier !");
      } catch {
        toast.error("Impossible de copier le lien");
      }
    } else {
      toast.error("Presse-papier indisponible");
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !isFavorited;
    setIsFavorited(next);
    if (next) {
      toast.success(`${name} ajouté aux favoris`);
    }
  };

  return (
    <>
      {/* Full-bleed Background Image */}
      <Image
        src={displayUrl}
        alt={name}
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        placeholder="blur"
        blurDataURL={DEFAULT_IMAGE_BLUR_DATA_URL}
        onLoad={() => setIsLoaded(true)}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={`object-cover transition-all duration-500 group-hover:scale-105 ${
          isLoaded ? "blur-0 scale-100" : "blur-md scale-105"
        }`}
      />

      {/* Multi-stop Scrim for WCAG-AA+ Contrast Even on Pure White Images */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,0.96)_0%,rgba(2,6,23,0.88)_40%,rgba(2,6,23,0.5)_68%,rgba(2,6,23,0.34)_100%)] transition-opacity duration-300"
      />

      {/* Top Overlay Bar: Status Badge & Quick Actions */}
      <div className="relative z-20 flex items-start justify-between gap-2 p-3.5">
        {isOpenNow ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-700/95 text-white shadow-md backdrop-blur-md border border-white/20">
            <span className="size-1.5 rounded-full bg-white animate-pulse" />
            <span>
              {extractClosingTimeDisplay(todayHoursText)
                ? t("openUntil", {
                    time: extractClosingTimeDisplay(todayHoursText)!,
                  })
                : t("openNow")}
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-950/80 text-white border border-white/20 shadow-md backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-rose-400" />
            <span>{t("closed")}</span>
            {todayHoursText &&
              !todayHoursText.toLowerCase().includes("fermé") && (
                <span className="text-white/80 font-normal">
                  ({formatHoursRangeDisplay(todayHoursText)})
                </span>
              )}
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFavorite}
            aria-label="Ajouter aux favoris"
            className="size-8 rounded-full bg-slate-950/65 hover:bg-slate-950/85 backdrop-blur-md text-white border border-white/20 shadow-md flex items-center justify-center transition cursor-pointer"
          >
            <Heart
              className={`size-4 transition ${
                isFavorited ? "fill-rose-500 text-rose-500" : "text-white"
              }`}
            />
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Partager ce pressing"
            className="size-8 rounded-full bg-slate-950/65 hover:bg-slate-950/85 backdrop-blur-md text-white border border-white/20 shadow-md flex items-center justify-center transition cursor-pointer"
          >
            <Share2 className="size-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
