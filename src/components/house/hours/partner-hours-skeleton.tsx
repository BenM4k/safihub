"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function PartnerHoursSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement des horaires d'ouverture et fermetures"
      className="space-y-6 max-w-6xl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-7 w-60" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Weekly schedule */}
      <div className="space-y-4 py-2 border-b border-border pb-6">
        <Skeleton className="h-5 w-44" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-3 items-center">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exceptional closures */}
      <div className="space-y-4 py-2">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  );
}
