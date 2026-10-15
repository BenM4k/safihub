import { getCurrentUser } from "@/services/auth";
import { listAdminCustomers } from "@/services/admin";
import { CustomersManagementView } from "@/components/admin/customers/customers-management-view";

export default async function AdminCustomersPage() {
  const [currentUser, res] = await Promise.all([
    getCurrentUser(),
    listAdminCustomers({ limit: 500 }),
  ]);

  if (!res.ok) {
    throw new Error(res.error);
  }

  const { customers, totalCount } = res.value;
  const isAdmin = currentUser?.role === "admin";

  return (
    <CustomersManagementView
      initialCustomers={customers}
      totalCustomersCount={totalCount}
      isAdmin={isAdmin}
    />
  );
}
