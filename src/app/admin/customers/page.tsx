import { Suspense } from "react";
import { guardAdminRoute } from "@/services/auth";
import { parseAdminCustomersSearchParams } from "@/lib/admin-customers-query";
import { CustomersStreamContent } from "@/components/admin/customers/customers-stream-content";
import { CustomersLoadingSkeleton } from "@/components/admin/customers/customers-loading-skeleton";

interface AdminCustomersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminCustomersPage({
  searchParams,
}: AdminCustomersPageProps) {
  const [authCtx, rawSearchParams] = await Promise.all([
    guardAdminRoute(),
    searchParams,
  ]);

  const isAdmin = authCtx.user.role === "admin";
  const initialUrlState = parseAdminCustomersSearchParams(rawSearchParams);

  return (
    <Suspense fallback={<CustomersLoadingSkeleton />}>
      <CustomersStreamContent
        isAdmin={isAdmin}
        initialUrlState={initialUrlState}
      />
    </Suspense>
  );
}
