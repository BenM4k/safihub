"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function PartnerSettlementsLoading() {
  const t = useTranslations("house.settlements");

  return (
    <div className="space-y-6" aria-busy="true" aria-label={t("loadingAria")}>
      {/* Header skeleton */}
      <div className="space-y-2 pb-5 border-b border-border">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-lg" />
      </div>

      {/* Hero balance skeleton */}
      <div className="space-y-4 py-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-8 w-40 rounded-lg" />
        </div>
        <Skeleton className="h-14 w-72 rounded-lg" />
        <Skeleton className="h-4 w-60 rounded-md" />
        <Separator />
      </div>

      {/* Toolbar skeleton */}
      <div className="py-2 border-b border-border/60 pb-4 flex justify-between items-center">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-md" />
          ))}
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* KPI row skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-8 w-44 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
        ))}
      </div>
      <Separator />

      {/* Table skeleton */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-8 w-48 rounded-md" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}
