"use client";

import { useTranslations } from "next-intl";
import { Ban, CheckCircle, KeyRound, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isLastAdmin } from "@/lib/user-guardrails";
import type { UserRow } from "../types";

interface UserDetailsFooterProps {
  user: UserRow;
  activeAdminsCount: number;
  onChangeRole: (user: UserRow) => void;
  onResetPassword: (user: UserRow) => void;
  onToggleBlock: (user: UserRow) => void;
}

export function UserDetailsFooter({
  user,
  activeAdminsCount,
  onChangeRole,
  onResetPassword,
  onToggleBlock,
}: UserDetailsFooterProps) {
  const t = useTranslations("admin.users");
  const isBlocked = user.banned || user.status === "blocked";
  const isTargetLastAdmin = isLastAdmin(user.role, activeAdminsCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3.5 border-t border-border bg-muted/20 shrink-0">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isTargetLastAdmin}
          onClick={() => onChangeRole(user)}
          className="gap-1.5"
        >
          <UserCog className="size-3.5 text-primary" />
          <span>{t("changeRole")}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onResetPassword(user)}
          className="gap-1.5"
        >
          <KeyRound className="size-3.5 text-muted-foreground" />
          <span>{t("resetPassword")}</span>
        </Button>
      </div>

      <Button
        variant={isBlocked ? "outline" : "destructive"}
        size="sm"
        disabled={!isBlocked && isTargetLastAdmin}
        onClick={() => onToggleBlock(user)}
        className="gap-1.5"
      >
        {isBlocked ? (
          <>
            <CheckCircle className="size-3.5 text-emerald-600" />
            <span>{t("unblockUser")}</span>
          </>
        ) : (
          <>
            <Ban className="size-3.5" />
            <span>{t("blockUser")}</span>
          </>
        )}
      </Button>
    </div>
  );
}
