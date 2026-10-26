"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";

interface ConfirmPasswordFieldProps {
  error?: string;
  registration: UseFormRegisterReturn;
}

export function ConfirmPasswordField({
  error,
  registration,
}: ConfirmPasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations("auth");

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel
        htmlFor="confirmPassword"
        className="text-xs sm:text-sm font-semibold"
      >
        {t("confirmPasswordLabel")} <span className="text-destructive">*</span>
      </FieldLabel>

      <InputGroup>
        <InputGroupInput
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder={t("confirmPasswordPlaceholder")}
          autoComplete="new-password"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "confirm-error" : undefined}
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
        <FieldError id="confirm-error">
          {error}
        </FieldError>
      )}
    </Field>
  );
}
