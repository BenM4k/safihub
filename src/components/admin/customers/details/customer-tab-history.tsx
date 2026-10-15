"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Calendar, Clock, GitMerge, History, ShieldCheck, UserCheck } from "lucide-react";
import { formatDateTime } from "@/lib/order-formatters";
import type { CustomerDetailedProfile } from "@/services/admin";

interface CustomerTabHistoryProps {
  profile: CustomerDetailedProfile;
}

export function CustomerTabHistory({ profile }: CustomerTabHistoryProps) {
  const t = useTranslations("admin.customers.details");
  const { customer, mergedGuestAccounts, consents } = profile;
  const isBlocked = customer.banned || customer.status === "blocked";

  return (
    <div className="space-y-4 text-xs">
      {/* Account Audit and Timestamps */}
      <div className="p-4 rounded-xl border-2 border-border-strong bg-card space-y-3 shadow-2xs">
        <div className="font-bold text-heading flex items-center gap-1.5">
          <History className="size-4 text-primary" />
          <span>{t("activityLogTitle")}</span>
        </div>

        <div className="divide-y divide-border-strong/70 text-ink-700">
          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-500">
              <Calendar className="size-3.5" />
              <span>{t("accountCreation")}</span>
            </span>
            <span className="font-mono font-semibold text-heading">
              {formatDateTime(customer.createdAt)}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-500">
              <Clock className="size-3.5" />
              <span>{t("lastUpdate")}</span>
            </span>
            <span className="font-mono font-semibold text-heading">
              {customer.updatedAt ? formatDateTime(customer.updatedAt) : "—"}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-500">
              <UserCheck className="size-3.5" />
              <span>{t("emailStatus")}</span>
            </span>
            <span className="font-semibold text-heading">
              {customer.emailVerified ? t("emailVerified") : t("emailUnverified")}
            </span>
          </div>
        </div>
      </div>

      {/* Block reason audit if blocked */}
      {isBlocked && (
        <div className="p-4 rounded-xl border-2 border-destructive-base/40 bg-destructive-light space-y-2">
          <div className="font-bold text-destructive flex items-center gap-1.5">
            <AlertTriangle className="size-4" />
            <span>{t("blockHistoryTitle")}</span>
          </div>
          <div className="text-2xs text-ink-800 bg-white/80 p-2.5 rounded-lg border border-destructive-base/30">
            <div className="font-semibold text-destructive">{t("blockReasonAndAudit")}</div>
            <div className="mt-1 leading-relaxed">{customer.banReason || t("noReasonSpecified")}</div>
          </div>
        </div>
      )}

      {/* Merged Guest Accounts history */}
      {mergedGuestAccounts.length > 0 && (
        <div className="p-4 rounded-xl border-2 border-border-strong bg-card space-y-2.5 shadow-2xs">
          <div className="font-bold text-heading flex items-center gap-1.5">
            <GitMerge className="size-4 text-primary" />
            <span>{t("mergedGuestsTitle", { count: mergedGuestAccounts.length })}</span>
          </div>
          <div className="divide-y divide-border-strong text-2xs">
            {mergedGuestAccounts.map((g) => (
              <div key={g.id} className="py-2 space-y-1">
                <div className="flex items-center justify-between font-semibold text-heading">
                  <span>{g.name} ({g.contactPhone || t("withoutPhone")})</span>
                  <span className="font-mono text-ink-500">{formatDateTime(g.updatedAt)}</span>
                </div>
                <div className="text-ink-600 italic bg-surface p-2 rounded border border-border-strong">
                  {g.banReason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consents / Legal acceptance */}
      {consents.length > 0 && (
        <div className="p-4 rounded-xl border-2 border-border-strong bg-card space-y-2 shadow-2xs">
          <div className="font-bold text-heading flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>{t("consentsTitle")}</span>
          </div>
          <div className="divide-y divide-border-strong text-2xs">
            {consents.map((c, i) => (
              <div key={i} className="py-2 flex items-center justify-between text-ink-700">
                <span className="font-medium capitalize">{c.document} (v{c.version})</span>
                <span className="font-mono text-ink-500">{formatDateTime(c.acceptedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
