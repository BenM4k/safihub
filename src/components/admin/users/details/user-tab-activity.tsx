"use client";

import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Calendar,
  Clock,
  History,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { formatDateTime } from "@/lib/order-formatters";
import { formatRelativeLastLogin, isUserInactive } from "@/lib/user-formatters";
import type { UserRow } from "../types";

interface UserTabActivityProps {
  user: UserRow;
}

export function UserTabActivity({ user }: UserTabActivityProps) {
  const t = useTranslations("admin.users");
  const isBlocked = user.banned || user.status === "blocked";
  const inactive = isUserInactive(user.lastLoginAt, user.createdAt);

  return (
    <div className="space-y-4 text-xs">
      {/* Account Audit and Timestamps */}
      <div className="p-4 rounded-xl border-2 border-border-strong bg-card space-y-3 shadow-2xs">
        <div className="font-bold text-heading flex items-center gap-1.5">
          <History className="size-4 text-primary" />
          <span>{t("historyTitle")}</span>
        </div>

        <div className="divide-y divide-border-strong/70 text-ink-700">
          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-500">
              <Calendar className="size-3.5" />
              <span>{t("createdAt")}</span>
            </span>
            <span className="font-mono font-semibold text-heading">
              {formatDateTime(user.createdAt)}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-500">
              <Clock className="size-3.5" />
              <span>{t("updatedAt")}</span>
            </span>
            <span className="font-mono font-semibold text-heading">
              {user.updatedAt ? formatDateTime(user.updatedAt) : "—"}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-500">
              <UserCheck className="size-3.5" />
              <span>{t("colLastLogin")}</span>
            </span>
            <span
              className={`font-semibold ${
                inactive ? "text-amber-800" : "text-heading"
              }`}
            >
              {formatRelativeLastLogin(user.lastLoginAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Inactive account notice */}
      {inactive && (
        <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <AlertTriangle className="size-4 text-amber-600" />
            <span>Compte inactif</span>
          </div>
          <p className="text-2xs text-amber-800 leading-relaxed">
            {user.lastLoginAt
              ? "Cet utilisateur ne s'est pas connecté depuis plus de 30 jours."
              : "Cet utilisateur ne s'est encore jamais connecté à son compte."}
          </p>
        </div>
      )}

      {/* Block reason audit if blocked */}
      {isBlocked && (
        <div className="p-4 rounded-xl border-2 border-destructive-base/40 bg-destructive-light space-y-2">
          <div className="font-bold text-destructive flex items-center gap-1.5">
            <ShieldAlert className="size-4" />
            <span>Motif du blocage</span>
          </div>
          <div className="text-2xs text-ink-800 bg-white/80 p-3 rounded-lg border border-destructive-base/30 space-y-1">
            <div className="text-ink-500 font-medium">
              {t("lastUpdatedDate", { date: formatDateTime(user.updatedAt) })}
            </div>
            <div className="font-semibold text-destructive mt-1 leading-relaxed">
              {user.banReason || t("noReasonSpecified")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
