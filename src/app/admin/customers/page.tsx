import { getCurrentUser } from "@/services/auth";
import { listAdminCustomers } from "@/services/admin";
import { CustomersManagementView } from "@/components/admin/customers/customers-management-view";

export default async function AdminCustomersPage() {
  const [currentUser, res] = await Promise.all([
    getCurrentUser(),
    listAdminCustomers({ limit: 500 }),
  ]);

  const customers = res.ok ? res.value.customers : [];
  const totalCount = res.ok ? res.value.totalCount : 0;
  const isAdmin = currentUser?.role === "admin";

  return (
    <CustomersManagementView
      initialCustomers={customers}
      totalCustomersCount={totalCount}
      isAdmin={isAdmin}
    />
  );
}
