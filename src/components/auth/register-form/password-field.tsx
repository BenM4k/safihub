"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useWatch,
  type Control,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-1.5">
      <Label htmlFor="password" className="text-xs sm:text-sm font-semibold">
        {t("passwordLabel")} <span className="text-red-500">*</span>
      </Label>

      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder={t("passwordPlaceholder")}
          autoComplete="new-password"
          hasError={Boolean(error)}
          className="pr-10"
          aria-describedby={error ? "password-error" : undefined}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>

      {error && (
        <p id="password-error" className="text-xs font-medium text-red-500">
          {error}
        </p>
      )}

      {/* 5-rule criteria checklist below the input */}
      <PasswordCriteria checks={checks} />
    </div>
  );
}
