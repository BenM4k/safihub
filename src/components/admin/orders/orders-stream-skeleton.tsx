"use client";

import { useTranslations } from "next-intl";

export function OrdersStreamSkeleton() {
  const t = useTranslations("admin.orders");

  return (
    <div className="space-y-4" aria-busy="true" aria-label={t("loadingOrdersAria")}>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="h-20 rounded-xl border border-border bg-card p-3 space-y-2.5"
          >
            <div className="h-3 w-20 rounded animate-shimmer" />
            <div className="h-6 w-14 rounded animate-shimmer" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="h-10 w-full rounded-lg animate-shimmer" />
        <div className="flex flex-col lg:flex-row gap-2.5">
          <div className="h-11 flex-1 rounded-lg animate-shimmer" />
          <div className="flex gap-2">
            <div className="h-11 w-32 rounded-lg animate-shimmer" />
            <div className="h-11 w-40 rounded-lg animate-shimmer" />
            <div className="h-11 w-32 rounded-lg animate-shimmer" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <div className="divide-y divide-border">
          <div className="h-10 bg-muted/40" />
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-14 px-4 flex items-center gap-4">
              <div className="size-4 rounded animate-shimmer shrink-0" />
              <div className="h-4 w-20 rounded animate-shimmer shrink-0" />
              <div className="h-4 w-36 rounded animate-shimmer flex-1" />
              <div className="h-4 w-28 rounded animate-shimmer hidden md:block" />
              <div className="h-4 w-20 rounded animate-shimmer" />
              <div className="h-5 w-24 rounded-full animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
