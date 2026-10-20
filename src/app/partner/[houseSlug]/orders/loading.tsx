import { PartnerOrdersSkeleton } from "@/components/house/orders/partner-orders-skeleton";

export default function PartnerOrdersLoading() {
  return (
    <div className="space-y-5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div className="space-y-1.5">
          <div className="h-7 w-52 bg-surface rounded-lg" />
          <div className="h-4 w-72 bg-surface rounded" />
        </div>
      </div>
      <PartnerOrdersSkeleton />
    </div>
  );
}
