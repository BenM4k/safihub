import "server-only";
import { hashPassword } from "better-auth/crypto";
import { err, ok, type Result } from "@/lib/result";
import {
  countActiveAdmins,
  createStaffAccountTransaction,
  getUserById,
  mergeGuestUser,
  searchUsers,
  setUserPasswordCredential,
  updateUserRoleAndStatus,
  updateUserRoleWithHouse,
  type GuestMergeResult,
  type UserRecord,
} from "@/dal";
import { db, schema } from "@/dal/db";
import { eq } from "drizzle-orm";

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
      return err("Un motif est obligatoire pour bloquer un compte utilisateur");
    }

    const targetUser = await getUserById(params.userId);
    if (!targetUser) {
      return err("Utilisateur introuvable");
    }

    // Guardrail: Cannot block the last active administrator
    if (targetUser.role === "admin") {
      const activeAdminsCount = await countActiveAdmins();
      if (activeAdminsCount <= 1) {
        return err(
          "Impossible de bloquer le dernier administrateur actif de la plateforme."
        );
      }
    }

    await updateUserRoleAndStatus(params.userId, {
      banned: true,
      status: "blocked",
      banReason: params.reason.trim(),
    });

    // Revoke all active sessions immediately
    await db.delete(schema.session).where(eq(schema.session.userId, params.userId));

    return ok(undefined);
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

    // Guardrail: Cannot demote the last active administrator
    if (targetUser.role === "admin" && params.newRole !== "admin") {
      const activeAdminsCount = await countActiveAdmins();
      if (activeAdminsCount <= 1) {
        return err(
          "Impossible de modifier le rôle du dernier administrateur actif de la plateforme."
        );
      }
    }

    if (params.newRole === "house" && !params.houseId?.trim()) {
      return err("Un pressing doit être sélectionné pour le rôle Pressing");
    }

    await updateUserRoleWithHouse({
      userId: params.userId,
      role: params.newRole,
      houseId: params.newRole === "house" ? params.houseId : null,
    });

    return ok(undefined);
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
