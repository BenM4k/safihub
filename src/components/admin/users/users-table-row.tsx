"use client";

import { useTranslations } from "next-intl";
import { formatDateTime } from "@/lib/order-formatters";
import {
  formatRelativeLastLogin,
  formatUserEmail,
  getRoleBadgeInfo,
  getUserInitials,
  isUserInactive,
} from "@/lib/user-formatters";
import { PhoneCell } from "@/components/admin/shared/phone-cell";
import { StatusPill } from "@/components/admin/shared/status-pill";
import { UsersRowActionsMenu } from "./users-row-actions-menu";
import type { UserRow } from "./types";

interface UsersTableRowProps {
  user: UserRow;
  currentUserId?: string | null;
  isAdmin: boolean;
  activeAdminsCount: number;
  isSelected?: boolean;
  onSelect: (user: UserRow) => void;
  onViewProfile: (user: UserRow) => void;
  onChangeRole: (user: UserRow) => void;
  onResetPassword: (user: UserRow) => void;
  onViewActivity: (user: UserRow) => void;
  onToggleBlock: (user: UserRow) => void;
}

export function UsersTableRow({
  user,
  currentUserId,
  isAdmin,
  activeAdminsCount,
  isSelected = false,
  onSelect,
  onViewProfile,
  onChangeRole,
  onResetPassword,
  onViewActivity,
  onToggleBlock,
}: UsersTableRowProps) {
  const t = useTranslations("admin.users");
  const isBlocked = user.banned || user.status === "blocked";
  const isSelf = Boolean(currentUserId && currentUserId === user.id);
  const emailDisplay = formatUserEmail(user.email);
  const roleInfo = getRoleBadgeInfo(user.role);
  const inactive = isUserInactive(user.lastLoginAt, user.createdAt);

  const blockTooltip = isBlocked
    ? `${t("blockedOn", { date: formatDateTime(user.updatedAt) })}${user.banReason ? ` : ${user.banReason}` : ""}`
    : undefined;

  return (
    <tr
      tabIndex={0}
      role="row"
      onClick={() => onSelect(user)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) {
          e.preventDefault();
          onSelect(user);
        }
      }}
      className={`group cursor-pointer transition-colors border-b-2 border-border-strong/70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
        isSelected
          ? "bg-primary-soft/50 hover:bg-primary-soft"
          : "hover:bg-slate-50/80"
      }`}
    >
      {/* 1. Nom + Photo / Initials */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="size-9 rounded-full object-cover border-2 border-border-strong shrink-0 shadow-2xs"
            />
          ) : (
            <div className="size-9 rounded-full bg-primary/10 border-2 border-border-strong text-primary font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {getUserInitials(user.name)}
            </div>
          )}

          <div className="min-w-0">
            <div className="font-semibold text-heading text-sm flex items-center gap-1.5 truncate">
              <span>{user.name}</span>
              {isSelf && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                  {t("selfBadge")}
                </span>
              )}
              {user.isGuest && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                  {t("guestBadge")}
                </span>
              )}
            </div>
            <div className="text-2xs text-ink-500 font-mono">
              ID: {user.id.slice(0, 16)}…
            </div>
          </div>
        </div>
      </td>

      {/* 2. E-mail (Normal 13-14px font, never tiny monospace) */}
      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-ink-700 font-medium">
        <span className="max-w-[190px] truncate block" title={emailDisplay}>
          {emailDisplay}
        </span>
      </td>

      {/* 3. Téléphone */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <PhoneCell phone={user.contactPhone} showIcon />
      </td>

      {/* 4. Rôle */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${roleInfo.badgeClass}`}
        >
          <span className={`size-1.5 rounded-full ${roleInfo.dotClass}`} />
          <span>{roleInfo.label}</span>
        </span>
      </td>

      {/* 5. Pressing (si applicable) */}
      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-ink-700">
        {user.role === "house" ? (
          <span className="font-semibold text-heading">
            {user.houseName || "—"}
          </span>
        ) : (
          <span className="text-ink-400">—</span>
        )}
      </td>

      {/* 6. Dernière connexion */}
      <td className="px-4 py-3.5 whitespace-nowrap text-xs">
        <span
          className={`font-medium ${
            inactive
              ? "text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60"
              : "text-ink-700"
          }`}
          title={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : t("neverLoggedIn")}
        >
          {formatRelativeLastLogin(user.lastLoginAt)}
        </span>
      </td>

      {/* 7. Statut */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        {isBlocked ? (
          <StatusPill
            status="blocked"
            customLabel={t("statusBlocked")}
            title={blockTooltip}
          />
        ) : user.status === "invitation_sent" ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border-2 border-blue-200">
            <span className="size-1.5 rounded-full bg-blue-500" />
            <span>{t("statusInvited")}</span>
          </span>
        ) : (
          <StatusPill status="active" customLabel={t("statusActive")} />
        )}
      </td>

      {/* 8. Actions */}
      <td
        className="px-4 py-3.5 whitespace-nowrap text-right"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <UsersRowActionsMenu
          user={user}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          activeAdminsCount={activeAdminsCount}
          onViewProfile={onViewProfile}
          onChangeRole={onChangeRole}
          onResetPassword={onResetPassword}
          onViewActivity={onViewActivity}
          onToggleBlock={onToggleBlock}
        />
      </td>
    </tr>
  );
}
