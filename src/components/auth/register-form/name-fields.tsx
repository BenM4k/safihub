"use client";

import { useTranslations } from "next-intl";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { RegisterFormValues } from "@/lib/validations/auth.schema";

interface NameFieldsProps {
  register: UseFormRegister<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
}

export function NameFields({ register, errors }: NameFieldsProps) {
  const t = useTranslations("auth");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {/* First Name */}
      <Field data-invalid={Boolean(errors.firstName)}>
        <FieldLabel htmlFor="firstName" className="text-xs sm:text-sm font-semibold">
          {t("firstNameLabel")} <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="firstName"
          type="text"
          placeholder={t("firstNamePlaceholder")}
          autoComplete="given-name"
          aria-invalid={Boolean(errors.firstName)}
          aria-describedby={errors.firstName ? "firstName-error" : undefined}
          {...register("firstName")}
        />
        {errors.firstName?.message && (
          <FieldError id="firstName-error">
            {errors.firstName.message}
          </FieldError>
        )}
      </Field>

      {/* Last Name */}
      <Field data-invalid={Boolean(errors.lastName)}>
        <FieldLabel htmlFor="lastName" className="text-xs sm:text-sm font-semibold">
          {t("lastNameLabel")} <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="lastName"
          type="text"
          placeholder={t("lastNamePlaceholder")}
          autoComplete="family-name"
          aria-invalid={Boolean(errors.lastName)}
          aria-describedby={errors.lastName ? "lastName-error" : undefined}
          {...register("lastName")}
        />
        {errors.lastName?.message && (
          <FieldError id="lastName-error">
            {errors.lastName.message}
          </FieldError>
        )}
      </Field>
    </div>
  );
}
