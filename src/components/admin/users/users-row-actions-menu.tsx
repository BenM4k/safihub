"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Activity,
  Ban,
  CheckCircle,
  Eye,
  KeyRound,
  MoreHorizontal,
  ShieldAlert,
  UserCog,
} from "lucide-react";
import { isLastAdmin } from "@/lib/user-guardrails";
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
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isBlocked = user.banned || user.status === "blocked";
  const isTargetLastAdmin = isLastAdmin(user.role, activeAdminsCount);
  const isSelf = Boolean(currentUserId && currentUserId === user.id);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="size-8 rounded-lg border-2 border-border-strong bg-white hover:bg-surface text-ink-600 hover:text-heading flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
        aria-label={`Actions pour ${user.name}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-card border-2 border-border-strong shadow-lg py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Voir le profil */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onViewProfile(user);
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-medium text-ink-700 hover:bg-surface hover:text-heading flex items-center gap-2.5 transition-colors"
          >
            <Eye className="size-3.5 text-ink-500" />
            <span>{t("viewProfile")}</span>
          </button>

          {/* Modifier le rôle */}
          <button
            type="button"
            role="menuitem"
            disabled={!isAdmin || isTargetLastAdmin}
            title={
              isTargetLastAdmin
                ? t("lastAdminWarning")
                : !isAdmin
                  ? "Action réservée aux administrateurs"
                  : undefined
            }
            onClick={() => {
              setOpen(false);
              onChangeRole(user);
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-medium text-ink-700 hover:bg-surface hover:text-heading flex items-center gap-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserCog className="size-3.5 text-primary" />
            <span>{t("changeRole")}</span>
            {isSelf && (
              <span className="ml-auto text-[10px] text-amber-700 font-semibold bg-amber-50 px-1 rounded border border-amber-200">
                Vous
              </span>
            )}
          </button>

          {/* Réinitialiser le mot de passe */}
          <button
            type="button"
            role="menuitem"
            disabled={!isAdmin}
            title={!isAdmin ? "Action réservée aux administrateurs" : undefined}
            onClick={() => {
              setOpen(false);
              onResetPassword(user);
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-medium text-ink-700 hover:bg-surface hover:text-heading flex items-center gap-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <KeyRound className="size-3.5 text-ink-500" />
            <span>{t("resetPassword")}</span>
          </button>

          {/* Voir l'activité */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onViewActivity(user);
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-medium text-ink-700 hover:bg-surface hover:text-heading flex items-center gap-2.5 transition-colors"
          >
            <Activity className="size-3.5 text-ink-500" />
            <span>{t("viewActivity")}</span>
          </button>

          <div className="my-1 border-t border-border-strong/60" />

          {/* Bloquer / Débloquer */}
          <button
            type="button"
            role="menuitem"
            disabled={!isAdmin || (!isBlocked && isTargetLastAdmin)}
            title={
              !isBlocked && isTargetLastAdmin
                ? t("lastAdminWarning")
                : !isAdmin
                  ? "Action réservée aux administrateurs"
                  : undefined
            }
            onClick={() => {
              setOpen(false);
              onToggleBlock(user);
            }}
            className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isBlocked
                ? "text-emerald-700 hover:bg-emerald-50"
                : "text-destructive hover:bg-destructive-light"
            }`}
          >
            {isBlocked ? (
              <>
                <CheckCircle className="size-3.5" />
                <span>{t("unblockUser")}</span>
              </>
            ) : (
              <>
                {isSelf ? <ShieldAlert className="size-3.5" /> : <Ban className="size-3.5" />}
                <span>{t("blockUser")}</span>
                {isSelf && (
                  <span className="ml-auto text-[10px] text-destructive bg-red-100 px-1 rounded">
                    Attention
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
