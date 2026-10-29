import { Skeleton } from "@/components/ui/skeleton";

export function PartnerHoursSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement des horaires d'ouverture et fermetures"
      className="space-y-8 sm:space-y-10 pb-24 sm:pb-28 max-w-6xl font-sans"
    >
      {/* 1. Hours Header */}
      <div className="space-y-4 pb-2 border-b border-border/60 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-8 sm:h-9 w-60 sm:w-80 rounded-lg" />
            <Skeleton className="h-4 w-72 sm:w-96 rounded-md" />
          </div>
          <Skeleton className="h-6 w-32 rounded-full shrink-0" />
        </div>

        {/* Live Status Bar */}
        <div className="flex flex-wrap items-center gap-2.5 py-1">
          <Skeleton className="h-5 w-24 rounded-full" />
          <span className="text-muted-foreground/40 font-medium">·</span>
          <Skeleton className="h-4 w-32 rounded-md" />
          <span className="text-muted-foreground/40 font-medium">·</span>
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>

        {/* Timer rule real example callout */}
        <div className="border-l-2 border-primary/60 pl-4 py-2.5 space-y-1.5 bg-muted/20 rounded-r-xl">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-44 rounded-md" />
          </div>
          <Skeleton className="h-3.5 w-4/5 rounded-md" />
        </div>

        {/* Customer preview callout */}
        <div className="border-l-2 border-primary/50 pl-4 py-2.5 space-y-1.5 bg-muted/20 rounded-r-xl">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-36 rounded-md" />
          </div>
          <Skeleton className="h-3.5 w-3/4 rounded-md" />
        </div>
      </div>

      {/* 2. Weekly Schedule Editor */}
      <div className="space-y-4 py-2 border-b border-border/60 pb-6 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
          <div className="space-y-1">
            <Skeleton className="h-5 sm:h-6 w-44 rounded-md" />
            <Skeleton className="h-3.5 w-60 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        {/* 7 Schedule Rows */}
        <div className="divide-y divide-border/60">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-5 rounded-md" />
                <Skeleton className="h-4 w-20 sm:w-24 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                <Skeleton className="h-9 w-20 rounded-lg" />
                <span className="text-muted-foreground/40 text-xs">à</span>
                <Skeleton className="h-9 w-20 rounded-lg" />
                <Skeleton className="size-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Exceptional Closures Manager */}
      <div className="space-y-4 py-2 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
          <div className="space-y-1">
            <Skeleton className="h-5 sm:h-6 w-48 rounded-md" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Skeleton className="h-10 sm:h-9 flex-1 sm:w-32 rounded-lg" />
            <Skeleton className="h-10 sm:h-9 flex-1 sm:w-36 rounded-lg" />
          </div>
        </div>

        {/* Closure items cards */}
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-2xl bg-card border border-border/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-4 w-36 rounded-md" />
                </div>
                <Skeleton className="h-3.5 w-48 rounded-md" />
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="size-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
