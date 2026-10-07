"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/services/auth/auth";
import {
  adminCreateGuestUser,
  adminMergeGuestUser,
  adminResetUserPassword,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  requestPasswordReset,
  resetPasswordWithToken,
} from "@/services/auth/auth.service";

// --- Validation Schemas ---

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().trim().email("Please enter a valid email address"),
    phone: z.string().trim().min(6, "Phone number is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    consent: z
      .union([z.boolean(), z.string()])
      .transform((val) => val === true || val === "on" || val === "true")
      .refine((val) => val === true, "You must accept the terms and privacy policy"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is missing or invalid"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const adminCreateGuestSchema = z.object({
  name: z.string().trim().optional(),
  phone: z.string().trim().min(6, "Valid phone number is required"),
});

const adminMergeGuestSchema = z.object({
  guestUserId: z.string().min(1, "Guest user ID is required"),
  targetUserId: z.string().min(1, "Target user ID is required"),
});

const adminResetPasswordSchema = z.object({
  targetUserId: z.string().min(1, "Target user ID is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

// --- Action State Interfaces ---

export interface AuthActionState<T = unknown> {
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
  data?: T;
}

export const initialAuthState: AuthActionState = {
  success: false,
};

// --- Actions ---

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      errors[field] = issue.message;
    }
    return { success: false, errors };
  }

  const reqHeaders = await headers();
  const res = await loginCustomer({
    email: parsed.data.email,
    password: parsed.data.password,
    headers: reqHeaders,
  });

  if (!res.ok) {
    return {
      success: false,
      errors: { form: res.error },
    };
  }

  redirect("/");
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    consent: formData.get("consent"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      errors[field] = issue.message;
    }
    return { success: false, errors };
  }

  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();
  const res = await registerCustomer({
    name: fullName,
    email: parsed.data.email,
    password: parsed.data.password,
    phone: parsed.data.phone,
    consent: parsed.data.consent,
  });

  if (!res.ok) {
    return {
      success: false,
      errors: { form: res.error },
    };
  }

  redirect("/login?registered=true");
}

export async function logoutAction(): Promise<void> {
  const reqHeaders = await headers();
  await logoutCustomer(reqHeaders);
  redirect("/login");
}

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: { email: parsed.error.issues[0]?.message || "Invalid email" },
    };
  }

  const reqHeaders = await headers();
  const res = await requestPasswordReset({
    email: parsed.data.email,
    redirectTo: "/reset-password",
    headers: reqHeaders,
  });

  if (!res.ok) {
    return {
      success: false,
      errors: { form: res.error },
    };
  }

  return {
    success: true,
    message: "A password reset link has been sent to your email address.",
  };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      errors[field] = issue.message;
    }
    return { success: false, errors };
  }

  const reqHeaders = await headers();
  const res = await resetPasswordWithToken({
    token: parsed.data.token,
    newPassword: parsed.data.password,
    headers: reqHeaders,
  });

  if (!res.ok) {
    return {
      success: false,
      errors: { form: res.error },
    };
  }

  redirect("/login?reset=true");
}

export async function adminCreateGuestAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user || session.user.role !== "admin") {
    return { success: false, errors: { form: "Unauthorized: Admin privileges required." } };
  }

  const parsed = adminCreateGuestSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { success: false, errors: { form: parsed.error.issues[0]?.message || "Invalid input" } };
  }

  const res = await adminCreateGuestUser({
    adminUserId: session.user.id,
    name: parsed.data.name,
    phone: parsed.data.phone,
  });

  if (!res.ok) {
    return { success: false, errors: { form: res.error } };
  }

  return { success: true, data: res.value };
}

export async function adminMergeGuestAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user || session.user.role !== "admin") {
    return { success: false, errors: { form: "Unauthorized: Admin privileges required." } };
  }

  const parsed = adminMergeGuestSchema.safeParse({
    guestUserId: formData.get("guestUserId"),
    targetUserId: formData.get("targetUserId"),
  });

  if (!parsed.success) {
    return { success: false, errors: { form: parsed.error.issues[0]?.message || "Invalid input" } };
  }

  const res = await adminMergeGuestUser({
    adminUserId: session.user.id,
    guestUserId: parsed.data.guestUserId,
    targetUserId: parsed.data.targetUserId,
  });

  if (!res.ok) {
    return { success: false, errors: { form: res.error } };
  }

  return { success: true, data: res.value };
}

export async function adminResetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user || session.user.role !== "admin") {
    return { success: false, errors: { form: "Unauthorized: Admin privileges required." } };
  }

  const parsed = adminResetPasswordSchema.safeParse({
    targetUserId: formData.get("targetUserId"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return { success: false, errors: { form: parsed.error.issues[0]?.message || "Invalid input" } };
  }

  const res = await adminResetUserPassword({
    adminUserId: session.user.id,
    targetUserId: parsed.data.targetUserId,
    newPassword: parsed.data.newPassword,
    headers: reqHeaders,
  });

  if (!res.ok) {
    return { success: false, errors: { form: res.error } };
  }

  return { success: true, message: "User password updated successfully." };
}
