"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CustomerHouseSummary } from "@/dal";
import { HouseCardImage } from "./house-card-image";

interface HouseCardProps {
  house: CustomerHouseSummary;
  isHighlighted?: boolean;
  onHover?: (id: string | null) => void;
}

export function HouseCard({ house, isHighlighted, onHover }: HouseCardProps) {
  const t = useTranslations("customerHouses");
  const targetSlug = house.slug || house.id;

  return (
    <div
      onMouseEnter={() => onHover?.(house.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group flex flex-col rounded-2xl bg-card border transition-all overflow-hidden hover-lift ${
        isHighlighted
          ? "border-primary ring-2 ring-primary/20 shadow-md"
          : "border-border hover:border-border-strong hover:shadow-xs"
      }`}
    >
      {/* Top Image Container with badges and actions */}
      <HouseCardImage
        imageUrl={house.imageUrl}
        name={house.name}
        isOpenNow={house.isOpenNow}
        todayHoursText={house.todayHoursText}
        targetSlug={targetSlug}
      />

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

        {/* House Name & Logo */}
        <div className="flex items-center gap-2 mb-0.5">
          {house.logoUrl && (
            <div className="relative size-6 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
              <Image
                src={house.logoUrl}
                alt={`Logo ${house.name}`}
                fill
                sizes="24px"
                className="object-contain"
              />
            </div>
          )}
          <Link
            href={`/houses/${targetSlug}`}
            className="text-base font-bold text-heading group-hover:text-primary transition line-clamp-1"
          >
            {house.name}
          </Link>
        </div>

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
