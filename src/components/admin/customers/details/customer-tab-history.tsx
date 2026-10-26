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
      <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
        <div className="font-bold text-foreground flex items-center gap-1.5">
          <History className="size-4 text-primary" />
          <span>{t("activityLogTitle")}</span>
        </div>

        <div className="divide-y divide-border text-foreground">
          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>{t("accountCreation")}</span>
            </span>
            <span className="font-mono font-semibold text-foreground">
              {formatDateTime(customer.createdAt)}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5" />
              <span>{t("lastUpdate")}</span>
            </span>
            <span className="font-mono font-semibold text-foreground">
              {customer.updatedAt ? formatDateTime(customer.updatedAt) : "—"}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <UserCheck className="size-3.5" />
              <span>{t("emailStatus")}</span>
            </span>
            <span className="font-semibold text-foreground">
              {customer.emailVerified ? t("emailVerified") : t("emailUnverified")}
            </span>
          </div>
        </div>
      </div>

      {/* Block reason audit if blocked */}
      {isBlocked && (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 space-y-2">
          <div className="font-bold text-destructive flex items-center gap-1.5">
            <AlertTriangle className="size-4" />
            <span>{t("blockHistoryTitle")}</span>
          </div>
          <div className="text-2xs text-foreground bg-background p-2.5 rounded-md border border-border">
            <div className="font-semibold text-destructive">{t("blockReasonAndAudit")}</div>
            <div className="mt-1 leading-relaxed text-muted-foreground">{customer.banReason || t("noReasonSpecified")}</div>
          </div>
        </div>
      )}

      {/* Merged Guest Accounts history */}
      {mergedGuestAccounts.length > 0 && (
        <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-2.5">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <GitMerge className="size-4 text-primary" />
            <span>{t("mergedGuestsTitle", { count: mergedGuestAccounts.length })}</span>
          </div>
          <div className="divide-y divide-border text-2xs">
            {mergedGuestAccounts.map((g) => (
              <div key={g.id} className="py-2 space-y-1">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span>{g.name} ({g.contactPhone || t("withoutPhone")})</span>
                  <span className="font-mono text-muted-foreground">{formatDateTime(g.updatedAt)}</span>
                </div>
                <div className="text-muted-foreground italic bg-background p-2 rounded border border-border">
                  {g.banReason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consents / Legal acceptance */}
      {consents.length > 0 && (
        <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-2">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t("consentsTitle")}</span>
          </div>
          <div className="divide-y divide-border text-2xs">
            {consents.map((c, i) => (
              <div key={i} className="py-2 flex items-center justify-between text-foreground">
                <span className="font-medium capitalize">{c.document} (v{c.version})</span>
                <span className="font-mono text-muted-foreground">{formatDateTime(c.acceptedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
