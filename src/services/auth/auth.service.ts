import "server-only";
import { auth } from "./auth";
import {
  blockUserAccount,
  createGuestUser,
  getUserByEmail,
  getUserById,
  mergeGuestUser,
  recordConsent,
  setUserPasswordCredential,
  unblockUserAccount,
  updateUserRole,
  type GuestMergeResult,
} from "@/dal";
import { err, ok, type Result } from "@/lib/result";
import type { UserRole } from "./permissions";


export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  consent: boolean;
}

export interface LoginUserInput {
  email: string;
  password: string;
  headers?: Headers;
}

export interface RequestPasswordResetInput {
  email: string;
  redirectTo?: string;
  headers?: Headers;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
  headers?: Headers;
}

export interface AdminResetPasswordInput {
  adminUserId: string;
  targetUserId: string;
  newPassword: string;
  headers?: Headers;
}

export interface AdminCreateGuestInput {
  adminUserId: string;
  name?: string;
  phone: string;
}

export interface AdminMergeGuestInput {
  adminUserId: string;
  guestUserId: string;
  targetUserId: string;
}

/**
 * Registers a new customer account with credentials, contactPhone, and consent audit entries.
 */
export async function registerCustomer(
  input: RegisterUserInput
): Promise<Result<{ user: Record<string, unknown>; token?: string | null }>> {
  if (!input.consent) {
    return err("Consent to Terms and Privacy Policy is required to register.");
  }

  const normalizedEmail = input.email.toLowerCase().trim();
  const normalizedPhone = input.phone.trim();
  const normalizedName = input.name.trim();

  // Check if a registered user with this email already exists
  const existingUser = await getUserByEmail(normalizedEmail);
  if (existingUser && !existingUser.isGuest) {
    return err("A registered account with this email address already exists.");
  }

  try {
    const authResult = await auth.api.signUpEmail({
      body: {
        email: normalizedEmail,
        password: input.password,
        name: normalizedName,
        contactPhone: normalizedPhone,
      },
    });

    if (!authResult || !authResult.user) {
      return err("Failed to create account credentials.");
    }

    const userId = authResult.user.id;

    // Record required legal consents (Terms of Service & Privacy Policy)
    const termsConsent = await recordConsent({
      userId,
      document: "terms",
      version: "1.0",
    });
    if (!termsConsent.ok) {
      console.error("Failed to record terms consent for user", userId, termsConsent.error);
      return err("Failed to record required legal consent.");
    }

    const privacyConsent = await recordConsent({
      userId,
      document: "privacy",
      version: "1.0",
    });
    if (!privacyConsent.ok) {
      console.error("Failed to record privacy consent for user", userId, privacyConsent.error);
      return err("Failed to record required legal consent.");
    }

    return ok({
      user: authResult.user as unknown as Record<string, unknown>,
      token: authResult.token,
    });
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Error during registration."
    );
  }
}

/**
 * Authenticates an existing user via email and password credentials.
 */
export async function loginCustomer(
  input: LoginUserInput
): Promise<Result<{ user: Record<string, unknown>; token?: string | null }>> {
  const normalizedEmail = input.email.toLowerCase().trim();

  try {
    const authResult = await auth.api.signInEmail({
      body: {
        email: normalizedEmail,
        password: input.password,
      },
      headers: input.headers,
    });

    if (!authResult || !authResult.user) {
      return err("Invalid email or password.");
    }

    const userRecord = await getUserById(authResult.user.id);
    if (userRecord && (userRecord.status === "blocked" || userRecord.banned)) {
      return err("Account is blocked. Please contact support.");
    }

    return ok({
      user: authResult.user as unknown as Record<string, unknown>,
      token: authResult.token,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (
      msg.includes("blocked") ||
      msg.includes("banned") ||
      msg.includes("BANNED_USER") ||
      msg.includes("FORBIDDEN")
    ) {
      return err("Account is blocked. Please contact support.");
    }
    return err(
      error instanceof Error ? error.message : "Invalid email or password."
    );
  }
}

/**
 * Signs out the current user session.
 */
export async function logoutCustomer(headers?: Headers): Promise<Result<boolean>> {
  try {
    if (headers) {
      await auth.api.signOut({
        headers,
      });
    }
    return ok(true);
  } catch {
    return ok(true);
  }
}

/**
 * Requests a password reset email link for the specified email address.
 */
export async function requestPasswordReset(
  input: RequestPasswordResetInput
): Promise<Result<{ sent: boolean }>> {
  const normalizedEmail = input.email.toLowerCase().trim();

  try {
    await auth.api.requestPasswordReset({
      body: {
        email: normalizedEmail,
        redirectTo: input.redirectTo,
      },
      headers: input.headers,
    });

    return ok({ sent: true });
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Failed to request password reset."
    );
  }
}

/**
 * Resets a user's password using a valid email token.
 */
export async function resetPasswordWithToken(
  input: ResetPasswordInput
): Promise<Result<{ success: boolean }>> {
  try {
    await auth.api.resetPassword({
      body: {
        token: input.token,
        newPassword: input.newPassword,
      },
      headers: input.headers,
    });

    return ok({ success: true });
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Invalid or expired password reset token."
    );
  }
}

