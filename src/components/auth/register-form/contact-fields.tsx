"use client";

import { useTranslations } from "next-intl";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RegisterFormValues } from "@/lib/validations/auth.schema";

interface ContactFieldsProps {
  register: UseFormRegister<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
}

export function ContactFields({ register, errors }: ContactFieldsProps) {
  const t = useTranslations("auth");

  return (
    <div className="space-y-3.5">
      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="register-email" className="text-xs sm:text-sm font-semibold">
          {t("emailLabel")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="register-email"
          type="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          hasError={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errors.email?.message && (
          <p id="email-error" className="text-xs font-medium text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone number */}
      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold">
          {t("phoneLabel")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder={t("phonePlaceholder")}
          autoComplete="tel"
          hasError={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          {...register("phone")}
        />
        {errors.phone?.message && (
          <p id="phone-error" className="text-xs font-medium text-red-500">
            {errors.phone.message}
          </p>
        )}
      </div>
    </div>
  );
}
