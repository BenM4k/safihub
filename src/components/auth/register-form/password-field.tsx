"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useWatch,
  type Control,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { PasswordCriteria } from "./password-criteria";
import type { RegisterFormValues } from "@/lib/validations/auth.schema";

interface PasswordFieldProps {
  error?: string;
  control: Control<RegisterFormValues>;
  registration: UseFormRegisterReturn;
}

export function PasswordField({
  error,
  control,
  registration,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations("auth");

  const value = useWatch({ control, name: "password" }) || "";

  const checks = {
    hasLower: /[a-z]/.test(value),
    hasUpper: /[A-Z]/.test(value),
    hasNumber: /[0-9]/.test(value),
    hasSpecial: /[^A-Za-z0-9]/.test(value),
    hasLength: value.length >= 8,
  };

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor="password" className="text-xs sm:text-sm font-semibold">
        {t("passwordLabel")} <span className="text-destructive">*</span>
      </FieldLabel>

      <InputGroup>
        <InputGroupInput
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder={t("passwordPlaceholder")}
          autoComplete="new-password"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "password-error" : undefined}
          {...registration}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={t(showPassword ? "hidePassword" : "showPassword")}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {error && (
        <FieldError id="password-error">
          {error}
        </FieldError>
      )}

      {/* 5-rule criteria checklist below the input */}
      <PasswordCriteria checks={checks} />
    </Field>
  );
}
