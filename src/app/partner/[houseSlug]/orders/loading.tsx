import { Skeleton } from "@/components/ui/skeleton";
import { PartnerOrdersSkeleton } from "@/components/house/orders/partner-orders-skeleton";

export default function PartnerOrdersLoading() {
  return (
    <div
      className="space-y-6 sm:space-y-8 font-sans"
      role="status"
      aria-busy="true"
      aria-label="Chargement des commandes"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-5">
        <div className="space-y-1.5">
          <Skeleton className="h-8 sm:h-9 w-48 sm:w-60 rounded-lg" />
          <Skeleton className="h-4 w-64 sm:w-80 rounded-md" />
        </div>
      </div>

      {/* Stage Tabs with live count badges */}
      <div
        data-tour-id="tour-orders-stages"
        className="relative w-full font-sans"
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 shrink-0"
            >
              <Skeleton className="h-4 w-16 sm:w-20 rounded-md" />
              <Skeleton className="h-4 w-5 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-card border-0 shadow-none sm:shadow-xs font-sans">
        <div className="flex-1 w-full">
          <Skeleton className="h-10 sm:h-9 w-full rounded-xl" />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2.5 w-full sm:w-auto">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
            <Skeleton className="h-10 sm:h-9 w-full sm:w-[135px] rounded-xl" />
            <Skeleton className="h-10 sm:h-9 w-full sm:w-[135px] rounded-xl" />
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <Skeleton className="size-10 sm:size-9 rounded-xl" />
            <Skeleton className="size-10 sm:size-9 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Orders List / Table */}
      <PartnerOrdersSkeleton />
    </div>
  );
}
