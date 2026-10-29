"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { PressingVerifiedPopover } from "./pressing-verified-popover";
import { PressingShareButton } from "./pressing-share-button";
import type { CustomerHouseDetailData } from "@/dal";

interface PressingIdentityHeaderProps {
  house: CustomerHouseDetailData["house"];
}

export function PressingIdentityHeader({ house }: PressingIdentityHeaderProps) {
  const t = useTranslations("customerHouses");

  return (
    <div className="w-full bg-card border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-18 pb-6">
        {/* Top bar with back navigation & share */}
        <div className="flex items-center justify-between mb-3">
          <Link
            href="/houses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition group"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>{t("backToHouses")}</span>
          </Link>

          <PressingShareButton name={house.name} />
        </div>

        {/* Identity Details */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            {/* Title & Verified Badge */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-heading tracking-tight">
                {house.name}
              </h1>
              <PressingVerifiedPopover />
            </div>

            {/* Metadata row: Location, Rating, Live Status */}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <span className="inline-flex items-center gap-1 text-foreground">
                <MapPin className="size-3.5 text-muted-foreground" />
                {house.neighborhoodName}, {house.zoneName}
              </span>

              <span>•</span>

              {/* Rating summary */}
              {house.rating !== null ? (
                <a
                  href="#avis"
                  className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition"
                >
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  <span>{house.rating.toFixed(1)}</span>
                  <span className="font-normal text-muted-foreground underline decoration-border">
                    ({house.reviewCount} {t("ratingSummaryText", { count: house.reviewCount })})
                  </span>
                </a>
              ) : (
                <a
                  href="#avis"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success-soft/30 border border-success/20 text-success font-bold text-[11px]"
                >
                  <Star className="size-3 text-success" />
                  <span>{t("newBadge")}</span>
                </a>
              )}

              <span>•</span>

              {/* Live Status */}
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5 text-muted-foreground" />
                {house.isPaused ? (
                  <span className="text-amber-700 dark:text-amber-300 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                    {t("temporarilyPaused")}
                  </span>
                ) : house.isOpenNow ? (
                  <span className="text-success font-bold bg-success-soft/30 border border-success/20 px-2.5 py-0.5 rounded-full">
                    {t("openNow")} ({house.todayHoursText})
                  </span>
                ) : (
                  <span className="text-muted-foreground font-bold bg-muted px-2.5 py-0.5 rounded-full">
                    {t("closed")} ({house.todayHoursText})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
