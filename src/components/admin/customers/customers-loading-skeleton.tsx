"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomersLoadingSkeletonProps {
  label?: string;
}

export function CustomersLoadingSkeleton({
  label,
}: CustomersLoadingSkeletonProps) {
  const t = useTranslations("admin.customers");
  const resolvedLabel = label ?? t("loadingCustomersAria");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={resolvedLabel}
      className="flex flex-col gap-5 font-sans"
    >
      <span className="sr-only">{resolvedLabel}</span>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-36 rounded-lg animate-shimmer" />
          <Skeleton className="h-4 w-72 rounded-md animate-shimmer" />
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-7 w-28 rounded-xl border border-border animate-shimmer" />
            <Skeleton className="h-7 w-24 rounded-xl border border-border animate-shimmer" />
            <Skeleton className="h-7 w-24 rounded-xl border border-border animate-shimmer" />
          </div>
        </div>
        <Skeleton className="h-10 w-44 rounded-xl border border-border animate-shimmer" />
      </div>

      <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <Skeleton className="h-11 w-full max-w-md rounded-lg border border-border animate-shimmer" />
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-11 w-28 rounded-lg border border-border animate-shimmer" />
            <Skeleton className="h-11 w-28 rounded-lg border border-border animate-shimmer" />
            <Skeleton className="h-11 w-36 rounded-lg border border-border animate-shimmer" />
            <Skeleton className="h-11 w-24 rounded-lg border border-border animate-shimmer" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden flex flex-col">
        <div className="h-11 border-b border-border bg-muted/30 flex items-center px-4 justify-between gap-4">
          <Skeleton className="h-3.5 w-20 rounded animate-shimmer" />
          <Skeleton className="h-3.5 w-24 rounded hidden sm:block animate-shimmer" />
          <Skeleton className="h-3.5 w-28 rounded hidden md:block animate-shimmer" />
          <Skeleton className="h-3.5 w-16 rounded hidden lg:block animate-shimmer" />
          <Skeleton className="h-3.5 w-20 rounded hidden sm:block animate-shimmer" />
          <Skeleton className="h-3.5 w-24 rounded hidden md:block animate-shimmer" />
          <Skeleton className="h-3.5 w-20 rounded animate-shimmer" />
          <Skeleton className="h-3.5 w-12 rounded animate-shimmer" />
        </div>

        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-[52px] flex items-center px-4 justify-between gap-4"
            >
              <div className="flex flex-col gap-1.5 w-32">
                <Skeleton className="h-3.5 w-24 rounded animate-shimmer" />
                <Skeleton className="h-2.5 w-16 rounded sm:hidden animate-shimmer" />
              </div>
              <Skeleton className="h-3.5 w-24 rounded hidden sm:block animate-shimmer" />
              <Skeleton className="h-3.5 w-32 rounded hidden md:block animate-shimmer" />
              <Skeleton className="h-5 w-14 rounded-full hidden lg:block animate-shimmer" />
              <Skeleton className="h-3.5 w-12 rounded hidden sm:block animate-shimmer" />
              <Skeleton className="h-3.5 w-20 rounded hidden md:block animate-shimmer" />
              <Skeleton className="h-5 w-16 rounded-full animate-shimmer" />
              <Skeleton className="size-7 rounded-lg animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
