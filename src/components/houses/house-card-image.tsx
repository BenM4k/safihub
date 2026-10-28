"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { normalizeStorageUrl } from "@/lib/storage-url";

interface HouseCardImageProps {
  imageUrl: string;
  name: string;
  isOpenNow: boolean;
  todayHoursText: string;
  targetSlug: string;
}

export function HouseCardImage({
  imageUrl,
  name,
  isOpenNow,
  todayHoursText,
  targetSlug,
}: HouseCardImageProps) {
  const t = useTranslations("customerHouses");
  const [isFavorited, setIsFavorited] = useState(false);
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
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
      <Image
        src={displayUrl}
        alt={name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Top-left Status Badge */}
      <div className="absolute top-3 left-3 z-10">
        {isOpenNow ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600/95 text-white shadow-2xs backdrop-blur-xs">
            <span className="size-1.5 rounded-full bg-white animate-pulse" />
            <span>{t("openNow")}</span>
            <span className="text-white/80 font-normal">({todayHoursText})</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/90 text-white border border-white/20 shadow-2xs backdrop-blur-xs">
            <span>{t("closed")}</span>
          </span>
        )}
      </div>

      {/* Top-right Actions: Heart & Share Buttons */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleFavorite}
          aria-label="Ajouter aux favoris"
          className="size-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition cursor-pointer"
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
          className="size-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition cursor-pointer"
        >
          <Share2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
