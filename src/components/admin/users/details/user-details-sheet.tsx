"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Activity,
  Ban,
  CheckCircle,
  KeyRound,
  Shield,
  User,
  UserCog,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isLastAdmin } from "@/lib/user-guardrails";
import { getRoleBadgeInfo, getUserInitials } from "@/lib/user-formatters";
import { UserTabProfile } from "./user-tab-profile";
import { UserTabPermissions } from "./user-tab-permissions";
import { UserTabActivity } from "./user-tab-activity";
import type { UserDetailsTab, UserRow } from "../types";

interface UserDetailsSheetProps {
  user: UserRow | null;
  initialTab?: UserDetailsTab;
  currentUserId?: string | null;
  isAdmin: boolean;
  activeAdminsCount: number;
  hasOverlay?: boolean;
  onClose: () => void;
  onChangeRole: (user: UserRow) => void;
  onResetPassword: (user: UserRow) => void;
  onToggleBlock: (user: UserRow) => void;
}

export function UserDetailsSheet({
  user,
  initialTab = "profile",
  currentUserId,
  isAdmin,
  activeAdminsCount,
  hasOverlay = false,
  onClose,
  onChangeRole,
  onResetPassword,
  onToggleBlock,
}: UserDetailsSheetProps) {
  const t = useTranslations("admin.users");
  const [tab, setTab] = useState<UserDetailsTab>(initialTab);

  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setTab(initialTab);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !hasOverlay) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, hasOverlay]);

  if (!user) return null;

  const roleInfo = getRoleBadgeInfo(user.role);
  const isBlocked = user.banned || user.status === "blocked";
  const isTargetLastAdmin = isLastAdmin(user.role, activeAdminsCount);
  const isSelf = Boolean(currentUserId && currentUserId === user.id);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-lg h-full bg-card border-l-2 border-border-strong shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-border-strong bg-surface shrink-0">
          <div className="flex items-center gap-3">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="size-10 rounded-full object-cover border-2 border-border-strong shrink-0 shadow-xs"
              />
            ) : (
              <div className="size-10 rounded-full bg-primary/10 border-2 border-border-strong text-primary font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                {getUserInitials(user.name)}
              </div>
            )}
            <div>
              <h2 id="user-details-title" className="text-sm font-bold text-heading flex items-center gap-1.5">
                <span>{user.name}</span>
                {isSelf && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                    {t("selfBadge")}
                  </span>
                )}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-semibold mt-0.5 ${roleInfo.badgeClass}`}
              >
                <span className={`size-1 rounded-full ${roleInfo.dotClass}`} />
                <span>{roleInfo.label}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-800 p-1.5 rounded-xl border-2 border-border-strong bg-card hover:bg-surface focus:outline-none transition-colors"
            aria-label={t("closePanel")}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b-2 border-border-strong bg-card shrink-0">
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-ink-500 hover:text-heading"
            }`}
          >
            <User className="size-3.5" />
            <span>{t("tabProfile")}</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("permissions")}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === "permissions"
                ? "border-primary text-primary"
                : "border-transparent text-ink-500 hover:text-heading"
            }`}
          >
            <Shield className="size-3.5" />
            <span>{t("tabPermissions")}</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("activity")}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === "activity"
                ? "border-primary text-primary"
                : "border-transparent text-ink-500 hover:text-heading"
            }`}
          >
            <Activity className="size-3.5" />
            <span>{t("tabActivity")}</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "profile" && <UserTabProfile user={user} />}
          {tab === "permissions" && <UserTabPermissions user={user} />}
          {tab === "activity" && <UserTabActivity user={user} />}
        </div>

        {/* Quick Actions Footer */}
        {isAdmin && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3.5 border-t-2 border-border-strong bg-surface shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isTargetLastAdmin}
                onClick={() => onChangeRole(user)}
                className="h-9 text-xs font-semibold border-2 border-border-strong bg-card hover:bg-muted gap-1.5 rounded-xl disabled:opacity-50"
              >
                <UserCog className="size-3.5 text-primary" />
                <span>{t("changeRole")}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onResetPassword(user)}
                className="h-9 text-xs font-semibold border-2 border-border-strong bg-card hover:bg-muted gap-1.5 rounded-xl"
              >
                <KeyRound className="size-3.5 text-ink-500" />
                <span>{t("resetPassword")}</span>
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={!isBlocked && isTargetLastAdmin}
              onClick={() => onToggleBlock(user)}
              className={`h-9 text-xs font-semibold border-2 rounded-xl gap-1.5 disabled:opacity-50 ${
                isBlocked
                  ? "border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                  : "border-destructive-base/30 text-destructive bg-destructive-light/60 hover:bg-destructive-light"
              }`}
            >
              {isBlocked ? (
                <>
                  <CheckCircle className="size-3.5" />
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
        )}
      </div>
    </div>
  );
}
