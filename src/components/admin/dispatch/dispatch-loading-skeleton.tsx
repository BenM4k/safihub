"use client";

import { useTranslations } from "next-intl";

export function DispatchLoadingSkeleton() {
  const t = useTranslations("admin.dispatch");

  return (
    <div className="space-y-6" aria-busy="true" aria-label={t("loadingDispatchAria")}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-2">
          <div className="h-7 w-52 rounded animate-shimmer" />
          <div className="h-4 w-72 max-w-full rounded animate-shimmer" />
        </div>
        <div className="h-9 w-48 rounded-full animate-shimmer" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="h-24 rounded-xl border border-border bg-card p-4 space-y-2.5"
          >
            <div className="h-3 w-28 rounded animate-shimmer" />
            <div className="h-7 w-16 rounded animate-shimmer" />
            <div className="h-3 w-36 rounded animate-shimmer" />
          </div>
        ))}
      </div>

      <div className="h-10 w-72 rounded-lg animate-shimmer" />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex justify-between gap-3">
            <div className="h-5 w-48 rounded animate-shimmer" />
            <div className="h-9 w-44 rounded-lg animate-shimmer" />
          </div>
          <div className="h-11 w-full rounded-lg animate-shimmer" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-24 rounded-xl animate-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
