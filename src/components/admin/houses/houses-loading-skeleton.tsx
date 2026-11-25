"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface HousesLoadingSkeletonProps {
  label?: string;
}

export function HousesLoadingSkeleton({ label }: HousesLoadingSkeletonProps) {
  const t = useTranslations("admin.houses");
  const resolvedLabel = label ?? t("loadingHousesAria");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={resolvedLabel}
      className="flex flex-col gap-6 font-sans"
    >
      <span className="sr-only">{resolvedLabel}</span>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48 rounded-lg animate-shimmer" />
          <Skeleton className="h-4 w-72 rounded-md animate-shimmer" />
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-6 w-24 rounded-xl animate-shimmer" />
            <Skeleton className="h-6 w-20 rounded-xl animate-shimmer" />
          </div>
        </div>
        <Skeleton className="h-10 w-44 rounded-xl animate-shimmer" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between gap-4">
          <Skeleton className="h-11 w-64 rounded-xl animate-shimmer" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-11 w-32 rounded-xl animate-shimmer" />
            <Skeleton className="h-11 w-32 rounded-xl animate-shimmer" />
          </div>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 w-full bg-muted/20 rounded-xl flex items-center px-4 justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-lg shrink-0 animate-shimmer" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-32 rounded animate-shimmer" />
                  <Skeleton className="h-3 w-20 rounded animate-shimmer" />
                </div>
              </div>
              <Skeleton className="h-4 w-20 rounded hidden sm:block animate-shimmer" />
              <Skeleton className="h-4 w-24 rounded hidden md:block animate-shimmer" />
              <Skeleton className="h-6 w-16 rounded-md animate-shimmer" />
              <Skeleton className="h-4 w-20 rounded text-right animate-shimmer" />
              <Skeleton className="h-6 w-20 rounded-md animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
