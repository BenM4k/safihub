import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function PartnerSettlementsSkeleton() {
  return (
    <div
      className="space-y-6 sm:space-y-8 pb-24 sm:pb-28 font-sans"
      role="status"
      aria-busy="true"
      aria-label="Chargement des règlements"
    >
      {/* 1. Page Header */}
      <div className="border-b border-border/60 pb-5 space-y-1.5 font-sans">
        <Skeleton className="h-8 sm:h-9 w-52 sm:w-64 rounded-lg" />
        <Skeleton className="h-4 w-72 sm:w-96 rounded-md" />
      </div>

      <div className="space-y-8 sm:space-y-10">
        {/* 2. Hero Balance Card (Solde à recevoir) */}
        <div className="space-y-6 py-2 font-sans">
          {/* Top row: Section Header & Payout Method */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-44 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-8 w-48 rounded-lg self-start sm:self-auto" />
          </div>

          {/* Middle row: Big Amount & Currency Breakdown */}
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-12 sm:h-14 lg:h-16 w-64 sm:w-80 rounded-lg" />
              <div className="flex items-center gap-3 pt-1">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
            </div>
          </div>

          <Separator className="bg-border/60" />

          {/* Bottom row: Next settlement cycle & reconciliation status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-4 w-48 rounded-md" />
            </div>
            <Skeleton className="h-5 w-32 rounded-full" />
          </div>
        </div>

        {/* 3. Period selector toolbar */}
        <div className="py-2 space-y-3 border-b border-border/60 pb-3 font-sans">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            {/* Period Filter Buttons */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-md" />
              ))}
            </div>

            {/* Right side: Active date label & Export button */}
            <div className="flex items-center gap-2.5 justify-between md:justify-end">
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>

        {/* 4. KPI Row (Period-scoped) */}
        <div className="bg-muted/40 dark:bg-card/75 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-xs font-sans space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 md:divide-x md:divide-border/60">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="pr-3 pb-3.5 md:p-0 md:px-5 first:md:pl-0 border-r border-b border-border/60 md:border-r-0 md:border-b-0 space-y-2"
              >
                <div className="flex items-center gap-1.5">
                  <Skeleton className="size-3.5 rounded-full" />
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                </div>
                <Skeleton className="h-7 sm:h-8 w-28 sm:w-32 rounded-lg" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* 5. Tabs for Commandes livrées vs Versements */}
        <div className="space-y-4 font-sans">
          <div className="flex border-b border-border gap-2 pb-1">
            <Skeleton className="h-9 w-44 rounded-lg" />
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>

          {/* Activity Table Skeleton */}
          <div className="rounded-2xl bg-card overflow-hidden shadow-xs font-sans">
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <div className="divide-y divide-border/60">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-48 rounded-md" />
                  </div>
                  <div className="space-y-1.5 text-right">
                    <Skeleton className="h-4 w-20 ml-auto rounded-md" />
                    <Skeleton className="h-3 w-16 ml-auto rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

