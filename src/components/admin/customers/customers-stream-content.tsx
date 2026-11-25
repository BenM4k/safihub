import { listAdminCustomers } from "@/services/admin";
import type { AdminCustomersUrlState } from "@/lib/admin-customers-query";
import { CustomersManagementView } from "./customers-management-view";

interface CustomersStreamContentProps {
  isAdmin: boolean;
  initialUrlState: AdminCustomersUrlState;
}

export async function CustomersStreamContent({
  isAdmin,
  initialUrlState,
}: CustomersStreamContentProps) {
  const res = await listAdminCustomers({ limit: 500 });

  if (!res.ok) {
    throw new Error(res.error);
  }

  const { customers, totalCount } = res.value;

  return (
    <CustomersManagementView
      initialCustomers={customers}
      totalCustomersCount={totalCount}
      isAdmin={isAdmin}
      initialUrlState={initialUrlState}
    />
  );
}
