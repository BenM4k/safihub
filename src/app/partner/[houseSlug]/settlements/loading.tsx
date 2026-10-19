"use client";

import { useTranslations } from "next-intl";

export default function PartnerSettlementsLoading() {
  const t = useTranslations("house.settlements");

  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label={t("loadingAria")}>
      {/* Header skeleton */}
      <div className="space-y-2 pb-5 border-b border-border">
        <div className="h-8 w-64 bg-surface rounded-lg" />
        <div className="h-4 w-96 bg-surface rounded-lg" />
      </div>

      {/* Hero card skeleton */}
      <div className="h-56 bg-surface rounded-2xl border border-border" />

      {/* Toolbar skeleton */}
      <div className="h-16 bg-surface rounded-2xl border border-border" />

      {/* KPI skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-surface rounded-xl border border-border" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="h-80 bg-surface rounded-2xl border border-border" />
    </div>
  );
}
