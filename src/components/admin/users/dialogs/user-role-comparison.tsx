"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { getRoleBadgeInfo } from "@/lib/user-formatters";

interface UserRoleComparisonProps {
  currentRoleInfo: ReturnType<typeof getRoleBadgeInfo>;
  newRoleInfo: ReturnType<typeof getRoleBadgeInfo>;
  selectedRole: string;
}

export function UserRoleComparison({
  currentRoleInfo,
  newRoleInfo,
  selectedRole,
}: UserRoleComparisonProps) {
  const t = useTranslations("admin.users");

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return t("roleAdminDesc");
      case "courier":
        return t("roleCourierDesc");
      case "house":
        return t("roleHouseDesc");
      case "customer":
        return t("roleCustomerDesc");
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="p-3 bg-muted/30 border border-border rounded-lg flex items-center justify-between gap-3 text-xs">
        <div className="flex flex-col gap-1">
          <span className="text-2xs text-muted-foreground font-medium uppercase tracking-wider block">
            {t("currentRole")}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${currentRoleInfo.badgeClass}`}
          >
            {currentRoleInfo.label}
          </span>
        </div>

        <ArrowRight className="size-4 text-muted-foreground shrink-0" />

        <div className="flex flex-col gap-1 text-right">
          <span className="text-2xs text-muted-foreground font-medium uppercase tracking-wider block">
            {t("newRole")}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${newRoleInfo.badgeClass}`}
          >
            {newRoleInfo.label}
          </span>
        </div>
      </div>

      <div className="p-3 bg-muted/20 border border-border rounded-lg flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <ShieldCheck className="size-4" />
          <span>{t("permissionsScope")}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {getRoleDescription(selectedRole)}
        </p>
      </div>
    </div>
  );
}
