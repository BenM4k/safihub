"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Controller, type Control } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import type { RegisterFormValues } from "@/lib/validations/auth.schema";

interface ConsentFieldProps {
  control: Control<RegisterFormValues>;
  error?: string;
}

export function ConsentField({
  control,
  error,
}: ConsentFieldProps) {
  const t = useTranslations("auth");

  return (
    <div className="flex flex-col gap-3 pt-1">
      {/* Mandatory Terms & Privacy Consent */}
      <Controller
        name="consent"
        control={control}
        render={({ field }) => (
          <Field orientation="horizontal" data-invalid={Boolean(error)}>
            <Checkbox
              id="register-consent"
              name={field.name}
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "consent-error" : undefined}
              className="mt-0.5"
            />
            <FieldLabel
              htmlFor="register-consent"
              className="text-xs sm:text-sm text-muted-foreground leading-normal cursor-pointer select-none font-normal"
            >
              {t("consentLabel")}{" "}
              <Link
                href="/terms"
                target="_blank"
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                {t("termsLink")}
              </Link>{" "}
              {t("and")}{" "}
              <Link
                href="/privacy"
                target="_blank"
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                {t("privacyLink")}
              </Link>
              . <span className="text-destructive">*</span>
            </FieldLabel>

            {error && (
              <FieldError id="consent-error" className="pl-6.5">
                {error}
              </FieldError>
            )}
          </Field>
        )}
      />

      {/* Recommended Photo Consent (CLOTHES ONLY) */}
      <Controller
        name="photoConsent"
        control={control}
        render={({ field }) => (
          <Field orientation="horizontal">
            <Checkbox
              id="register-photo-consent"
              name={field.name}
              checked={field.value ?? true}
              onCheckedChange={field.onChange}
              className="mt-0.5"
            />
            <FieldLabel
              htmlFor="register-photo-consent"
              className="text-xs sm:text-sm text-muted-foreground leading-normal cursor-pointer select-none font-normal"
            >
              {t("photoConsentLabel")}{" "}
              <Link
                href="/consent"
                target="_blank"
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                {t("photoConsentLink")}
              </Link>
              .
            </FieldLabel>
          </Field>
        )}
      />
    </div>
  );
}
