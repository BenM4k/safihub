"use client";

import { useActionState, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ResetPasswordHeader } from "./reset-password-header";
import { resetPasswordAction, initialAuthState } from "@/actions/auth.actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("auth");

  return (
    <Button
      type="submit"
      variant="primary"
      size="pill"
      disabled={pending}
      className="w-full text-base font-semibold shadow-xs transition-transform"
    >
      {pending ? t("resetting") : t("resetSubmit")}
    </Button>
  );
}

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, formAction] = useActionState(
    resetPasswordAction,
    initialAuthState
  );
  const t = useTranslations("auth");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  return (
    <form action={formAction} noValidate className="space-y-4">
      <input type="hidden" name="token" value={token} />

      {state.errors?.form && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium"
        >
          {state.errors.form}
        </div>
      )}

      {/* New Password */}
      <div className="space-y-1.5">
        <Label htmlFor="new-password" className="text-xs sm:text-sm font-semibold">
          {t("newPasswordLabel")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={t("passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hasError={Boolean(state.errors?.password)}
          aria-describedby={state.errors?.password ? "pass-error" : undefined}
        />
        {state.errors?.password && (
          <p id="pass-error" className="text-xs font-medium text-red-500 mt-1">
            {state.errors.password}
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
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder={t("confirmPasswordPlaceholder")}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          hasError={Boolean(state.errors?.confirmPassword)}
          aria-describedby={state.errors?.confirmPassword ? "confirm-error" : undefined}
        />
        {state.errors?.confirmPassword && (
          <p id="confirm-error" className="text-xs font-medium text-red-500 mt-1">
            {state.errors.confirmPassword}
          </p>
        )}
      </div>

      <div className="pt-2">
        <SubmitButton />
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
