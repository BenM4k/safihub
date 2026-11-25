"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface SettlementsLoadingSkeletonProps {
  label?: string;
}

export function SettlementsLoadingSkeleton({
  label,
}: SettlementsLoadingSkeletonProps) {
  const t = useTranslations("admin.settlements");
  const resolvedLabel = label ?? t("loadingSettlementsAria");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={resolvedLabel}
      className="flex flex-col gap-6 font-sans"
    >
      <span className="sr-only">{resolvedLabel}</span>
      <Skeleton className="h-14 w-full rounded-xl border border-border animate-shimmer" />

      <div className="flex flex-col sm:flex-row sm:items-center py-1 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex-1 p-3 space-y-2 rounded-xl border border-border bg-card">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-28 rounded animate-shimmer" />
              <Skeleton className="size-3.5 rounded animate-shimmer" />
            </div>
            <Skeleton className="h-8 w-36 rounded animate-shimmer" />
            <Skeleton className="h-3 w-32 rounded animate-shimmer" />
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-36 rounded animate-shimmer" />
        <Skeleton className="h-64 w-full rounded-xl border border-border animate-shimmer" />
      </div>

      <SettlementHistorySkeleton />
    </div>
  );
}

export function SettlementHistorySkeleton({
  label,
}: SettlementsLoadingSkeletonProps) {
  const t = useTranslations("admin.settlements");
  const resolvedLabel = label ?? t("loadingSettlementsAria");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={resolvedLabel}
      className="flex flex-col gap-3 pt-2 font-sans"
    >
      <span className="sr-only">{resolvedLabel}</span>
      <Skeleton className="h-5 w-36 rounded animate-shimmer" />
      <Skeleton className="h-64 w-full rounded-xl border border-border animate-shimmer" />
    </div>
  );
}
