import { Suspense } from "react";
import { guardAdminRoute } from "@/services/auth";
import { parseAdminDispatchSearchParams } from "@/lib/admin-dispatch-query";
import { DispatchStreamContent } from "@/components/admin/dispatch/dispatch-stream-content";
import { DispatchLoadingSkeleton } from "@/components/admin/dispatch/dispatch-loading-skeleton";

interface AdminDispatchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminDispatchPage({
  searchParams,
}: AdminDispatchPageProps) {
  const [, rawSearchParams] = await Promise.all([
    guardAdminRoute(),
    searchParams,
  ]);

  const query = parseAdminDispatchSearchParams(rawSearchParams);

  return (
    <Suspense fallback={<DispatchLoadingSkeleton />}>
      <DispatchStreamContent query={query} />
    </Suspense>
  );
}
