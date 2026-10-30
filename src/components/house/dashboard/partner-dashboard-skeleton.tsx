"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export {
  PartnerBannerSkeleton,
  AcceptanceQueueSkeleton,
  PartnerKpiRowSkeleton,
} from "./partner-dashboard-top-skeleton";

export function PartnerPipelineSkeleton() {
  return (
    <section className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36 rounded-md" />
        <Skeleton className="h-4 w-28 rounded-md" />
      </div>
      <div className="bg-card rounded-2xl p-2 sm:p-3 font-sans">
        <div className="hidden md:flex md:items-stretch">
          {[1, 2, 3, 4].map((i, idx) => (
            <div key={i} className="flex-1 flex items-stretch">
              {idx > 0 && (
                <Separator
                  orientation="vertical"
                  className="h-12 mx-1 my-auto shrink-0 bg-border/60"
                />
              )}
              <div className="flex-1 p-2.5 sm:p-3 space-y-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="size-8 rounded-xl" />
                </div>
                <Skeleton className="h-7 w-12 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
        <div className="md:hidden grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-2 space-y-2">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-6 w-10 rounded-md" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PartnerAnalyticsSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-4 font-sans">
      {/* 1. Bar Chart Card (2 columns) */}
      <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-3 w-56 rounded-md" />
            </div>
          </div>
        </div>

        {/* CSS/SVG Bar Chart Bars h-44 */}
        <div className="space-y-3 pt-2">
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 pt-4 border-b border-border/60">
            {[45, 70, 30, 85, 60, 40, 90].map((h, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
              >
                <Skeleton
                  style={{ height: `${h}%` }}
                  className="w-full max-w-[36px] rounded-t-lg"
                />
                <Skeleton className="h-3 w-6 rounded-md" />
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-1">
            <Skeleton className="h-3 w-48 rounded-md" />
          </div>
        </div>
      </div>

      {/* 2. Side Widgets (1 column) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {/* Capacity Widget */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-36 rounded-md" />
        </div>

        {/* Rating/Performance Widget */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-3 w-40 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function PartnerTablesSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 font-sans">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-card rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </div>
          <div className="space-y-2.5">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/20"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="size-8 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-24 rounded-md" />
                    <Skeleton className="h-3 w-32 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PartnerDashboardSkeleton() {
  const t = useTranslations("house.dashboard");

  return (
    <div
      className="space-y-8 sm:space-y-10 lg:space-y-12 font-sans"
      role="status"
      aria-busy="true"
      aria-label={t("loadingDashboard")}
    >
      <PartnerBannerSkeleton />
      <AcceptanceQueueSkeleton />
      <PartnerKpiRowSkeleton />
      <PartnerPipelineSkeleton />
      <PartnerAnalyticsSkeleton />
      <PartnerTablesSkeleton />
    </div>
  );
}
