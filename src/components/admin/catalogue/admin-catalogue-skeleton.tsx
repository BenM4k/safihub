"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminCatalogueSkeletonProps {
  label?: string;
}

export function AdminCatalogueSkeleton({ label }: AdminCatalogueSkeletonProps) {
  const t = useTranslations("admin.catalogue");
  const resolvedLabel = label ?? t("loadingCatalogueAria");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={resolvedLabel}
      className="flex flex-col gap-6 font-sans"
    >
      <span className="sr-only">{resolvedLabel}</span>

      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <Skeleton className="h-9 w-28 rounded-lg animate-shimmer" />
        <Skeleton className="h-9 w-24 rounded-lg animate-shimmer" />
        <Skeleton className="h-9 w-24 rounded-lg animate-shimmer" />
        <Skeleton className="h-9 w-36 rounded-lg animate-shimmer" />
      </div>

      <div className="p-5 bg-card rounded-xl border border-border shadow-xs flex flex-col gap-4">
        <Skeleton className="h-4 w-32 rounded animate-shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-20 rounded animate-shimmer" />
              <Skeleton className="h-9 w-full rounded-md animate-shimmer" />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-1">
          <Skeleton className="h-9 w-28 rounded-lg animate-shimmer" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="h-10 bg-muted/40 border-b border-border flex items-center px-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 px-4 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-32 rounded animate-shimmer" />
              <Skeleton className="h-3 w-24 rounded animate-shimmer" />
              <Skeleton className="h-3 w-28 rounded animate-shimmer" />
              <Skeleton className="h-5 w-16 rounded-full animate-shimmer" />
              <Skeleton className="h-8 w-20 rounded-lg animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
