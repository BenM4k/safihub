import { HouseDetailSkeleton } from "@/components/houses/detail/house-detail-skeleton";

export default function CustomerHouseDetailLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <div className="h-16 border-b border-border/60 bg-card" />
      <main className="flex-1">
        <HouseDetailSkeleton />
      </main>
    </div>
  );
}
