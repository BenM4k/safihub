"use client";

import { useTranslations } from "next-intl";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <div className="space-y-1.5">
        <Label htmlFor="firstName" className="text-xs sm:text-sm font-semibold">
          {t("firstNameLabel")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="firstName"
          type="text"
          placeholder={t("firstNamePlaceholder")}
          autoComplete="given-name"
          hasError={Boolean(errors.firstName)}
          aria-describedby={errors.firstName ? "firstName-error" : undefined}
          {...register("firstName")}
        />
        {errors.firstName?.message && (
          <p id="firstName-error" className="text-xs font-medium text-red-500">
            {errors.firstName.message}
          </p>
        )}
      </div>

      {/* Last Name */}
      <div className="space-y-1.5">
        <Label htmlFor="lastName" className="text-xs sm:text-sm font-semibold">
          {t("lastNameLabel")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="lastName"
          type="text"
          placeholder={t("lastNamePlaceholder")}
          autoComplete="family-name"
          hasError={Boolean(errors.lastName)}
          aria-describedby={errors.lastName ? "lastName-error" : undefined}
          {...register("lastName")}
        />
        {errors.lastName?.message && (
          <p id="lastName-error" className="text-xs font-medium text-red-500">
            {errors.lastName.message}
          </p>
        )}
      </div>
    </div>
  );
}