/**
 * Admin action: Resets a user's password directly (fallback when email is unavailable).
 */
export async function adminResetUserPassword(
  input: AdminResetPasswordInput
): Promise<Result<{ success: boolean }>> {
  const adminUser = await getUserById(input.adminUserId);
  if (!adminUser || adminUser.role !== "admin") {
    return err("Unauthorized: Only administrators can reset user passwords.");
  }

  const targetUser = await getUserById(input.targetUserId);
  if (!targetUser) {
    return err("Target user not found.");
  }

  try {
    if (input.headers) {
      await auth.api.setUserPassword({
        body: {
          userId: input.targetUserId,
          newPassword: input.newPassword,
        },
        headers: input.headers,
      });
      return ok({ success: true });
    }

    // Direct password update via Better Auth hasher and DAL
    const ctx = await (auth as unknown as { $context: Promise<{ password: { hash: (p: string) => Promise<string> } }> }).$context;
    const hashedPassword = await ctx.password.hash(input.newPassword);
    const updateRes = await setUserPasswordCredential({
      userId: input.targetUserId,
      hashedPassword,
    });

    if (!updateRes.ok) {
      return err(updateRes.error);
    }

    return ok({ success: true });
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Failed to reset password for user."
    );
  }
}

/**
 * Admin action: Creates a guest user with placeholder email and contact phone.
 * Guest users have no password and cannot sign in directly.
 */
export async function adminCreateGuestUser(
  input: AdminCreateGuestInput
): Promise<Result<{ id: string; email: string; name: string; contactPhone: string | null }>> {
  const adminUser = await getUserById(input.adminUserId);
  if (!adminUser || adminUser.role !== "admin") {
    return err("Unauthorized: Only administrators can create guest users.");
  }

  const created = await createGuestUser({
    name: input.name,
    phone: input.phone,
  });

  if (!created.ok) {
    return err(created.error);
  }

  return ok({
    id: created.value.id,
    email: created.value.email,
    name: created.value.name,
    contactPhone: created.value.contactPhone,
  });
}

/**
 * Admin action: Merges a guest customer account into a registered authenticated account.
 */
export async function adminMergeGuestUser(
  input: AdminMergeGuestInput
): Promise<Result<GuestMergeResult>> {
  const adminUser = await getUserById(input.adminUserId);
  if (!adminUser || adminUser.role !== "admin") {
    return err("Unauthorized: Only administrators can merge guest users.");
  }

  return mergeGuestUser({
    guestUserId: input.guestUserId,
    targetUserId: input.targetUserId,
  });
}

/**
 * Admin action: Blocks a user account, setting status to blocked and revoking active sessions.
 */
export async function adminBlockUser({
  adminUserId,
  targetUserId,
  reason,
}: {
  adminUserId: string;
  targetUserId: string;
  reason?: string;
}): Promise<Result<Record<string, unknown>>> {
  const adminUser = await getUserById(adminUserId);
  if (!adminUser || adminUser.role !== "admin") {
    return err("Unauthorized: Only administrators can block users.");
  }

  const result = await blockUserAccount({
    userId: targetUserId,
    reason,
  });

  if (!result.ok) {
    return err(result.error);
  }

  return ok(result.value as unknown as Record<string, unknown>);
}

/**
 * Admin action: Unblocks a previously blocked user account.
 */
export async function adminUnblockUser({
  adminUserId,
  targetUserId,
}: {
  adminUserId: string;
  targetUserId: string;
}): Promise<Result<Record<string, unknown>>> {
  const adminUser = await getUserById(adminUserId);
  if (!adminUser || adminUser.role !== "admin") {
    return err("Unauthorized: Only administrators can unblock users.");
  }

  const result = await unblockUserAccount(targetUserId);

  if (!result.ok) {
    return err(result.error);
  }

  return ok(result.value as unknown as Record<string, unknown>);
}

/**
 * Admin action: Sets the system role for a user account.
 */
export async function adminSetUserRole({
  adminUserId,
  targetUserId,
  role,
}: {
  adminUserId: string;
  targetUserId: string;
  role: UserRole;
}): Promise<Result<Record<string, unknown>>> {
  const adminUser = await getUserById(adminUserId);
  if (!adminUser || adminUser.role !== "admin") {
    return err("Unauthorized: Only administrators can change user roles.");
  }

  const result = await updateUserRole({
    userId: targetUserId,
    role,
  });

  if (!result.ok) {
    return err(result.error);
  }

  return ok(result.value as unknown as Record<string, unknown>);
}

