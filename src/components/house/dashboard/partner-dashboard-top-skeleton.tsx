import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function PartnerBannerSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden font-sans">
      <Skeleton className="h-44 sm:h-52 md:h-60 w-full rounded-none" />
      <div className="px-3 sm:px-6 pb-4 sm:pb-5 pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-2xl bg-card/90 dark:bg-card/90 backdrop-blur-md shadow-xs -mt-10 sm:-mt-12 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Skeleton className="size-14 sm:size-16 rounded-xl shrink-0" />
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-40 sm:w-52 rounded-lg" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32 sm:w-44 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-9 w-24 sm:w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 sm:w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AcceptanceQueueSkeleton() {
  return (
    <section className="space-y-4 font-sans">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>

      <div className="grid gap-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-card border border-border/80 shadow-xs space-y-3.5 font-sans"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-4 w-36 rounded-md" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex items-end justify-between gap-3 pt-0.5">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-44 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
              <div className="space-y-1 text-right">
                <Skeleton className="h-3 w-16 ml-auto rounded-md" />
                <Skeleton className="h-6 w-24 ml-auto rounded-md" />
              </div>
            </div>
            <div className="pt-2.5 border-t border-border/60 flex items-center justify-end gap-2">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PartnerKpiRowSkeleton() {
  return (
    <div className="bg-surface dark:bg-card/75 rounded-2xl p-2 sm:p-3.5 shadow-xs font-sans">
      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:items-center">
        {[1, 2, 3, 4, 5].map((i, idx) => (
          <div key={i} className="flex-1 flex items-center">
            {idx > 0 && (
              <Separator orientation="vertical" className="h-12 mx-1 shrink-0 bg-border/60" />
            )}
            <div className="flex-1 p-2 sm:p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-20 rounded-md" />
                <Skeleton className="size-7 rounded-lg" />
              </div>
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-3 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 space-y-2">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-lg" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
          <div className="border-l border-border/60 pl-2 p-2 space-y-2">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-lg" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
        <Separator className="my-1.5 bg-border/60" />
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 space-y-2">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-lg" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
          <div className="border-l border-border/60 pl-2 p-2 space-y-2">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-lg" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

