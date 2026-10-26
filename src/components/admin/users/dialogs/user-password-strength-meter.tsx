"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { evaluatePasswordStrength } from "@/lib/user-guardrails";

interface UserPasswordStrengthMeterProps {
  strength: ReturnType<typeof evaluatePasswordStrength>;
}

export function UserPasswordStrengthMeter({ strength }: UserPasswordStrengthMeterProps) {
  const t = useTranslations("admin.users");

  return (
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

      {/* Password Checklist */}
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
  );
}
