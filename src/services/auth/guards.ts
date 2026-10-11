import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "./auth";
import {
  checkUserHouseAccess,
  getHouseBySlug,
  getUserHouseMemberships,
  type HouseMembershipInfo,
} from "@/dal";
import { err, ok, type Result } from "@/lib/result";
import type { UserRole } from "./permissions";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: string;
  isGuest: boolean;
  contactPhone?: string | null;
}

export interface AuthContext {
  user: AuthenticatedUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
}

export interface HouseAuthContext extends AuthContext {
  houseId?: string;
  houseSlug?: string;
  primaryHouseId?: string;
  memberships?: HouseMembershipInfo[];
  isAdminOverride: boolean;
}

export interface RequireRoleOptions {
  headers?: Headers;
  redirectIfUnauthorized?: boolean;
  redirectTo?: string;
}

export interface RequireHouseAccessOptions extends RequireRoleOptions {
  houseId?: string;
  houseSlug?: string;
  returnNotFoundOnUnauthorized?: boolean;
}

/**
 * Validates that the active session belongs to a user with one of the allowed roles
 * and that the account is active (not blocked).
 */
export async function requireRole(
  allowedRoles: UserRole | UserRole[],
  options?: RequireRoleOptions
): Promise<Result<AuthContext>> {
  const reqHeaders = options?.headers ?? (await headers());
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user) {
    if (options?.redirectIfUnauthorized) {
      redirect("/login");
    }
    return err("Unauthorized: Authentication required.");
  }

  const rawUser = session.user as Record<string, unknown>;
  const userRole = (rawUser.role as UserRole) || "customer";
  const userStatus = (rawUser.status as string) || "active";
  const isBanned = Boolean(rawUser.banned);

  const authUser: AuthenticatedUser = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: userRole,
    status: userStatus,
    isGuest: Boolean(rawUser.isGuest),
    contactPhone: (rawUser.contactPhone as string) || null,
  };

  // Enforce account blocking
  if (userStatus === "blocked" || isBanned) {
    if (options?.redirectIfUnauthorized) {
      redirect("/login?error=blocked");
    }
    return err("Forbidden: Account is blocked.");
  }

  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!rolesArray.includes(userRole)) {
    if (options?.redirectIfUnauthorized) {
      redirect(options?.redirectTo || "/");
    }
    return err(`Forbidden: User role "${userRole}" is not authorized for this action.`);
  }

  return ok({
    user: authUser,
    session: {
      id: session.session.id,
      userId: session.session.userId,
      expiresAt: session.session.expiresAt,
    },
  });
}

/**
 * Validates that the user has authorized staff access to laundry house operations.
 * - Admin users have global on-behalf access to all laundry houses.
 * - House staff users must be confirmed members of the specified house in the database.
 */
export async function requireHouseAccess(
  options?: RequireHouseAccessOptions
): Promise<Result<HouseAuthContext>> {
  // First verify user is authenticated and has either 'house' or 'admin' role
  const roleResult = await requireRole(["house", "admin"], options);
  if (!roleResult.ok) {
    return roleResult;
  }

  const { user, session } = roleResult.value;

  // Resolve target house if houseSlug was provided
  let targetHouseId = options?.houseId;
  let targetHouseSlug = options?.houseSlug;

  if (targetHouseSlug && !targetHouseId) {
    const houseRecord = await getHouseBySlug(targetHouseSlug);
    if (!houseRecord) {
      if (options?.returnNotFoundOnUnauthorized) {
        notFound();
      }
      return err(`House "${targetHouseSlug}" not found.`);
    }
    targetHouseId = houseRecord.id;
    targetHouseSlug = houseRecord.slug;
  }

  // Admin users possess full operational override across all houses
  if (user.role === "admin") {
    return ok({
      user,
      session,
      houseId: targetHouseId,
      houseSlug: targetHouseSlug,
      isAdminOverride: true,
    });
  }

  // House staff user: must verify active membership
  if (targetHouseId) {
    const hasAccess = await checkUserHouseAccess(user.id, targetHouseId);
    if (!hasAccess) {
      if (options?.returnNotFoundOnUnauthorized) {
        notFound();
      }
      if (options?.redirectIfUnauthorized) {
        redirect(options?.redirectTo || "/partner");
      }
      return err(`Forbidden: User does not have access to house "${targetHouseId}".`);
    }

    return ok({
      user,
      session,
      houseId: targetHouseId,
      houseSlug: targetHouseSlug,
      isAdminOverride: false,
    });
  }

  // No specific house ID or slug requested: retrieve all assigned houses
  const memberships = await getUserHouseMemberships(user.id);
  if (memberships.length === 0) {
    return ok({
      user,
      session,
      primaryHouseId: undefined,
      houseSlug: undefined,
      memberships: [],
      isAdminOverride: false,
    });
  }

  return ok({
    user,
    session,
    primaryHouseId: memberships[0].houseId,
    houseSlug: memberships[0].houseSlug,
    memberships,
    isAdminOverride: false,
  });
}

