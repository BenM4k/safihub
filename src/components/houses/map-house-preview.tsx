"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, X, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CustomerHouseSummary } from "@/dal";

interface MapHousePreviewProps {
  activeHouse: CustomerHouseSummary;
  onClose: () => void;
}

export function MapHousePreview({ activeHouse, onClose }: MapHousePreviewProps) {
  const t = useTranslations("customerHouses");

  return (
    <div className="absolute bottom-6 right-4 z-30 w-72 rounded-2xl bg-card p-3 shadow-2xl border border-border animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="relative size-12 rounded-xl overflow-hidden bg-muted shrink-0">
            <Image
              src={activeHouse.imageUrl}
              alt={activeHouse.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-heading truncate">
              {activeHouse.name}
            </h4>
            <p className="text-[11px] text-muted-foreground truncate">
              {activeHouse.neighborhoodName}
            </p>
            {activeHouse.rating !== null && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                <Star className="size-3 fill-amber-500 text-amber-500" />
                <span>{activeHouse.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-0.5 rounded-full cursor-pointer"
          aria-label="Fermer"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
        <span className="text-xs font-black text-heading">
          Min. {activeHouse.minimumOrderAmount.toLocaleString("fr-FR")} CDF
        </span>
        <Link
          href={`/houses/${activeHouse.slug || activeHouse.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-2xs transition"
        >
          <span>{t("selectHouse")}</span>
          <Sparkles className="size-3" />
        </Link>
      </div>
    </div>
  );
}
