"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface UsersLoadingSkeletonProps {
  rows?: number;
  label?: string;
}

export function UsersLoadingSkeleton({
  rows = 6,
  label,
}: UsersLoadingSkeletonProps) {
  const t = useTranslations("admin.users");
  const resolvedLabel = label ?? t("loadingUsersAria");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={resolvedLabel}
      className="flex flex-col gap-4 font-sans"
    >
      <span className="sr-only">{resolvedLabel}</span>
      <Skeleton className="h-12 w-full rounded-xl animate-shimmer" />
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="h-11 bg-muted/40 border-b border-border" />
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-1/4">
                <Skeleton className="size-9 rounded-full shrink-0 animate-shimmer" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="h-3.5 w-3/4 rounded animate-shimmer" />
                  <Skeleton className="h-2.5 w-1/2 rounded animate-shimmer" />
                </div>
              </div>
              <Skeleton className="h-3.5 w-1/6 rounded animate-shimmer" />
              <Skeleton className="h-3.5 w-1/6 rounded animate-shimmer" />
              <Skeleton className="h-5 w-20 rounded-full animate-shimmer" />
              <Skeleton className="h-3.5 w-1/8 rounded animate-shimmer" />
              <Skeleton className="h-3.5 w-1/8 rounded animate-shimmer" />
              <Skeleton className="h-5 w-16 rounded-full animate-shimmer" />
              <Skeleton className="size-8 rounded-lg shrink-0 animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
