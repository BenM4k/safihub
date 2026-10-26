"use client";

import { useTranslations } from "next-intl";
import { Shield, ShieldAlert, UserCheck, Users } from "lucide-react";

interface UsersKpiBadgesProps {
  totalCount: number;
  staffCount: number;
  activeCount: number;
  blockedCount: number;
}

export function UsersKpiBadges({
  totalCount,
  staffCount,
  activeCount,
  blockedCount,
}: UsersKpiBadgesProps) {
  const t = useTranslations("admin.users");

  return (
    <div className="flex items-center gap-2 pt-1 flex-wrap text-xs font-medium">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-foreground">
        <Users className="size-3.5 text-primary" />
        <span>{t("kpiTotalBadge", { count: totalCount })}</span>
      </span>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-foreground">
        <Shield className="size-3.5 text-purple-600" />
        <span>{t("kpiStaffBadge", { count: staffCount })}</span>
      </span>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-foreground">
        <UserCheck className="size-3.5 text-emerald-600" />
        <span>{t("kpiActiveBadge", { count: activeCount })}</span>
      </span>
      {blockedCount > 0 && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive font-medium">
          <ShieldAlert className="size-3.5" />
          <span>{t("kpiBlockedBadge", { count: blockedCount })}</span>
        </span>
      )}
    </div>
  );
}
