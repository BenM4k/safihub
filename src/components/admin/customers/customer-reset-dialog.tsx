"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, CheckCircle2, Copy, KeyRound, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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

  if (!customer) return null;

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
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl border border-border shadow-lg bg-card gap-0">
        <DialogHeader className="p-4 border-b border-border bg-muted/20 flex flex-row items-center gap-2.5 space-y-0">
          <div className="size-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary border border-primary/20 shrink-0">
            <KeyRound className="size-4" />
          </div>
          <DialogTitle className="text-sm font-bold text-foreground">
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="text-xs text-muted-foreground leading-relaxed flex flex-col gap-1">
            <p>
              {t("description", { name: displayName, email: customer.email })}
            </p>
            <p className="text-2xs text-muted-foreground/80">
              {t("hint")}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert variant="success">
              <CheckCircle2 className="size-4" />
              <AlertDescription className="text-xs font-medium">
                {successMsg}
              </AlertDescription>
            </Alert>
          )}

          <Field className="gap-2">
            <FieldLabel htmlFor="newPasswordInput" className="text-xs sm:text-sm font-semibold">
              {t("tempPasswordLabel")}
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="newPasswordInput"
                type="text"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="font-mono text-sm tracking-wider"
                disabled={loading}
              />
              <InputGroupAddon align="inline-end" className="gap-1 pr-1.5">
                <InputGroupButton
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setNewPassword(generateSecurePassword())}
                  title={t("generateTooltip")}
                >
                  <RefreshCw className="size-3.5" />
                </InputGroupButton>
                <InputGroupButton
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleCopy}
                  title={t("copyTooltip")}
                >
                  {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {copied && <span className="text-2xs text-emerald-700 font-semibold">{t("copiedNotification")}</span>}
          </Field>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {successMsg ? t("closeBtn") : t("cancelBtn")}
            </Button>
            {!successMsg && (
              <Button
                type="submit"
                disabled={loading || !newPassword}
              >
                {loading ? t("savingBtn") : t("applyBtn")}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
