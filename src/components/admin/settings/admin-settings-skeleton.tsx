"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminSettingsSkeletonProps {
  label?: string;
}

export function AdminSettingsSkeleton({ label }: AdminSettingsSkeletonProps) {
  const t = useTranslations("admin.settings");
  const resolvedLabel = label ?? t("loadingSettingsAria");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={resolvedLabel}
      className="flex flex-col gap-6 font-sans"
    >
      <span className="sr-only">{resolvedLabel}</span>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-card rounded-xl border border-border shadow-xs flex flex-col gap-5">
          <Skeleton className="h-5 w-44 rounded animate-shimmer" />
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-36 rounded animate-shimmer" />
                <Skeleton className="h-9 w-full rounded-md animate-shimmer" />
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Skeleton className="h-9 w-32 rounded-lg animate-shimmer" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="p-6 bg-card rounded-xl border border-border shadow-xs flex flex-col gap-4">
            <Skeleton className="h-5 w-40 rounded animate-shimmer" />
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-32 rounded animate-shimmer" />
                <Skeleton className="h-9 w-full rounded-md animate-shimmer" />
              </div>
              <div className="flex justify-end pt-1">
                <Skeleton className="h-9 w-28 rounded-lg animate-shimmer" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-card rounded-xl border border-border shadow-xs flex flex-col gap-4">
            <Skeleton className="h-5 w-48 rounded animate-shimmer" />
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-muted/40 rounded-lg px-3 flex items-center justify-between"
                >
                  <Skeleton className="h-3 w-28 rounded animate-shimmer" />
                  <Skeleton className="h-3 w-20 rounded animate-shimmer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
