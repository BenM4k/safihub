import { HouseDetailSkeleton } from "@/components/houses/detail/house-detail-skeleton";

export default function CustomerHouseDetailLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="h-18 border-b border-slate-200/80 bg-white" />
      <main className="flex-1">
        <HouseDetailSkeleton />
      </main>
    </div>
  );
}
