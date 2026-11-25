import { Suspense } from "react";
import { guardAdminRoute } from "@/services/auth";
import { parseAdminHousesSearchParams } from "@/lib/admin-houses-query";
import { HousesStreamContent } from "@/components/admin/houses/houses-stream-content";
import { HousesLoadingSkeleton } from "@/components/admin/houses/houses-loading-skeleton";

interface AdminHousesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminHousesPage({
  searchParams,
}: AdminHousesPageProps) {
  const [, rawSearchParams] = await Promise.all([
    guardAdminRoute(),
    searchParams,
  ]);

  const query = parseAdminHousesSearchParams(rawSearchParams);

  return (
    <Suspense fallback={<HousesLoadingSkeleton />}>
      <HousesStreamContent query={query} />
    </Suspense>
  );
}
