"use client";

import { useTranslations } from "next-intl";

export function DisputesSkeleton() {
  const t = useTranslations("admin.disputes");

  return (
    <div className="space-y-4" aria-busy="true" aria-label={t("loadingDisputesAria")}>
      <div className="flex flex-col md:flex-row gap-3 justify-between">
        <div className="h-10 w-64 rounded-lg animate-shimmer" />
        <div className="h-11 w-full md:w-80 rounded-lg animate-shimmer" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-card rounded-2xl border border-border p-5 space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 rounded-full animate-shimmer" />
                <div className="h-5 w-16 rounded-md animate-shimmer" />
              </div>
              <div className="h-4 w-24 rounded animate-shimmer" />
            </div>
            <div className="h-16 rounded-xl animate-shimmer" />
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 rounded animate-shimmer" />
              <div className="h-9 w-28 rounded-lg animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
