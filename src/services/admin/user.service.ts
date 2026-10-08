import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  addHouseMember,
  createStaffUser,
  mergeGuestUser,
  searchUsers,
  setUserPasswordCredential,
  updateUserRoleAndStatus,
  type GuestMergeResult,
  type UserRecord,
} from "@/dal";

export async function listAdminUsers(params?: {
  query?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Result<UserRecord[]>> {
  try {
    const users = await searchUsers(params);
    return ok(users);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load users");
  }
}

export async function blockAdminUser(params: {
  userId: string;
  reason: string;
}): Promise<Result<void>> {
  try {
    if (!params.reason?.trim()) {
      return err("A reason is mandatory when blocking a user account");
    }

    await updateUserRoleAndStatus(params.userId, {
      banned: true,
      status: "blocked",
      banReason: params.reason.trim(),
    });
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to block user");
  }
}

export async function unblockAdminUser(userId: string): Promise<Result<void>> {
  try {
    await updateUserRoleAndStatus(userId, {
      banned: false,
      status: "active",
      banReason: null,
    });
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

    // Hash or store credential password
    await setUserPasswordCredential({
      userId: params.userId,
      hashedPassword: params.newPassword,
    });

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
    await createStaffUser({
      id: userId,
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      role: params.role,
      contactPhone: params.phone?.trim() ?? null,
    });

    if (params.password?.trim()) {
      await setUserPasswordCredential({
        userId,
        hashedPassword: params.password.trim(),
      });
    }

    if (params.role === "house" && params.houseId) {
      await addHouseMember({
        houseId: params.houseId,
        userId,
      });
    }

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
