import { z } from "zod";

export type AuthTranslator = (key: string) => string;

export function getLoginSchema(t: AuthTranslator) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t("validation.invalidEmail"))
      .email(t("validation.invalidEmail")),
    password: z.string().min(1, t("validation.passwordRequired")),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof getLoginSchema>>;

export function getRegisterSchema(t: AuthTranslator) {
  return z
    .object({
      firstName: z.string().trim().min(1, t("validation.firstNameRequired")),
      lastName: z.string().trim().min(1, t("validation.lastNameRequired")),
      email: z
        .string()
        .trim()
        .min(1, t("validation.invalidEmail"))
        .email(t("validation.invalidEmail")),
      phone: z.string().trim().min(6, t("validation.phoneRequired")),
      password: z
        .string()
        .min(8, t("validation.passwordMinLength"))
        .regex(/[A-Z]/, t("validation.passwordUppercase"))
        .regex(/[a-z]/, t("validation.passwordLowercase"))
        .regex(/[0-9]/, t("validation.passwordNumber"))
        .regex(/[^A-Za-z0-9]/, t("validation.passwordSpecial")),
      confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
      consent: z.boolean().refine((val) => val === true, {
        message: t("validation.consentRequired"),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsMismatch"),
      path: ["confirmPassword"],
    });
}

export type RegisterFormValues = z.infer<ReturnType<typeof getRegisterSchema>>;

export function getForgotPasswordSchema(t: AuthTranslator) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t("validation.invalidEmail"))
      .email(t("validation.invalidEmail")),
  });
}

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof getForgotPasswordSchema>
>;

export function getResetPasswordSchema(t: AuthTranslator) {
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

export type ResetPasswordFormValues = z.infer<
  ReturnType<typeof getResetPasswordSchema>
>;

export interface AuthActionState<T = unknown> {
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
  data?: T;
}

export const initialAuthState: AuthActionState = {
  success: false,
};

export function getAdminCreateGuestSchema(t: AuthTranslator) {
  return z.object({
    name: z.string().trim().optional(),
    phone: z.string().trim().min(6, t("validation.phoneRequired")),
  });
}

export function getAdminMergeGuestSchema(t: AuthTranslator) {
  return z.object({
    guestUserId: z.string().min(1, t("validation.guestUserIdRequired")),
    targetUserId: z.string().min(1, t("validation.targetUserIdRequired")),
  });
}

export function getAdminResetPasswordSchema(t: AuthTranslator) {
  return z.object({
    targetUserId: z.string().min(1, t("validation.targetUserIdRequired")),
    newPassword: z.string().min(8, t("validation.passwordMinLength")),
  });
}
