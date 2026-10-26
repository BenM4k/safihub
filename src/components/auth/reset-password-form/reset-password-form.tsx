"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle } from "lucide-react";
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
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm font-medium">
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <input type="hidden" {...register("token")} value={token} />

      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* New Password */}
      <Field data-invalid={Boolean(errors.password)}>
        <FieldLabel htmlFor="new-password" className="text-xs sm:text-sm font-semibold">
          {t("newPasswordLabel")} <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          placeholder={t("passwordPlaceholder")}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "pass-error" : undefined}
          {...register("password")}
        />
        {errors.password?.message && (
          <FieldError id="pass-error">
            {errors.password.message}
          </FieldError>
        )}
      </Field>

      {/* Confirm Password */}
      <Field data-invalid={Boolean(errors.confirmPassword)}>
        <FieldLabel htmlFor="confirm-new-password" className="text-xs sm:text-sm font-semibold">
          {t("confirmPasswordLabel")} <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="confirm-new-password"
          type="password"
          autoComplete="new-password"
          placeholder={t("confirmPasswordPlaceholder")}
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword?.message && (
          <FieldError id="confirm-error">
            {errors.confirmPassword.message}
          </FieldError>
        )}
      </Field>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="pill"
          disabled={isPending}
          className="w-full text-base font-semibold shadow-xs transition-transform"
        >
          {isPending ? (
            <>
              <Spinner className="mr-2" data-icon="inline-start" />
              {t("resetting")}
            </>
          ) : (
            t("resetSubmit")
          )}
        </Button>
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
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
      <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
        <ResetPasswordFormContent />
      </Suspense>
    </div>
  );
}
