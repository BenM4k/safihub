"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ForgotPasswordHeader } from "./forgot-password-header";
import { forgotPasswordAction, initialAuthState } from "@/actions/auth.actions";

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
      {pending ? t("sendingResetLink") : t("sendResetLink")}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    initialAuthState
  );
  const t = useTranslations("auth");

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      <ForgotPasswordHeader />

      {state.success ? (
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
        <form action={formAction} noValidate className="space-y-4">
          {state.errors?.form && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium"
            >
              {state.errors.form}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="reset-email" className="text-xs sm:text-sm font-semibold">
              {t("emailLabel")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="reset-email"
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
      )}
    </div>
  );
}
