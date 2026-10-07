"use client";

import { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginHeader } from "./login-header";
import { LoginSubmitButton } from "./login-submit-button";
import { LoginSwitch } from "./login-switch";
import { loginAction, initialAuthState } from "@/actions/auth.actions";

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
  const [state, formAction] = useActionState(loginAction, initialAuthState);
  const t = useTranslations("auth");

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      <LoginHeader />

      <Suspense fallback={null}>
        <LoginSuccessBanner />
      </Suspense>

      {state.errors?.form && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium"
        >
          {state.errors.form}
        </div>
      )}

      <form action={formAction} noValidate className="space-y-4">
        {/* Email field */}
        <div className="space-y-1.5">
          <Label htmlFor="login-email" className="text-xs sm:text-sm font-semibold">
            {t("emailLabel")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            hasError={Boolean(state.errors?.email)}
            aria-describedby={state.errors?.email ? "email-error" : undefined}
          />
          {state.errors?.email && (
            <p id="email-error" className="text-xs font-medium text-red-500 mt-1">
              {state.errors.email}
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
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            hasError={Boolean(state.errors?.password)}
            aria-describedby={state.errors?.password ? "password-error" : undefined}
          />
          {state.errors?.password && (
            <p id="password-error" className="text-xs font-medium text-red-500 mt-1">
              {state.errors.password}
            </p>
          )}
        </div>

        {/* Primary CTA */}
        <div className="pt-2">
          <LoginSubmitButton />
        </div>
      </form>

      <LoginSwitch />
    </div>
  );
}
