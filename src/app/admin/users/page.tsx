import { getCurrentUser } from "@/services/auth";
import { listAdminHouses, listAdminUsers } from "@/services/admin";
import { countActiveAdmins } from "@/dal";
import { UsersManagementView } from "@/components/admin/users/users-management-view";

export default async function AdminUsersPage() {
  const [currentUser, usersRes, housesRes, activeAdminsCount] = await Promise.all([
    getCurrentUser(),
    listAdminUsers({ limit: 500 }),
    listAdminHouses(),
    countActiveAdmins(),
  ]);

  const users = usersRes.ok ? usersRes.value : [];
  const houses = housesRes.ok ? housesRes.value : [];
  const isAdmin = currentUser?.role === "admin";

  return (
    <UsersManagementView
      initialUsers={users}
      houses={houses}
      currentUserId={currentUser?.id}
      isAdmin={isAdmin}
      activeAdminsCount={activeAdminsCount}
    />
  );
}
