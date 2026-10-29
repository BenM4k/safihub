"use client";

import { Image as ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { CoverPhotoSection } from "./cover-photo-section";
import { LogoPhotoSection } from "./logo-photo-section";
import type { HouseRecord } from "@/dal";

interface PhotoCardProps {
  house: HouseRecord;
}

export function PhotoCard({ house }: PhotoCardProps) {
  const t = useTranslations("house.settingsPhotos");

  return (
    <section className="py-2 space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="size-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">{t("title")}</h2>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300">{t("subtitle")}</p>

      <div className="p-4 sm:p-5 rounded-2xl bg-card space-y-5">
        <CoverPhotoSection
          houseId={house.id}
          initialCoverUrl={house.coverImageUrl}
        />

        <LogoPhotoSection
          houseId={house.id}
          houseName={house.name}
          initialLogoUrl={house.logoUrl}
        />
      </div>
    </section>
  );
}
