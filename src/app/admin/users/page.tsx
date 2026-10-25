import { getCurrentUser } from "@/services/auth";
import {
  getActiveAdminsCount,
  listAdminHouses,
  listAdminUsers,
} from "@/services/admin";
import { UsersManagementView } from "@/components/admin/users/users-management-view";
import { UserRow } from "@/components/admin/users/types";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const [currentUser, usersRes, housesRes, activeAdminsRes] = await Promise.all(
    [
      getCurrentUser(),
      listAdminUsers({ roles: ["admin", "house"], limit: 500 }),
      listAdminHouses(),
      getActiveAdminsCount(),
    ],
  );

  let users = [] as UserRow[];
  if (usersRes.ok) {
    users = usersRes.value;
  }

  const houses = housesRes.ok ? housesRes.value : [];
  const activeAdminsCount = activeAdminsRes.ok ? activeAdminsRes.value : 0;
  const isAdmin = currentUser?.role === "admin";

  return (
    <UsersManagementView
      initialUsers={users}
      houses={houses}
      currentUserId={currentUser?.id}
      isAdmin={isAdmin}
      activeAdminsCount={activeAdminsCount}
      initialFilters={{
        search: sp.search ?? "",
        role: sp.role ?? "all",
        status: sp.status ?? "all",
      }}
    />
  );
}
