"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Share2, Star, Clock, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CustomerHouseSummary } from "@/dal";

interface HouseCardProps {
  house: CustomerHouseSummary;
  isHighlighted?: boolean;
  onHover?: (id: string | null) => void;
}

export function HouseCard({ house, isHighlighted, onHover }: HouseCardProps) {
  const t = useTranslations("customerHouses");
  const [isFavorited, setIsFavorited] = useState(false);

  const targetSlug = house.slug || house.id;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: house.name,
          text: `Pressing ${house.name} à Bukavu`,
          url: `${window.location.origin}/houses/${targetSlug}`,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      navigator.clipboard?.writeText(`${window.location.origin}/houses/${targetSlug}`);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited((prev) => !prev);
  };

  return (
    <div
      onMouseEnter={() => onHover?.(house.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group flex flex-col rounded-2xl bg-card border transition-all overflow-hidden ${
        isHighlighted
          ? "border-primary ring-2 ring-primary/20 shadow-md"
          : "border-border hover:border-border-strong hover:shadow-xs"
      }`}
    >
      {/* Top Image Container matching house-search.png */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <Image
          src={house.imageUrl}
          alt={house.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top-left Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          {house.isOpenNow ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600/95 text-white shadow-2xs backdrop-blur-xs">
              <span className="size-1.5 rounded-full bg-white animate-pulse" />
              <span>{t("openNow")}</span>
              <span className="text-white/80 font-normal">({house.todayHoursText})</span>
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

      {/* Card Content Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Large Bold Price & Estimated Delivery Fee */}
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <div className="text-xl font-black text-heading tracking-tight">
            {house.minimumOrderAmount > 0 ? (
              <span>
                <span className="text-xs font-semibold text-muted-foreground mr-1">{t("minOrderLabel")}</span>
                {house.minimumOrderAmount.toLocaleString("fr-FR")} CDF
              </span>
            ) : (
              <span>
                <span className="text-xs font-semibold text-muted-foreground mr-1">{t("startingFrom")}</span>
                {house.minItemPriceCdf.toLocaleString("fr-FR")} CDF
              </span>
            )}
          </div>
          {house.estimatedDeliveryFee !== undefined && house.estimatedDeliveryFee !== null && (
            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-md border border-border/40 shrink-0">
              {t("deliveryFee", { amount: `${house.estimatedDeliveryFee.toLocaleString("fr-FR")} CDF` })}
            </span>
          )}
        </div>

        {/* Specs row: turnaround, capacity, rating */}
        <div className="flex items-center flex-wrap gap-x-2 text-xs text-muted-foreground font-medium mb-2">
          <span className="inline-flex items-center gap-1 text-foreground">
            <Clock className="size-3 text-muted-foreground" />
            {t("turnaroundHours", { hours: house.turnaroundHours })}
          </span>
          <span>•</span>
          <span className="text-muted-foreground">
            {house.dailyCapacity ? t("dailyCapacityAvailable") : t("unlimitedCapacity")}
          </span>
          {house.rating !== null && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                <Star className="size-3 fill-amber-500 text-amber-500" />
                {house.rating.toFixed(1)}
                <span className="font-normal text-muted-foreground">({house.reviewCount})</span>
              </span>
            </>
          )}
        </div>

        {/* House Name */}
        <Link
          href={`/houses/${targetSlug}`}
          className="text-base font-bold text-heading group-hover:text-primary transition line-clamp-1 mb-0.5"
        >
          {house.name}
        </Link>

        {/* Address & Zone */}
        <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
          {house.neighborhoodName}, {house.zoneName}
          {house.addressNote ? ` · ${house.addressNote}` : ""}
        </p>

        {/* Services Badges & CTA */}
        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-wrap overflow-hidden">
            {house.availableServices.slice(0, 3).map((s) => (
              <span
                key={s.slug}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-secondary text-muted-foreground border border-border/40"
              >
                {s.nameFr}
              </span>
            ))}
          </div>

          <Link
            href={`/houses/${targetSlug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition shrink-0"
          >
            <span>{t("selectHouse")}</span>
            <Sparkles className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
