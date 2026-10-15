"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetUserPasswordAction } from "@/actions/admin-user.actions";
import {
  evaluatePasswordStrength,
  generateSecurePassword,
} from "@/lib/user-guardrails";
import type { UserRow } from "../types";

interface UserResetPasswordDialogProps {
  user: UserRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserResetPasswordDialog({
  user,
  isOpen,
  onClose,
  onSuccess,
}: UserResetPasswordDialogProps) {
  const t = useTranslations("admin.users");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setPassword("");
      setShowPassword(false);
      setError(null);
    }
  }

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-card rounded-2xl border-2 border-border-strong shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-border-strong bg-surface">
          <div className="flex items-center gap-2 text-heading font-bold text-sm">
            <KeyRound className="size-5 text-primary" />
            <span id="reset-dialog-title">{t("resetConfirm")}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-800 p-1 rounded-lg focus:outline-none"
            aria-label={t("cancel")}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-xs text-ink-700 leading-relaxed">
              {t("resetPasswordFor", { name: user.name, email: user.email })}
            </p>
          </div>

          {/* Password Input & Generator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="reset-pass" className="text-xs font-bold text-heading">
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
                id="reset-pass"
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("newPasswordPlaceholder")}
                required
                minLength={8}
                className="min-h-[40px] pr-10 text-xs bg-surface border-2 border-border-strong rounded-xl text-heading font-mono"
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
          </div>

          {/* Strength Meter */}
          {password && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-2xs font-semibold">
                <span className="text-ink-500">{t("passwordStrengthLabel")}</span>
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

              {/* Password Checklist */}
              <div className="pt-2 text-2xs space-y-1 text-ink-600">
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

          {error && (
            <div className="p-2.5 bg-destructive-light border border-destructive-base/30 rounded-xl text-xs font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-strong/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="min-h-[40px] px-4 text-xs font-semibold border-2 border-border-strong bg-surface hover:bg-muted text-ink-800 rounded-xl"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading || !strength.isValid}
              className="min-h-[40px] px-4 text-xs font-bold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-xs"
            >
              {loading ? t("updating") : t("resetPassword")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
