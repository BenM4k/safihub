"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminApplicationsSkeletonProps {
  label?: string;
}

export function AdminApplicationsSkeleton({
  label,
}: AdminApplicationsSkeletonProps) {
  const t = useTranslations("admin.applications");
  const resolvedLabel = label ?? t("loadingApplicationsAria");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={resolvedLabel}
      className="flex flex-col gap-6 font-sans"
    >
      <span className="sr-only">{resolvedLabel}</span>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-lg animate-shimmer" />
          <Skeleton className="h-9 w-24 rounded-lg animate-shimmer" />
          <Skeleton className="h-9 w-20 rounded-lg animate-shimmer" />
          <Skeleton className="h-9 w-20 rounded-lg animate-shimmer" />
        </div>
        <Skeleton className="h-11 w-full sm:w-80 rounded-lg animate-shimmer" />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Skeleton className="h-4 w-36 rounded animate-shimmer" />
          <Skeleton className="h-3 w-20 rounded animate-shimmer" />
        </div>
        <div className="h-10 bg-muted/40 border-b border-border flex items-center px-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 px-4 flex items-center justify-between gap-4"
            >
              <div className="flex flex-col gap-1.5 w-44">
                <Skeleton className="h-4 w-36 rounded animate-shimmer" />
                <Skeleton className="h-3 w-24 rounded animate-shimmer" />
              </div>
              <div className="flex flex-col gap-1.5 w-36">
                <Skeleton className="h-3 w-28 rounded animate-shimmer" />
                <Skeleton className="h-3 w-20 rounded animate-shimmer" />
              </div>
              <div className="flex flex-col gap-1.5 w-36">
                <Skeleton className="h-3 w-28 rounded animate-shimmer" />
                <Skeleton className="h-3 w-20 rounded animate-shimmer" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full animate-shimmer" />
              <Skeleton className="h-4 w-16 rounded animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
