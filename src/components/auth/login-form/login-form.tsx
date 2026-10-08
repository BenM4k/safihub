"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginHeader } from "./login-header";
import { LoginSubmitButton } from "./login-submit-button";
import { LoginSwitch } from "./login-switch";
import { loginAction } from "@/actions/auth.actions";
import {
  getLoginSchema,
  initialAuthState,
  type LoginFormValues,
} from "@/lib/validations/auth.schema";

function LoginSuccessBanner() {
  const searchParams = useSearchParams();
  const t = useTranslations("auth");

  const isRegistered = searchParams.get("registered") === "true";
  const isReset = searchParams.get("reset") === "true";

  if (!isRegistered && !isReset) return null;

  return (
    <div className="mb-4 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium">
      {isRegistered && t("registeredSuccess")}
      {isReset && t("resetSuccess")}
    </div>
  );
}

export function LoginForm() {
  const t = useTranslations("auth");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const schema = getLoginSchema((k) => t(k as Parameters<typeof t>[0]));

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = (data: LoginFormValues) => {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const res = await loginAction(initialAuthState, formData);
      if (!res.success && res.errors) {
        if (res.errors.form) {
          setServerError(res.errors.form);
        }
        if (res.errors.email) {
          setError("email", { message: res.errors.email });
        }
        if (res.errors.password) {
          setError("password", { message: res.errors.password });
        }
      }
    });
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      <LoginHeader />

      <Suspense fallback={null}>
        <LoginSuccessBanner />
      </Suspense>

      {serverError && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium"
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Email field */}
        <div className="space-y-1.5">
          <Label htmlFor="login-email" className="text-xs sm:text-sm font-semibold">
            {t("emailLabel")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="login-email"
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

        {/* Password field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" className="text-xs sm:text-sm font-semibold">
              {t("passwordLabel")} <span className="text-red-500">*</span>
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline underline-offset-4"
            >
              {t("forgotPasswordLink")}
            </Link>
          </div>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            hasError={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password?.message && (
            <p id="password-error" className="text-xs font-medium text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Primary CTA */}
        <div className="pt-2">
          <LoginSubmitButton isPending={isPending} />
        </div>
      </form>

      <LoginSwitch />
    </div>
  );
}
