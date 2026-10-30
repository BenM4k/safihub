import { SessionNavbar } from "@/components/home/header/session-navbar";
import { HouseDetailSkeleton } from "@/components/houses/detail/house-detail-skeleton";

export default function CustomerHouseDetailLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SessionNavbar variant="solid" />
      <main className="flex-1">
        <HouseDetailSkeleton />
      </main>
    </div>
  );
}
