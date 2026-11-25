"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface CashLoadingSkeletonProps {
  label?: string;
}

export function CashLoadingSkeleton({ label }: CashLoadingSkeletonProps) {
  const t = useTranslations("admin.cash");
  const resolvedLabel = label ?? t("loadingCashAria");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={resolvedLabel}
      className="flex flex-col gap-6 font-sans"
    >
      <span className="sr-only">{resolvedLabel}</span>
      <div className="flex flex-col sm:flex-row sm:items-center py-1 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 p-3 space-y-2 rounded-xl border border-border bg-card">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24 rounded animate-shimmer" />
              <Skeleton className="size-3.5 rounded animate-shimmer" />
            </div>
            <Skeleton className="h-8 w-36 rounded animate-shimmer" />
            <Skeleton className="h-3 w-28 rounded animate-shimmer" />
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-48 rounded animate-shimmer" />
          <Skeleton className="h-4 w-36 rounded animate-shimmer" />
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="h-10 bg-muted/40 border-b border-border" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 border-b border-border/60 flex items-center justify-between gap-4"
            >
              <Skeleton className="h-4 w-32 rounded animate-shimmer" />
              <Skeleton className="h-4 w-20 rounded animate-shimmer" />
              <Skeleton className="h-4 w-20 rounded animate-shimmer" />
              <Skeleton className="h-4 w-24 rounded animate-shimmer" />
              <Skeleton className="h-8 w-20 rounded-lg animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CashHistorySkeleton() {
  const t = useTranslations("admin.cash");

  return (
    <div
      className="rounded-xl border border-border bg-card overflow-hidden"
      aria-busy="true"
      aria-label={t("loadingHistoryAria")}
    >
      <div className="p-4 border-b border-border flex justify-between items-center">
        <Skeleton className="h-5 w-52 rounded animate-shimmer" />
        <Skeleton className="h-9 w-28 rounded-lg animate-shimmer" />
      </div>
      <div className="h-12 bg-muted/30 border-b border-border" />
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-3.5 border-b border-border/60 flex items-center justify-between gap-3"
        >
          <Skeleton className="h-4 w-24 rounded animate-shimmer" />
          <Skeleton className="h-4 w-32 rounded animate-shimmer" />
          <Skeleton className="h-4 w-20 rounded animate-shimmer" />
          <Skeleton className="h-4 w-20 rounded animate-shimmer" />
          <Skeleton className="h-4 w-20 rounded animate-shimmer" />
          <Skeleton className="h-6 w-20 rounded-md animate-shimmer" />
        </div>
      ))}
    </div>
  );
}
