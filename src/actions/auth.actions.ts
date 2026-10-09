"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
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

import {
  getLoginSchema,
  getRegisterSchema,
  getForgotPasswordSchema,
  getResetPasswordSchema,
  getAdminCreateGuestSchema,
  getAdminMergeGuestSchema,
  getAdminResetPasswordSchema,
  type AuthActionState,
} from "@/lib/validations/auth.schema";

// --- Actions ---

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const t = await getTranslations("auth");
  const schema = getLoginSchema((k) => t(k as Parameters<typeof t>[0]));
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
    } else if (res.error === "Trop de tentatives de connexion. Veuillez réessayer plus tard.") {
      errorMsg = t("validation.rateLimited");
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
  const schema = getRegisterSchema((k) => t(k as Parameters<typeof t>[0]));
  const consentRaw = formData.get("consent");
  const consent = consentRaw === "on" || consentRaw === "true";
  const photoConsentRaw = formData.get("photoConsent");
  const photoConsent = photoConsentRaw === "on" || photoConsentRaw === "true";
  const parsed = schema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    consent,
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
    photoConsent,
  });

  if (!res.ok) {
    let errorMsg = res.error;
    if (res.error === "Trop de tentatives d'inscription. Veuillez réessayer plus tard.") {
      errorMsg = t("validation.rateLimited");
    } else if (res.error === "Ce numéro de téléphone ou cette adresse email est bloqué. Impossible de créer un compte.") {
      errorMsg = t("validation.phoneBlocked");
    }
    return {
      success: false,
      errors: { form: errorMsg },
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
  const schema = getForgotPasswordSchema((k) => t(k as Parameters<typeof t>[0]));
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
  const schema = getResetPasswordSchema((k) => t(k as Parameters<typeof t>[0]));
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

  const schema = getAdminCreateGuestSchema((k) => t(k as Parameters<typeof t>[0]));
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

  const schema = getAdminMergeGuestSchema((k) => t(k as Parameters<typeof t>[0]));
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

  const schema = getAdminResetPasswordSchema((k) => t(k as Parameters<typeof t>[0]));
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
