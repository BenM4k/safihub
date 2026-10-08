"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ResetPasswordHeader } from "./reset-password-header";
import { resetPasswordAction } from "@/actions/auth.actions";
import {
  getResetPasswordSchema,
  initialAuthState,
  type ResetPasswordFormValues,
} from "@/lib/validations/auth.schema";

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const t = useTranslations("auth");

  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const schema = getResetPasswordSchema(
    (k) => t(k as Parameters<typeof t>[0])
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
          {t("invalidToken")}
        </div>
        <div className="text-center pt-2">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            {t("forgotPasswordLink")}
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = (data: ResetPasswordFormValues) => {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("token", data.token);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);

      const res = await resetPasswordAction(initialAuthState, formData);
      if (!res.success && res.errors) {
        if (res.errors.form) {
          setServerError(res.errors.form);
        }
        if (res.errors.password) {
          setError("password", { message: res.errors.password });
        }
        if (res.errors.confirmPassword) {
          setError("confirmPassword", { message: res.errors.confirmPassword });
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <input type="hidden" {...register("token")} value={token} />

      {serverError && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium"
        >
          {serverError}
        </div>
      )}

      {/* New Password */}
      <div className="space-y-1.5">
        <Label htmlFor="new-password" className="text-xs sm:text-sm font-semibold">
          {t("newPasswordLabel")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          placeholder={t("passwordPlaceholder")}
          hasError={Boolean(errors.password)}
          aria-describedby={errors.password ? "pass-error" : undefined}
          {...register("password")}
        />
        {errors.password?.message && (
          <p id="pass-error" className="text-xs font-medium text-red-500 mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirm-new-password" className="text-xs sm:text-sm font-semibold">
          {t("confirmPasswordLabel")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="confirm-new-password"
          type="password"
          autoComplete="new-password"
          placeholder={t("confirmPasswordPlaceholder")}
          hasError={Boolean(errors.confirmPassword)}
          aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword?.message && (
          <p id="confirm-error" className="text-xs font-medium text-red-500 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="pill"
          disabled={isPending}
          className="w-full text-base font-semibold shadow-xs transition-transform"
        >
          {isPending ? t("resetting") : t("resetSubmit")}
        </Button>
      </div>

      <div className="mt-6 text-center text-sm text-slate-600">
        <Link
          href="/login"
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          {t("backToLogin")}
        </Link>
      </div>
    </form>
  );
}

export function ResetPasswordForm() {
  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      <ResetPasswordHeader />
      <Suspense fallback={<div className="h-48 animate-pulse bg-slate-100 rounded-lg" />}>
        <ResetPasswordFormContent />
      </Suspense>
    </div>
  );
}
