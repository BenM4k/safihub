import { Skeleton } from "@/components/ui/skeleton";

export function CoverageSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Chargement du périmètre de couverture"
      className="space-y-8 sm:space-y-10 pb-24 sm:pb-28 max-w-6xl font-sans"
    >
      {/* 1. Header with live count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-border/60">
        <div className="space-y-1.5">
          <Skeleton className="h-8 sm:h-9 w-52 sm:w-64 rounded-lg" />
          <Skeleton className="h-4 w-72 sm:w-96 rounded-md" />
        </div>
        <Skeleton className="h-7 w-36 rounded-full self-start sm:self-auto shrink-0" />
      </div>

      {/* 2. Perimeter Information Card */}
      <div className="rounded-2xl sm:rounded-3xl bg-muted/40 dark:bg-card/75 p-4 sm:p-5 space-y-4 shadow-xs font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Skeleton className="size-9 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-44 rounded-md" />
              <Skeleton className="h-3.5 w-36 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-6 w-28 rounded-full self-start sm:self-auto" />
        </div>

        {/* Level definition tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 sm:p-3.5 rounded-xl bg-card/60 border border-border/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Filter Bar (Search + Tabs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60 font-sans">
        <Skeleton className="h-10 sm:h-9 w-full max-w-sm rounded-xl" />
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-lg" />
          ))}
        </div>
      </div>

      {/* 4. Commune Group Cards */}
      <div className="space-y-4 font-sans">
        {[1, 2].map((group) => (
          <div
            key={group}
            className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden font-sans"
          >
            {/* Group Header */}
            <div className="p-3 sm:p-4 bg-muted/20 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-lg shrink-0" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-36 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-8 w-28 rounded-lg self-start sm:self-auto" />
            </div>

            {/* Quartier Rows */}
            <div className="divide-y divide-border/60">
              {[1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="p-3 sm:p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-5 rounded-md shrink-0" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
