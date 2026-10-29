import { Skeleton } from "@/components/ui/skeleton";
import { PartnerOrdersSkeleton } from "@/components/house/orders/partner-orders-skeleton";

export default function PartnerOrdersLoading() {
  return (
    <div className="space-y-5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-52 rounded-lg" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <div
        data-tour-id="tour-orders-stages"
        className="flex items-center gap-2 overflow-hidden py-1"
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-xl shrink-0" />
        ))}
      </div>
      <PartnerOrdersSkeleton />
    </div>
  );
}
