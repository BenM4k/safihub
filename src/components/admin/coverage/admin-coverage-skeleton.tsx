"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminCoverageSkeletonProps {
  label?: string;
}

export function CoverageDistanceSkeleton({ label }: AdminCoverageSkeletonProps) {
  const t = useTranslations("admin.coverage");
  const resolvedLabel = label ?? t("loadingCoverageAria");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={resolvedLabel}
      className="p-5 bg-card rounded-xl border border-border shadow-xs flex flex-col gap-4 font-sans"
    >
      <span className="sr-only">{resolvedLabel}</span>
      <Skeleton className="h-4 w-48 rounded animate-shimmer" />
      <div className="flex flex-col sm:flex-row items-end gap-4 max-w-md">
        <div className="flex flex-col gap-1.5 w-full">
          <Skeleton className="h-3 w-36 rounded animate-shimmer" />
          <Skeleton className="h-9 w-full rounded-md animate-shimmer" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg shrink-0 animate-shimmer" />
      </div>
    </div>
  );
}

export function CoverageNeighborhoodsSkeleton({
  label,
}: AdminCoverageSkeletonProps) {
  const t = useTranslations("admin.coverage");
  const resolvedLabel = label ?? t("loadingCoverageAria");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={resolvedLabel}
      className="bg-card rounded-xl border border-border shadow-xs overflow-hidden font-sans"
    >
      <span className="sr-only">{resolvedLabel}</span>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Skeleton className="h-4 w-40 rounded animate-shimmer" />
        <Skeleton className="h-3 w-24 rounded animate-shimmer" />
      </div>
      <div className="h-10 bg-muted/40 border-b border-border flex items-center px-4" />
      <div className="divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 px-4 flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-36 rounded animate-shimmer" />
            <Skeleton className="h-3 w-28 rounded animate-shimmer" />
            <Skeleton className="h-6 w-20 rounded-full animate-shimmer" />
            <Skeleton className="h-8 w-24 rounded-lg animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CoverageDemandSkeleton({ label }: AdminCoverageSkeletonProps) {
  const t = useTranslations("admin.coverage");
  const resolvedLabel = label ?? t("loadingCoverageAria");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={resolvedLabel}
      className="bg-card rounded-xl border border-border shadow-xs overflow-hidden font-sans"
    >
      <span className="sr-only">{resolvedLabel}</span>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Skeleton className="h-4 w-44 rounded animate-shimmer" />
        <Skeleton className="h-3 w-20 rounded animate-shimmer" />
      </div>
      <div className="h-10 bg-muted/40 border-b border-border flex items-center px-4" />
      <div className="divide-y divide-border">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 px-4 flex items-center justify-between gap-4">
            <Skeleton className="h-3 w-36 rounded animate-shimmer" />
            <Skeleton className="h-3 w-20 rounded animate-shimmer" />
            <Skeleton className="h-3 w-24 rounded animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminCoverageSkeleton({ label }: AdminCoverageSkeletonProps) {
  return (
    <div className="flex flex-col gap-6 font-sans">
      <CoverageDistanceSkeleton label={label} />
      <CoverageNeighborhoodsSkeleton label={label} />
      <CoverageDemandSkeleton label={label} />
    </div>
  );
}
