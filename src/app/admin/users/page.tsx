import { getCurrentUser } from "@/services/auth";
import { listAdminHouses, listAdminUsers } from "@/services/admin";
import { countActiveAdmins } from "@/dal";
import { UsersManagementView } from "@/components/admin/users/users-management-view";
import { UserRow } from "@/components/admin/users/types";

export default async function AdminUsersPage() {
  const [currentUser, usersRes, housesRes, activeAdminsCount] =
    await Promise.all([
      getCurrentUser(),
      listAdminUsers(),
      listAdminHouses(),
      countActiveAdmins(),
    ]);

  let users = [] as UserRow[];
  if (usersRes.ok) {
    // throw new Error(usersRes.error);
    users = usersRes.value;
  }

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
