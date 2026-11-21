"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, MapPin, Truck, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CustomerHouseSummary } from "@/dal";
import { AVATAR_BLUR_DATA_URL } from "@/lib/image-blur";
import { HouseCardImage } from "./house-card-image";

interface HouseCardProps {
  house: CustomerHouseSummary;
  isHighlighted?: boolean;
  priority?: boolean;
  onHover?: (id: string | null) => void;
}

/**
 * Full-bleed photo marketplace card for a partner laundry house, overlaying
 * identity, rating, location, operational metadata, services, and CTA over the cover image.
 */
export const HouseCard = memo(function HouseCard({
  house,
  isHighlighted,
  priority = false,
  onHover,
}: HouseCardProps) {
  const t = useTranslations("customerHouses");
  const targetSlug = house.slug || house.id;
  const houseHref = `/houses/${targetSlug}`;
  const visibleServices = house.availableServices.slice(0, 2);
  const extraServicesCount = Math.max(0, house.availableServices.length - 2);

  return (
    <article
      onMouseEnter={() => onHover?.(house.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group relative flex flex-col justify-between min-h-[300px] sm:min-h-[320px] rounded-2xl bg-slate-950 border transition-all duration-300 overflow-hidden hover-lift ${
        isHighlighted
          ? "border-primary ring-2 ring-primary/40 shadow-2xl"
          : "border-border shadow-lg hover:border-primary/40 hover:shadow-xl"
      }`}
    >
      {/* Full-bleed Background Image, Gradient Scrim & Top Bar */}
      <HouseCardImage
        imageUrl={house.imageUrl}
        name={house.name}
        isOpenNow={house.isOpenNow}
        todayHoursText={house.todayHoursText}
        targetSlug={targetSlug}
        priority={priority}
      />

      {/* Bottom Details Overlay */}
      <div className="relative z-10 mt-auto p-4 pt-12 flex flex-col gap-3 text-white">
        {/* Identity & Rating */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {house.logoUrl && (
              <div className="relative size-10 rounded-xl overflow-hidden border border-white/25 shrink-0 bg-white/95 shadow-sm">
                <Image
                  src={house.logoUrl}
                  alt={`Logo ${house.name}`}
                  fill
                  loading="lazy"
                  decoding="async"
                  placeholder="blur"
                  blurDataURL={AVATAR_BLUR_DATA_URL}
                  sizes="40px"
                  className="object-contain p-1"
                />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white leading-tight tracking-tight line-clamp-1 drop-shadow-xs">
                {house.name}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-white/85 line-clamp-1">
                <MapPin className="size-3 shrink-0 text-white/75" />
                <span className="truncate">
                  {house.neighborhoodName}, {house.zoneName}
                  {house.addressNote ? ` · ${house.addressNote}` : ""}
                </span>
              </p>
            </div>
          </div>

          {house.rating !== null && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/20 text-xs font-bold text-white shrink-0 tabular-nums shadow-sm">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span>{house.rating.toFixed(1)}</span>
              <span className="font-normal text-white/75">
                ({house.reviewCount})
              </span>
            </div>
          )}
        </div>

        {/* Turnaround & Delivery Metadata */}
        <div className="flex items-center flex-wrap gap-x-3.5 gap-y-1 text-xs font-medium text-white/90">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-white/80 shrink-0" />
            {t("turnaroundHours", { hours: house.turnaroundHours })}
          </span>

          {house.estimatedDeliveryFee !== undefined &&
            house.estimatedDeliveryFee !== null && (
              <span className="inline-flex items-center gap-1.5 text-white/85">
                <Truck className="size-3.5 text-white/80 shrink-0" />
                {t("deliveryFee", {
                  amount: `${house.estimatedDeliveryFee.toLocaleString("fr-FR")} CDF`,
                })}
              </span>
            )}
        </div>

        {/* Footer: Services & Action CTA */}
        <div className="pt-3 border-t border-white/20 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {visibleServices.map((s) => (
              <span
                key={s.slug}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-950/65 backdrop-blur-sm text-white border border-white/20 truncate max-w-[120px]"
              >
                {s.nameFr}
              </span>
            ))}
            {extraServicesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-950/65 backdrop-blur-sm text-white/90 border border-white/20">
                +{extraServicesCount}
              </span>
            )}
          </div>

          <Link
            href={houseHref}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-primary hover:text-primary-foreground text-xs font-bold shadow-md transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <span>{t("selectHouse")}</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
});
