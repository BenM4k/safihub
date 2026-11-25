import { Suspense } from "react";
import { guardAdminRoute } from "@/services/auth";
import { UsersStreamContent } from "@/components/admin/users/users-stream-content";
import { UsersLoadingSkeleton } from "@/components/admin/users/users-loading-skeleton";

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
  // Always guard admin route before inspecting/passing data
  const authCtx = await guardAdminRoute();
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

  const currentUser = authCtx.user;
  const isAdmin = currentUser?.role === "admin";

  return (
    <Suspense fallback={<UsersLoadingSkeleton />}>
      <UsersStreamContent
        currentUserId={currentUser?.id}
        isAdmin={isAdmin}
        initialFilters={{
          search: rawSearch,
          role,
          status,
        }}
      />
    </Suspense>
  );
}
