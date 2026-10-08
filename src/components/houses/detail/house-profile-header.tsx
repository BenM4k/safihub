"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, ShieldCheck, Star, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CustomerHouseDetailData } from "@/dal";

interface HouseProfileHeaderProps {
  house: CustomerHouseDetailData["house"];
}

export function HouseProfileHeader({ house }: HouseProfileHeaderProps) {
  const t = useTranslations("customerHouses");

  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Back navigation */}
        <Link
          href="/houses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition mb-4 group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>{t("backToHouses")}</span>
        </Link>

        {/* Hero banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative size-20 sm:size-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs">
              <Image
                src={house.imageUrl}
                alt={house.name}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {house.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-soft text-primary">
                  <ShieldCheck className="size-3" />
                  <span>{t("verifiedPartner")}</span>
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1 text-slate-700">
                  <MapPin className="size-3.5 text-slate-400" />
                  {house.neighborhoodName}, {house.zoneName}
                </span>
                {house.rating !== null && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      {house.rating.toFixed(1)}
                      <span className="font-normal text-slate-400">({house.reviewCount} avis)</span>
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-slate-700">
                  <Clock className="size-3.5 text-slate-400" />
                  {house.isOpenNow ? (
                    <span className="text-emerald-600 font-bold">
                      {t("openNow")} ({house.todayHoursText})
                    </span>
                  ) : (
                    <span className="text-slate-500 font-bold">
                      {t("closed")} ({house.todayHoursText})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Délai garanti
              </span>
              <span className="text-sm font-black text-slate-900">
                {t("turnaroundHours", { hours: house.turnaroundHours })}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Minimum commande
              </span>
              <span className="text-sm font-black text-slate-900">
                {house.minimumOrderAmount.toLocaleString("fr-FR")} CDF
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
