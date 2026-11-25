import { guardAdminRoute } from "@/services/auth";
import { listAdminCustomers } from "@/services/admin";
import { CustomersManagementView } from "@/components/admin/customers/customers-management-view";

export default async function AdminCustomersPage() {
  const authCtx = await guardAdminRoute();
  const res = await listAdminCustomers({ limit: 500 });

  if (!res.ok) {
    throw new Error(res.error);
  }

  const { customers, totalCount } = res.value;
  const isAdmin = authCtx.user.role === "admin";

  return (
    <CustomersManagementView
      initialCustomers={customers}
      totalCustomersCount={totalCount}
      isAdmin={isAdmin}
    />
  );
}