/**
 * Server-side route guard for the /admin portal layout.
 */
export async function guardAdminRoute(options?: { headers?: Headers }): Promise<AuthContext> {
  const result = await requireRole(["admin"], {
    ...options,
    redirectIfUnauthorized: true,
  });

  if (!result.ok) {
    redirect("/");
  }

  return result.value;
}

/**
 * Server-side route guard for the /courier PWA layout.
 */
export async function guardCourierRoute(options?: { headers?: Headers }): Promise<AuthContext> {
  const result = await requireRole(["courier", "admin"], {
    ...options,
    redirectIfUnauthorized: true,
  });

  if (!result.ok) {
    redirect("/");
  }

  return result.value;
}

/**
 * Server-side route guard for the /partner/[houseSlug] partner portal layout.
 * Enforces AC 23: non-members trying to access a house route receive a 404.
 */
export async function guardHouseRoute(
  options?: { headers?: Headers; houseId?: string; houseSlug?: string }
): Promise<HouseAuthContext> {
  const result = await requireHouseAccess({
    ...options,
    redirectIfUnauthorized: !options?.houseSlug,
    returnNotFoundOnUnauthorized: Boolean(options?.houseSlug),
  });

  if (!result.ok) {
    if (options?.houseSlug) {
      notFound();
    }
    redirect("/");
  }

  return result.value;
}

/**
 * Retrieves the currently authenticated user if a valid session exists.
 * Returns null if unauthenticated, blocked, or banned.
 */
export async function getCurrentUser(
  options?: { headers?: Headers }
): Promise<AuthenticatedUser | null> {
  try {
    const reqHeaders = options?.headers ?? (await headers());
    const session = await auth.api.getSession({ headers: reqHeaders });

    if (!session?.user) {
      return null;
    }

    const rawUser = session.user as Record<string, unknown>;
    const userRole = (rawUser.role as UserRole) || "customer";
    const userStatus = (rawUser.status as string) || "active";
    const isBanned = Boolean(rawUser.banned);

    if (userStatus === "blocked" || isBanned) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: userRole,
      status: userStatus,
      isGuest: Boolean(rawUser.isGuest),
      contactPhone: (rawUser.contactPhone as string) || null,
    };
  } catch {
    return null;
  }
}

/**
 * Route guard only for login and registration pages (/login, /register).
 * Excluded from password reset pages so authenticated users can access
 * valid reset-password links.
 * If the user is already authenticated (and not a guest), redirects them
 * to their respective role dashboard or the home page.
 */
export async function redirectIfAuthenticated(options?: {
  headers?: Headers;
  redirectTo?: string;
}): Promise<void> {
  const user = await getCurrentUser(options);
  if (!user || user.isGuest) {
    return;
  }

  if (options?.redirectTo) {
    redirect(options.redirectTo);
  }

  switch (user.role) {
    case "admin":
      redirect("/admin/dispatch");
    case "courier":
      redirect("/courier");
    case "house":
      redirect("/partner");
    case "customer":
    default:
      redirect("/houses");
  }
}

