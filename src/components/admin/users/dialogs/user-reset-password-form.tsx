"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Eye, EyeOff, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { resetUserPasswordAction } from "@/actions/admin-user.actions";
import {
  evaluatePasswordStrength,
  generateSecurePassword,
} from "@/lib/user-guardrails";
import { UserPasswordStrengthMeter } from "./user-password-strength-meter";
import type { UserRow } from "../types";

interface UserResetPasswordFormProps {
  user: UserRow;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserResetPasswordForm({
  user,
  onClose,
  onSuccess,
}: UserResetPasswordFormProps) {
  const t = useTranslations("admin.users");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, []);

  const strength = evaluatePasswordStrength(password);

  const handleGenerate = () => {
    const gen = generateSecurePassword();
    setPassword(gen);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strength.isValid) {
      setError(t("passwordHelp"));
      return;
    }

    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("userId", user.id);
    fd.append("newPassword", password);

    try {
      const res = await resetUserPasswordAction(fd);
      if (!res.ok) {
        setError(res.error);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unknownError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
      <div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("resetPasswordFor", { name: user.name, email: user.email })}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Password Input & Generator */}
      <Field className="gap-2">
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="reset-pass" className="text-xs sm:text-sm font-semibold">
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
            id="reset-pass"
            ref={inputRef}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        {/* Strength Meter */}
        {password && <UserPasswordStrengthMeter strength={strength} />}
      </Field>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          disabled={loading || !strength.isValid}
        >
          {loading ? t("updating") : t("resetPassword")}
        </Button>
      </div>
    </form>
  );
}
