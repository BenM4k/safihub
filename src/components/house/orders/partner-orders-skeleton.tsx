import { Skeleton } from "@/components/ui/skeleton";

export function PartnerOrdersSkeleton() {
  return (
    <div className="space-y-4 font-sans">
      {/* Mobile & Tablet Card Grid (<1024px) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 lg:hidden">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-3.5"
          >
            {/* Header: Ref, Status Badge, Menu */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="size-8 rounded-lg" />
            </div>

            {/* Items & Services */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-4/5 rounded-md" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>

            {/* Customer & Location */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dashed border-border">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-4 w-24 ml-auto rounded-md" />
            </div>

            {/* Promised date box */}
            <Skeleton className="h-8 w-full rounded-lg" />

            {/* Financials & Primary Action */}
            <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex justify-between gap-2">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
                <div className="flex justify-between gap-2">
                  <Skeleton className="h-3 w-24 rounded-md" />
                  <Skeleton className="h-3 w-14 rounded-md" />
                </div>
                <Skeleton className="h-7 w-full rounded-lg" />
              </div>
              <Skeleton className="h-9 w-full sm:w-28 rounded-lg shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (>=1024px) */}
      <div className="hidden lg:block rounded-2xl border border-border bg-card shadow-xs overflow-hidden font-sans">
        <div className="bg-muted/40 border-b border-border py-3 px-4 flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
        <div className="divide-y divide-border/60">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="py-3.5 px-4 flex items-center justify-between gap-4"
            >
              <div className="space-y-1 w-28">
                <Skeleton className="h-5 w-20 rounded-lg" />
                <Skeleton className="h-3 w-14 rounded-md" />
              </div>
              <div className="space-y-1 w-32">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
              <div className="space-y-1 flex-1 max-w-xs">
                <Skeleton className="h-4 w-40 rounded-md" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>
              <div className="space-y-1 w-28">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
              <div className="space-y-1 w-28 text-right">
                <Skeleton className="h-4 w-16 ml-auto rounded-md" />
                <Skeleton className="h-5 w-20 ml-auto rounded-md" />
              </div>
              <div className="flex items-center gap-1.5 w-32 justify-end">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="size-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
