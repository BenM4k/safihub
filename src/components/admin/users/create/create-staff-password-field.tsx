"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Eye, EyeOff, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="p-4 bg-surface border-2 border-border-strong rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="create-pass" className="text-xs font-bold text-heading">
          {t("password")} <span className="text-destructive">*</span>
        </Label>
        <button
          type="button"
          onClick={handleGenerate}
          className="text-2xs font-bold text-primary hover:text-primary-hover inline-flex items-center gap-1 focus:outline-none"
        >
          <Sparkles className="size-3" />
          <span>{t("generatePassword")}</span>
        </button>
      </div>

      <div className="relative">
        <Input
          id="create-pass"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Mot de passe initial…"
          required
          minLength={8}
          className="min-h-[40px] pr-10 text-xs bg-card border-2 border-border-strong rounded-xl text-heading font-mono"
        />
        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-800 focus:outline-none"
          aria-label={showPassword ? t("hidePassword") : t("showPassword")}
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      {value && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-2xs font-semibold">
            <span className="text-ink-500">Robustesse :</span>
            <span
              className={
                strength.score === 3
                  ? "text-emerald-700 font-bold"
                  : strength.score === 2
                    ? "text-blue-700 font-bold"
                    : "text-amber-700 font-bold"
              }
            >
              {t(strength.labelKey)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 h-1.5">
            <div
              className={`rounded-full ${
                strength.score >= 1 ? "bg-amber-500" : "bg-border-strong"
              }`}
            />
            <div
              className={`rounded-full ${
                strength.score >= 2 ? "bg-blue-500" : "bg-border-strong"
              }`}
            />
            <div
              className={`rounded-full ${
                strength.score >= 3 ? "bg-emerald-600" : "bg-border-strong"
              }`}
            />
          </div>

          <div className="pt-1 text-2xs space-y-1 text-ink-600">
            <div className="flex items-center gap-1.5">
              <Check
                className={`size-3 ${
                  strength.hasMinLength ? "text-emerald-600" : "text-ink-400"
                }`}
              />
              <span>{t("passwordRuleMin")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check
                className={`size-3 ${
                  strength.hasNumber ? "text-emerald-600" : "text-ink-400"
                }`}
              />
              <span>{t("passwordRuleNumber")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check
                className={`size-3 ${
                  strength.hasSpecial ? "text-emerald-600" : "text-ink-400"
                }`}
              />
              <span>{t("passwordRuleSpecial")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
