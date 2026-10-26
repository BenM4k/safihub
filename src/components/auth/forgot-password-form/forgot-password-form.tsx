"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, AlertCircle } from "lucide-react";
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
        <div className="flex flex-col gap-4">
          <Alert variant="success">
            <CheckCircle2 className="size-4" />
            <AlertTitle>{t("resetLinkSentTitle")}</AlertTitle>
            <AlertDescription>
              {t("resetLinkSentDesc")}
            </AlertDescription>
          </Alert>

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
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="reset-email" className="text-xs sm:text-sm font-semibold">
              {t("emailLabel")} <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="reset-email"
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
                  {t("sendingResetLink")}
                </>
              ) : (
                t("sendResetLink")
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
      )}
    </div>
  );
}
