"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
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

type AuthTranslator = (key: string) => string;

// --- Validation Schemas ---

function createLoginSchema(t: AuthTranslator) {
  return z.object({
    email: z.string().trim().email(t("validation.invalidEmail")),
    password: z.string().min(1, t("validation.passwordRequired")),
  });
}

function createRegisterSchema(t: AuthTranslator) {
  return z
    .object({
      firstName: z.string().trim().min(1, t("validation.firstNameRequired")),
      lastName: z.string().trim().min(1, t("validation.lastNameRequired")),
      email: z.string().trim().email(t("validation.invalidEmail")),
      phone: z.string().trim().min(6, t("validation.phoneRequired")),
      password: z
        .string()
        .min(8, t("validation.passwordMinLength"))
        .regex(/[A-Z]/, t("validation.passwordUppercase"))
        .regex(/[a-z]/, t("validation.passwordLowercase"))
        .regex(/[0-9]/, t("validation.passwordNumber"))
        .regex(/[^A-Za-z0-9]/, t("validation.passwordSpecial")),
      confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
      consent: z
        .union([z.boolean(), z.string()])
        .transform((val) => val === true || val === "on" || val === "true")
        .refine((val) => val === true, t("validation.consentRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsMismatch"),
      path: ["confirmPassword"],
    });
}

function createForgotPasswordSchema(t: AuthTranslator) {
  return z.object({
    email: z.string().trim().email(t("validation.invalidEmail")),
  });
}

function createResetPasswordSchema(t: AuthTranslator) {
  return z
    .object({
      token: z.string().min(1, t("validation.tokenRequired")),
      password: z
        .string()
        .min(8, t("validation.passwordMinLength"))
        .regex(/[A-Z]/, t("validation.passwordUppercase"))
        .regex(/[a-z]/, t("validation.passwordLowercase"))
        .regex(/[0-9]/, t("validation.passwordNumber"))
        .regex(/[^A-Za-z0-9]/, t("validation.passwordSpecial")),
      confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsMismatch"),
      path: ["confirmPassword"],
    });
}

function createAdminCreateGuestSchema(t: AuthTranslator) {
  return z.object({
    name: z.string().trim().optional(),
    phone: z.string().trim().min(6, t("validation.phoneRequired")),
  });
}

function createAdminMergeGuestSchema(t: AuthTranslator) {
  return z.object({
    guestUserId: z.string().min(1, t("validation.guestUserIdRequired")),
    targetUserId: z.string().min(1, t("validation.targetUserIdRequired")),
  });
}

function createAdminResetPasswordSchema(t: AuthTranslator) {
  return z.object({
    targetUserId: z.string().min(1, t("validation.targetUserIdRequired")),
    newPassword: z.string().min(8, t("validation.passwordMinLength")),
  });
}

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
  const t = await getTranslations("auth");
  const schema = createLoginSchema((k) => t(k as Parameters<typeof t>[0]));
  const parsed = schema.safeParse({
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
    let errorMsg = res.error;
    if (res.error === "Account is blocked. Please contact support.") {
      errorMsg = t("validation.accountBlocked");
    } else if (res.error === "Invalid email or password.") {
      errorMsg = t("validation.invalidCredentials");
    }
    return {
      success: false,
      errors: { form: errorMsg },
    };
  }

  redirect("/");
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const t = await getTranslations("auth");
  const schema = createRegisterSchema((k) => t(k as Parameters<typeof t>[0]));
  const parsed = schema.safeParse({
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
  const t = await getTranslations("auth");
  const schema = createForgotPasswordSchema((k) => t(k as Parameters<typeof t>[0]));
  const parsed = schema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: { email: parsed.error.issues[0]?.message || t("validation.invalidEmail") },
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
    message: t("resetLinkSent"),
  };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const t = await getTranslations("auth");
  const schema = createResetPasswordSchema((k) => t(k as Parameters<typeof t>[0]));
  const parsed = schema.safeParse({
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
  const t = await getTranslations("auth");
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user || session.user.role !== "admin") {
    return { success: false, errors: { form: t("adminRequired") } };
  }

  const schema = createAdminCreateGuestSchema((k) => t(k as Parameters<typeof t>[0]));
  const parsed = schema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { success: false, errors: { form: parsed.error.issues[0]?.message || t("validation.invalidInput") } };
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
  const t = await getTranslations("auth");
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user || session.user.role !== "admin") {
    return { success: false, errors: { form: t("adminRequired") } };
  }

  const schema = createAdminMergeGuestSchema((k) => t(k as Parameters<typeof t>[0]));
  const parsed = schema.safeParse({
    guestUserId: formData.get("guestUserId"),
    targetUserId: formData.get("targetUserId"),
  });

  if (!parsed.success) {
    return { success: false, errors: { form: parsed.error.issues[0]?.message || t("validation.invalidInput") } };
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
  const t = await getTranslations("auth");
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user || session.user.role !== "admin") {
    return { success: false, errors: { form: t("adminRequired") } };
  }

  const schema = createAdminResetPasswordSchema((k) => t(k as Parameters<typeof t>[0]));
  const parsed = schema.safeParse({
    targetUserId: formData.get("targetUserId"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return { success: false, errors: { form: parsed.error.issues[0]?.message || t("validation.invalidInput") } };
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

  return { success: true, message: t("passwordUpdated") };
}
