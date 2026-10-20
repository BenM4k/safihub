import { HouseDetailSkeleton } from "@/components/houses/detail/house-detail-skeleton";

export default function CustomerHouseDetailLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="h-18 border-b border-border bg-card" />
      <main className="flex-1">
        <HouseDetailSkeleton />
      </main>
    </div>
  );
}
