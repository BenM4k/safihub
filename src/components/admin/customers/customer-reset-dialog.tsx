"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, KeyRound, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetCustomerPasswordAction } from "@/actions/admin-customer.actions";
import { formatCustomerName } from "@/lib/customer-formatters";
import { generateSecurePassword } from "@/lib/user-guardrails";
import type { CustomerRow } from "./types";

interface CustomerResetDialogProps {
  customer: CustomerRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomerResetDialog({
  customer,
  isOpen,
  onClose,
  onSuccess,
}: CustomerResetDialogProps) {
  const t = useTranslations("admin.customers.resetDialog");
  const [newPassword, setNewPassword] = useState(() => generateSecurePassword());
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !customer) return null;

  const displayName = formatCustomerName(customer.name, customer.contactPhone);

  const handleCopy = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError(t("minLengthError"));
      return;
    }

    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("userId", customer.id);
    fd.append("newPassword", newPassword.trim());

    const res = await resetCustomerPasswordAction(fd);
    setLoading(false);

    if (!res.ok) {
      setError(res.error || t("genericError"));
    } else {
      setSuccessMsg(t("successMsg"));
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border-2 border-border-strong overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b-2 border-border-strong flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg flex items-center justify-center bg-primary-soft text-primary border border-primary/20">
              <KeyRound className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-heading font-display">
              {t("title")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:text-heading rounded-lg hover:bg-surface-hover"
            aria-label={t("close")}
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs text-ink-700 leading-relaxed space-y-1">
            <p>
              {t("description", { name: displayName, email: customer.email })}
            </p>
            <p className="text-2xs text-ink-500">
              {t("hint")}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive-light border border-destructive-base/30 rounded-lg text-xs text-destructive font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-success-light border border-success-base/30 rounded-lg text-xs text-success-base font-semibold">
              {successMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="newPasswordInput" className="text-xs font-semibold text-heading">
              {t("tempPasswordLabel")}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="newPasswordInput"
                type="text"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 text-xs font-mono font-bold tracking-wider border-2 border-border-strong rounded-lg bg-white"
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewPassword(generateSecurePassword())}
                className="h-10 px-2.5 border-2 border-border-strong text-ink-600 hover:text-heading"
                title={t("generateTooltip")}
              >
                <RefreshCw className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-10 px-3 border-2 border-border-strong text-ink-600 hover:text-heading"
                title={t("copyTooltip")}
              >
                {copied ? <Check className="size-3.5 text-success-base" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
            {copied && <span className="text-2xs text-success-base font-bold">{t("copiedNotification")}</span>}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t-2 border-border-strong">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="min-h-[40px] px-4 text-xs font-semibold border-2 border-border-strong"
            >
              {successMsg ? t("closeBtn") : t("cancelBtn")}
            </Button>
            {!successMsg && (
              <Button
                type="submit"
                size="sm"
                disabled={loading || !newPassword}
                className="min-h-[40px] px-4 text-xs font-bold bg-primary text-white hover:bg-primary-hover"
              >
                {loading ? t("savingBtn") : t("applyBtn")}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
