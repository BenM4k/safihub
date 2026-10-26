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
import { CheckCircle2, AlertCircle } from "lucide-react";
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
    <Alert variant="success" className="mb-4">
      <CheckCircle2 className="size-4" />
      <AlertDescription>
        {isRegistered && t("registeredSuccess")}
        {isReset && t("resetSuccess")}
      </AlertDescription>
    </Alert>
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
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {/* Email field */}
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="login-email" className="text-xs sm:text-sm font-semibold">
            {t("emailLabel")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email?.message && (
            <FieldError id="email-error">
              {errors.email.message}
            </FieldError>
          )}
        </Field>

        {/* Password field */}
        <Field data-invalid={Boolean(errors.password)}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="login-password" className="text-xs sm:text-sm font-semibold">
              {t("passwordLabel")} <span className="text-destructive">*</span>
            </FieldLabel>
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
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password?.message && (
            <FieldError id="password-error">
              {errors.password.message}
            </FieldError>
          )}
        </Field>

        {/* Primary CTA */}
        <div className="pt-2">
          <LoginSubmitButton isPending={isPending} />
        </div>
      </form>

      <LoginSwitch />
    </div>
  );
}
