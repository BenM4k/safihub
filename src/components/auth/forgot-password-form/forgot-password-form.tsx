"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ForgotPasswordHeader } from "./forgot-password-header";
import { forgotPasswordAction } from "@/actions/auth.actions";
import {
  getForgotPasswordSchema,
  initialAuthState,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth.schema";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const schema = getForgotPasswordSchema(
    (k) => t(k as Parameters<typeof t>[0])
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);

      const res = await forgotPasswordAction(initialAuthState, formData);
      if (res.success) {
        setIsSuccess(true);
      } else if (res.errors) {
        if (res.errors.form) {
          setServerError(res.errors.form);
        }
        if (res.errors.email) {
          setError("email", { message: res.errors.email });
        }
      }
    });
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      <ForgotPasswordHeader />

      {isSuccess ? (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
            <h3 className="text-sm font-semibold">{t("resetLinkSentTitle")}</h3>
            <p className="mt-1 text-xs sm:text-sm text-emerald-700">
              {t("resetLinkSentDesc")}
            </p>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              {t("backToLogin")}
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {serverError && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium"
            >
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="reset-email" className="text-xs sm:text-sm font-semibold">
              {t("emailLabel")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              hasError={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email?.message && (
              <p id="email-error" className="text-xs font-medium text-red-500 mt-1">
                {errors.email.message}
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
              {isPending ? t("sendingResetLink") : t("sendResetLink")}
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
      )}
    </div>
  );
}
