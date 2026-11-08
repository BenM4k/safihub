import "server-only";

import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
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
  emailVerified?: boolean;
  contactPhone?: string | null;
  mustChangePassword?: boolean;
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
  const session = await auth.api.getSession({
    headers: reqHeaders,
    query: { disableCookieCache: true },
  });

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

  const isEmailVerified = Boolean(rawUser.emailVerified);

  const authUser: AuthenticatedUser = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: userRole,
    status: userStatus,
    isGuest: Boolean(rawUser.isGuest),
    emailVerified: isEmailVerified,
    contactPhone: (rawUser.contactPhone as string) || null,
    mustChangePassword: Boolean(rawUser.mustChangePassword),
  };

  // Enforce account blocking
  if (userStatus === "blocked" || isBanned) {
    if (options?.redirectIfUnauthorized) {
      redirect("/login?error=blocked");
    }
    return err("Forbidden: Account is blocked.");
  }

  // Enforce mandatory email verification for all non-guest users
  if (!authUser.isGuest && !isEmailVerified) {
    if (options?.redirectIfUnauthorized) {
      redirect("/login?error=unverified");
    }
    return err("Forbidden: Email address is not verified.");
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

  // First-login gate: if mustChangePassword is set, redirect to /change-password immediately
  if (result.value.user.mustChangePassword) {
    redirect("/change-password");
  }

  return result.value;
}

function mapSessionToAuthenticatedUser(
  rawSessionUser: Record<string, unknown>
): AuthenticatedUser | null {
  const userRole = (rawSessionUser.role as UserRole) || "customer";
  const userStatus = (rawSessionUser.status as string) || "active";
  const isBanned = Boolean(rawSessionUser.banned);

  if (userStatus === "blocked" || isBanned) {
    return null;
  }

  return {
    id: String(rawSessionUser.id),
    email: String(rawSessionUser.email),
    name: String(rawSessionUser.name),
    role: userRole,
    status: userStatus,
    isGuest: Boolean(rawSessionUser.isGuest),
    emailVerified: Boolean(rawSessionUser.emailVerified),
    contactPhone: (rawSessionUser.contactPhone as string) || null,
    mustChangePassword: Boolean(rawSessionUser.mustChangePassword),
  };
}

interface CachedSessionUser {
  user: AuthenticatedUser | null;
  expiresAt: number;
}

const SESSION_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes in-memory TTL
const sessionMemoryCache = new Map<string, CachedSessionUser>();
const inFlightLookups = new Map<string, Promise<AuthenticatedUser | null>>();
let cacheGeneration = 0;

/**
 * Clears the process-local in-memory session cache and cancels in-flight resolution effects.
 * Increments the cache generation counter so in-flight lookups do not repopulate invalidated sessions.
 */
export function clearSessionMemoryCache(sessionKey?: string): void {
  cacheGeneration++;
  if (sessionKey) {
    sessionMemoryCache.delete(sessionKey);
    inFlightLookups.delete(sessionKey);
  } else {
    sessionMemoryCache.clear();
    inFlightLookups.clear();
  }
}

function getFromSessionMemoryCache(key: string): AuthenticatedUser | null | undefined {
  const entry = sessionMemoryCache.get(key);
  if (!entry) return undefined;
  if (performance.now() > entry.expiresAt) {
    sessionMemoryCache.delete(key);
    return undefined;
  }
  return entry.user;
}

function setInSessionMemoryCache(key: string, user: AuthenticatedUser | null): void {
  if (sessionMemoryCache.size > 1000) {
    const now = performance.now();
    for (const [k, v] of sessionMemoryCache.entries()) {
      if (now > v.expiresAt) {
        sessionMemoryCache.delete(k);
      }
    }
  }
  sessionMemoryCache.set(key, {
    user,
    expiresAt: performance.now() + SESSION_CACHE_TTL_MS,
  });
}

/**
 * Resolves an authenticated user from Better Auth using the request cookie header.
 * Deduplicates concurrent lookups using an in-flight map and checks generation on completion.
 */
async function resolveUserByCookieHeader(
  cookieHeader: string
): Promise<AuthenticatedUser | null> {
  const cached = getFromSessionMemoryCache(cookieHeader);
  if (cached !== undefined) {
    return cached;
  }

  const existingInFlight = inFlightLookups.get(cookieHeader);
  if (existingInFlight) {
    return existingInFlight;
  }

  const startGeneration = cacheGeneration;

  const lookupPromise = (async () => {
    try {
      const reqHeaders = new Headers({ cookie: cookieHeader });
      const session = await auth.api.getSession({ headers: reqHeaders });
      if (!session?.user) {
        if (cacheGeneration === startGeneration) {
          setInSessionMemoryCache(cookieHeader, null);
        }
        return null;
      }

      const user = mapSessionToAuthenticatedUser(
        session.user as Record<string, unknown>
      );
      if (cacheGeneration === startGeneration) {
        setInSessionMemoryCache(cookieHeader, user);
      }
      return user;
    } catch {
      return null;
    }
  })();

  inFlightLookups.set(cookieHeader, lookupPromise);
  try {
    return await lookupPromise;
  } finally {
    if (inFlightLookups.get(cookieHeader) === lookupPromise) {
      inFlightLookups.delete(cookieHeader);
    }
  }
}

const getRequestCurrentUser = cache(async (): Promise<AuthenticatedUser | null> => {
  try {
    const cookieStore = await cookies();
    const sessionCookies = cookieStore
      .getAll()
      .filter((c) => c.name.includes("better-auth"));

    if (sessionCookies.length === 0) {
      return null;
    }

    const cookieHeader = sessionCookies
      .map((c) => `${c.name}=${c.value}`)
      .sort()
      .join("; ");

    return await resolveUserByCookieHeader(cookieHeader);
  } catch {
    return null;
  }
});

export interface GetCurrentUserOptions {
  headers?: Headers;
  fresh?: boolean;
}

/**
 * Retrieves the currently authenticated user if a valid session exists.
 * Deduplicated per-request via React `cache()` and cached in-memory with a short TTL
 * for non-authorization request paths. Authorization and explicit-header checks bypass
 * the in-memory cache and validate freshly with cookie cache disabled.
 * Returns null if unauthenticated, blocked, or banned.
 */
export async function getCurrentUser(
  options?: GetCurrentUserOptions
): Promise<AuthenticatedUser | null> {
  if (!options?.headers && !options?.fresh) {
    return getRequestCurrentUser();
  }

  try {
    const reqHeaders = options?.headers ?? (await headers());
    const session = await auth.api.getSession({
      headers: reqHeaders,
      query: { disableCookieCache: true },
    });
    if (!session?.user) {
      return null;
    }

    return mapSessionToAuthenticatedUser(
      session.user as Record<string, unknown>
    );
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

