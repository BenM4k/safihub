"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check, Copy, Eye, EyeOff, KeyRound, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApprovalCredentialsPanelProps {
  email: string;
  contactName: string;
  houseName: string;
  houseId: string;
  temporaryPassword: string;
  isNewAccount: boolean;
  passwordApplied?: boolean;
  onDismiss?: () => void;
}

export function ApprovalCredentialsPanel({
  email,
  contactName,
  houseName,
  houseId,
  temporaryPassword,
  isNewAccount,
  passwordApplied,
  onDismiss,
}: ApprovalCredentialsPanelProps) {
  const t = useTranslations("admin.applications");
  const [showPassword, setShowPassword] = useState(true);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  const loginUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/login`
      : `${(process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "").replace(/\/$/, "")}/login`;

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(temporaryPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleCopyWhatsapp = () => {
    const text = temporaryPassword
      ? t("whatsappTemplate", {
          name: contactName,
          houseName,
          email,
          password: temporaryPassword,
          loginUrl,
        })
      : t("whatsappExistingAccountTemplate", {
          name: contactName,
          houseName,
          email,
          loginUrl,
        });
    navigator.clipboard.writeText(text);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 2000);
  };

  return (
    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 shadow-xs stack gap-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-2.5 text-emerald-950 dark:text-emerald-100">
        <div className="size-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
          <KeyRound className="size-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">{t("credentialsTitle")}</h4>
          {!isNewAccount && (
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
              {passwordApplied === false
                ? t("existingAccountKeptPasswordNote")
                : t("existingAccountNote")}
            </p>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">
              {t("email")}
            </span>
            <span className="font-mono font-medium text-foreground text-xs truncate block select-all">
              {email}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">
              {t("temporaryPassword")}
            </span>
            {temporaryPassword ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-bold text-foreground text-xs bg-muted px-2 py-1 rounded select-all">
                  {showPassword ? temporaryPassword : "••••••••••••"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                  title={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPassword}
                  className="h-7 px-2 text-[10px] gap-1"
                >
                  {copiedPassword ? (
                    <>
                      <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{t("copied")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>{t("copyPassword")}</span>
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic mt-0.5">
                {t("existingAccountKeptPasswordNote")}
              </p>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleCopyWhatsapp}
              className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-transparent gap-1.5 shadow-xs"
            >
              {copiedWhatsapp ? (
                <>
                  <Check className="size-3.5" />
                  <span>{t("copied")}</span>
                </>
              ) : (
                <>
                  <MessageSquare className="size-3.5" />
                  <span>{t("copyWhatsapp")}</span>
                </>
              )}
            </Button>

            {onDismiss && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDismiss}
                className="h-8 text-xs font-semibold"
              >
                {t("dismissCredentials")}
              </Button>
            )}
          </div>

          <Link
            href={`/admin/houses/${houseId}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>{t("viewHouse")}</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
