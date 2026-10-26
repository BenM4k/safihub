"use client";

import { useTranslations } from "next-intl";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { RegisterFormValues } from "@/lib/validations/auth.schema";

interface ContactFieldsProps {
  register: UseFormRegister<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
}

export function ContactFields({ register, errors }: ContactFieldsProps) {
  const t = useTranslations("auth");

  return (
    <div className="flex flex-col gap-3.5">
      {/* Email */}
      <Field data-invalid={Boolean(errors.email)}>
        <FieldLabel htmlFor="register-email" className="text-xs sm:text-sm font-semibold">
          {t("emailLabel")} <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="register-email"
          type="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
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

      {/* Phone number */}
      <Field data-invalid={Boolean(errors.phone)}>
        <FieldLabel htmlFor="phone" className="text-xs sm:text-sm font-semibold">
          {t("phoneLabel")} <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="phone"
          type="tel"
          placeholder={t("phonePlaceholder")}
          autoComplete="tel"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          {...register("phone")}
        />
        {errors.phone?.message && (
          <FieldError id="phone-error">
            {errors.phone.message}
          </FieldError>
        )}
      </Field>
    </div>
  );
}
