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
      : "https://safihub.cd/login";

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
    <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-5 sm:p-6 shadow-sm stack gap-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-2.5 text-emerald-900">
        <div className="size-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
          <KeyRound className="size-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-heading">{t("credentialsTitle")}</h4>
          {!isNewAccount && (
            <p className="text-2xs text-emerald-800 mt-0.5">
              {passwordApplied === false
                ? t("existingAccountKeptPasswordNote")
                : t("existingAccountNote")}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-emerald-200 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block text-2xs uppercase tracking-wider font-semibold">
              {t("email")}
            </span>
            <span className="font-mono font-medium text-heading text-xs truncate block select-all">
              {email}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-2xs uppercase tracking-wider font-semibold">
              {t("temporaryPassword")}
            </span>
            {temporaryPassword ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-bold text-heading text-xs bg-slate-100 px-2 py-1 rounded select-all">
                  {showPassword ? temporaryPassword : "••••••••••••"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="p-1 text-muted-foreground hover:text-heading"
                  title={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPassword}
                  className="h-7 px-2 text-2xs gap-1 border-emerald-200"
                >
                  {copiedPassword ? (
                    <>
                      <Check className="size-3 text-emerald-600" />
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

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyWhatsapp}
              className="h-8 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white border-transparent gap-1.5 shadow-xs"
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
                className="h-8 text-xs font-semibold border-emerald-300 text-emerald-800 hover:bg-emerald-100"
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
