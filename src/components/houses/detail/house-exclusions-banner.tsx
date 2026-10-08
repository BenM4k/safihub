"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CustomerHouseDetailData } from "@/dal";

interface HouseExclusionsBannerProps {
  exclusions: CustomerHouseDetailData["exclusions"];
}

export function HouseExclusionsBanner({ exclusions }: HouseExclusionsBannerProps) {
  const t = useTranslations("customerHouses");

  if (!exclusions || exclusions.length === 0) return null;

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-start gap-3 text-amber-900">
        <AlertCircle className="size-4 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-xs leading-relaxed">
          <strong className="font-bold mr-1">{t("exclusionsNotice")}</strong>
          <span className="text-amber-800">
            {exclusions.map((ex, i) => {
              const target = ex.itemNameFr || ex.fabricNameFr || "Article spécifique";
              const note = ex.note ? ` (${ex.note})` : "";
              return (
                <span key={i} className="inline-block mr-2 font-medium">
                  • {target}
                  {note}
                </span>
              );
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
