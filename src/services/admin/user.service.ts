import "server-only";
import { revalidateTag } from "next/cache";
import { hashPassword } from "better-auth/crypto";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { err, ok, type Result } from "@/lib/result";
import {
  blockAdminUserWithGuard,
  countActiveAdmins,
  createStaffAccountTransaction,
  deleteUserSessions,
  getAdminUsers,
  getUserById,
  mergeGuestUser,
  setUserPasswordCredential,
  updateUserRoleAndStatus,
  updateUserRoleWithHouseAndGuard,
  type GuestMergeResult,
  type UserRecord,
} from "@/dal";

export async function listAdminUsers(params?: {
  query?: string;
  role?: string;
  roles?: string[];
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Result<UserRecord[]>> {
  try {
    const users = await getAdminUsers(params);
    return ok(users);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load users");
  }
}

export async function getActiveAdminsCount(): Promise<Result<number>> {
  try {
    const count = await countActiveAdmins();
    return ok(count);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to count active admins");
  }
}

export async function blockAdminUser(params: {
  userId: string;
  reason: string;
}): Promise<Result<void>> {
  try {
    if (!params.reason?.trim()) {
      return err("Un motif est obligatoire pour bloquer un compte utilisateur");
    }

    const targetUser = await getUserById(params.userId);
    if (!targetUser) {
      return err("Utilisateur introuvable");
    }

    const isTargetActiveAdmin =
      targetUser.role === "admin" &&
      !targetUser.banned &&
      targetUser.status !== "blocked";

    const res = await blockAdminUserWithGuard({
      userId: params.userId,
      reason: params.reason.trim(),
      isTargetActiveAdmin,
    });
    if (res.ok) {
      revalidateTag(CACHE_TAGS.userSession(params.userId), "max");
      revalidateTag(CACHE_TAGS.authSessions, "max");
    }
    return res;
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to block user");
  }
}

export async function updateAdminUserRole(params: {
  userId: string;
  newRole: string;
  houseId?: string | null;
}): Promise<Result<void>> {
  try {
    const targetUser = await getUserById(params.userId);
    if (!targetUser) {
      return err("Utilisateur introuvable");
    }

    if (params.newRole === "house" && !params.houseId?.trim()) {
      return err("Un pressing doit être sélectionné pour le rôle Pressing");
    }

    const isTargetActiveAdminDemotion =
      targetUser.role === "admin" &&
      params.newRole !== "admin" &&
      !targetUser.banned &&
      targetUser.status !== "blocked";

    const res = await updateUserRoleWithHouseAndGuard({
      userId: params.userId,
      newRole: params.newRole,
      houseId: params.newRole === "house" ? params.houseId : null,
      isTargetActiveAdminDemotion,
    });
    if (res.ok) {
      revalidateTag(CACHE_TAGS.userSession(params.userId), "max");
      revalidateTag(CACHE_TAGS.authSessions, "max");
    }
    return res;
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to update user role");
  }
}

export async function unblockAdminUser(userId: string): Promise<Result<void>> {
  try {
    await updateUserRoleAndStatus(userId, {
      banned: false,
      status: "active",
      banReason: null,
    });
    revalidateTag(CACHE_TAGS.userSession(userId), "max");
    revalidateTag(CACHE_TAGS.authSessions, "max");
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to unblock user");
  }
}

export async function resetAdminUserPassword(params: {
  userId: string;
  newPassword: string;
}): Promise<Result<void>> {
  try {
    if (!params.newPassword || params.newPassword.length < 8) {
      return err("Password must contain at least 8 characters");
    }

    const hashedPassword = await hashPassword(params.newPassword);
    await setUserPasswordCredential({
      userId: params.userId,
      hashedPassword,
    });

    // Revoke all active sessions immediately
    await deleteUserSessions(params.userId);
    revalidateTag(CACHE_TAGS.userSession(params.userId), "max");
    revalidateTag(CACHE_TAGS.authSessions, "max");

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to reset password");
  }
}

export async function createAdminStaffAccount(params: {
  name: string;
  email: string;
  role: "courier" | "house" | "admin";
  phone?: string | null;
  password?: string;
  houseId?: string | null;
}): Promise<Result<{ userId: string }>> {
  try {
    if (!params.name?.trim() || !params.email?.trim()) {
      return err("Name and email are required for staff account creation");
    }

    const userId = `usr_${params.role}_${crypto.randomUUID().slice(0, 8)}`;
    const hashedPassword = params.password?.trim()
      ? await hashPassword(params.password.trim())
      : undefined;

    await createStaffAccountTransaction({
      user: {
        id: userId,
        name: params.name.trim(),
        email: params.email.trim().toLowerCase(),
        role: params.role,
        contactPhone: params.phone?.trim() ?? null,
      },
      hashedPassword,
      houseId: params.role === "house" ? params.houseId : null,
    });

    return ok({ userId });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to create staff account");
  }
}

export async function mergeAdminGuestCustomer(params: {
  guestUserId: string;
  targetUserId: string;
}): Promise<Result<GuestMergeResult>> {
  try {
    return await mergeGuestUser(params);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to merge guest account");
  }
}
