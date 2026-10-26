"use client";

import { useTranslations } from "next-intl";
import {
  Activity,
  Ban,
  CheckCircle,
  Eye,
  KeyRound,
  ShieldAlert,
  UserCog,
} from "lucide-react";
import { isLastAdmin } from "@/lib/user-guardrails";
import {
  RowActionsMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/admin/shared/row-actions-menu";
import { Badge } from "@/components/ui/badge";
import type { UserRow } from "./types";

interface UsersRowActionsMenuProps {
  user: UserRow;
  currentUserId?: string | null;
  isAdmin: boolean;
  activeAdminsCount: number;
  onViewProfile: (user: UserRow) => void;
  onChangeRole: (user: UserRow) => void;
  onResetPassword: (user: UserRow) => void;
  onViewActivity: (user: UserRow) => void;
  onToggleBlock: (user: UserRow) => void;
}

export function UsersRowActionsMenu({
  user,
  currentUserId,
  isAdmin,
  activeAdminsCount,
  onViewProfile,
  onChangeRole,
  onResetPassword,
  onViewActivity,
  onToggleBlock,
}: UsersRowActionsMenuProps) {
  const t = useTranslations("admin.users");

  const isBlocked = user.banned || user.status === "blocked";
  const isTargetLastAdmin = isLastAdmin(user.role, activeAdminsCount);
  const isSelf = Boolean(currentUserId && currentUserId === user.id);

  return (
    <RowActionsMenu ariaLabel={t("actionsFor", { name: user.name })}>
      {/* Voir le profil */}
      <DropdownMenuItem
        onClick={() => onViewProfile(user)}
        className="px-3.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2.5"
      >
        <Eye className="size-3.5 text-ink-500" />
        <span>{t("viewProfile")}</span>
      </DropdownMenuItem>

      {/* Modifier le rôle */}
      <DropdownMenuItem
        disabled={!isAdmin || isTargetLastAdmin}
        title={
          isTargetLastAdmin
            ? t("lastAdminWarning")
            : !isAdmin
            ? t("adminOnlyAction")
            : undefined
        }
        onClick={() => onChangeRole(user)}
        className="px-3.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2.5"
      >
        <UserCog className="size-3.5 text-primary" />
        <span>{t("changeRole")}</span>
        {isSelf && (
          <Badge
            variant="outline"
            className="ml-auto text-[10px] text-amber-700 bg-amber-50 border-amber-200"
          >
            {t("selfBadge")}
          </Badge>
        )}
      </DropdownMenuItem>

      {/* Réinitialiser le mot de passe */}
      <DropdownMenuItem
        disabled={!isAdmin}
        title={!isAdmin ? t("adminOnlyAction") : undefined}
        onClick={() => onResetPassword(user)}
        className="px-3.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2.5"
      >
        <KeyRound className="size-3.5 text-ink-500" />
        <span>{t("resetPassword")}</span>
      </DropdownMenuItem>

      {/* Voir l'activité */}
      <DropdownMenuItem
        onClick={() => onViewActivity(user)}
        className="px-3.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2.5"
      >
        <Activity className="size-3.5 text-ink-500" />
        <span>{t("viewActivity")}</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      {/* Bloquer / Débloquer */}
      <DropdownMenuItem
        disabled={!isAdmin || (!isBlocked && isTargetLastAdmin)}
        title={
          !isBlocked && isTargetLastAdmin
            ? t("lastAdminWarning")
            : !isAdmin
            ? t("adminOnlyAction")
            : undefined
        }
        onClick={() => onToggleBlock(user)}
        variant={isBlocked ? "default" : "destructive"}
        className="px-3.5 py-2 text-xs font-semibold cursor-pointer flex items-center gap-2.5"
      >
        {isBlocked ? (
          <>
            <CheckCircle className="size-3.5 text-success" />
            <span className="text-success">{t("unblockUser")}</span>
          </>
        ) : (
          <>
            {isSelf ? <ShieldAlert className="size-3.5" /> : <Ban className="size-3.5" />}
            <span>{t("blockUser")}</span>
            {isSelf && (
              <Badge
                variant="destructive"
                className="ml-auto text-[10px] px-1 py-0"
              >
                {t("warningBadge")}
              </Badge>
            )}
          </>
        )}
      </DropdownMenuItem>
    </RowActionsMenu>
  );
}

