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
    search?: string | string[];
    role?: string | string[];
    status?: string | string[];
  }>;
}

const ALLOWED_ROLES = ["admin", "house"] as const;
const ALLOWED_STATUSES = ["active", "blocked", "invitation_sent"] as const;

function normalizeParam(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) {
    return val[0];
  }
  return val;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const rawSearch = normalizeParam(sp.search)?.trim() ?? "";
  const rawRole = normalizeParam(sp.role);
  const rawStatus = normalizeParam(sp.status);

  const role =
    rawRole && (ALLOWED_ROLES as readonly string[]).includes(rawRole)
      ? rawRole
      : "all";
  const status =
    rawStatus && (ALLOWED_STATUSES as readonly string[]).includes(rawStatus)
      ? rawStatus
      : "all";

  const [currentUser, usersRes, housesRes, activeAdminsRes] = await Promise.all(
    [
      getCurrentUser(),
      listAdminUsers({ roles: ["admin", "house"] }),
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
        search: rawSearch,
        role,
        status,
      }}
    />
  );
}
