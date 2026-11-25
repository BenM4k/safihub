import {
  getActiveAdminsCount,
  listAdminHouses,
  listAdminUsers,
} from "@/services/admin";
import { UsersManagementView } from "./users-management-view";
import type { UserFiltersState, UserRow } from "./types";

interface UsersStreamContentProps {
  currentUserId?: string;
  isAdmin: boolean;
  initialFilters: Partial<UserFiltersState>;
}

export async function UsersStreamContent({
  currentUserId,
  isAdmin,
  initialFilters,
}: UsersStreamContentProps) {
  const [usersRes, housesRes, activeAdminsRes] = await Promise.all([
    listAdminUsers({ roles: ["admin", "house"] }),
    listAdminHouses(),
    getActiveAdminsCount(),
  ]);

  const users: UserRow[] = usersRes.ok ? usersRes.value : [];
  const houses = housesRes.ok ? housesRes.value : [];
  const activeAdminsCount = activeAdminsRes.ok ? activeAdminsRes.value : 0;

  return (
    <UsersManagementView
      initialUsers={users}
      houses={houses}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
      activeAdminsCount={activeAdminsCount}
      initialFilters={initialFilters}
    />
  );
}
