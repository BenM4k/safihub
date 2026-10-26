"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Eye, EyeOff, Sparkles } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  evaluatePasswordStrength,
  generateSecurePassword,
} from "@/lib/user-guardrails";

interface CreateStaffPasswordFieldProps {
  value: string;
  onChange: (val: string) => void;
}

export function CreateStaffPasswordField({
  value,
  onChange,
}: CreateStaffPasswordFieldProps) {
  const t = useTranslations("admin.users");
  const [showPassword, setShowPassword] = useState(false);

  const strength = evaluatePasswordStrength(value);

  const handleGenerate = () => {
    const gen = generateSecurePassword();
    onChange(gen);
    setShowPassword(true);
  };

  return (
    <Field className="gap-2">
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor="create-pass" className="text-xs sm:text-sm font-semibold">
          {t("password")} <span className="text-destructive">*</span>
        </FieldLabel>
        <button
          type="button"
          onClick={handleGenerate}
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 focus:outline-none"
        >
          <Sparkles className="size-3.5" />
          <span>{t("generatePassword")}</span>
        </button>
      </div>

      <InputGroup>
        <InputGroupInput
          id="create-pass"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("newPasswordPlaceholder")}
          required
          minLength={8}
          className="font-mono text-sm"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowPassword((p) => !p)}
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

      {value && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">{t("passwordStrengthLabel")}</span>
            <span
              className={
                strength.score === 3
                  ? "text-emerald-700 font-semibold"
                  : strength.score === 2
                    ? "text-blue-700 font-semibold"
                    : "text-amber-700 font-semibold"
              }
            >
              {t(strength.labelKey)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 h-1.5">
            <div
              className={`rounded-full transition-colors ${
                strength.score >= 1 ? "bg-amber-500" : "bg-muted"
              }`}
            />
            <div
              className={`rounded-full transition-colors ${
                strength.score >= 2 ? "bg-blue-500" : "bg-muted"
              }`}
            />
            <div
              className={`rounded-full transition-colors ${
                strength.score >= 3 ? "bg-emerald-600" : "bg-muted"
              }`}
            />
          </div>

          <div className="pt-1 text-xs space-y-1 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Check
                className={`size-3.5 ${
                  strength.hasMinLength ? "text-emerald-600" : "text-muted-foreground/50"
                }`}
              />
              <span>{t("passwordRuleMin")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check
                className={`size-3.5 ${
                  strength.hasNumber ? "text-emerald-600" : "text-muted-foreground/50"
                }`}
              />
              <span>{t("passwordRuleNumber")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check
                className={`size-3.5 ${
                  strength.hasSpecial ? "text-emerald-600" : "text-muted-foreground/50"
                }`}
              />
              <span>{t("passwordRuleSpecial")}</span>
            </div>
          </div>
        </div>
      )}
    </Field>
  );
}
