"use client";

import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";

interface CoverageHeaderProps {
  coveredCount: number;
  totalCount: number;
}

export function CoverageHeader({ coveredCount, totalCount }: CoverageHeaderProps) {
  const t = useTranslations("house.coverage");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-border/60">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      <div className="self-start sm:self-auto shrink-0">
        <div
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20 shadow-2xs"
        >
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span>
            {t("summary", { covered: coveredCount, total: totalCount })}
          </span>
        </div>
      </div>
    </div>
  );
}
