"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { formatDateTime } from "@/lib/order-formatters";
import {
  formatRelativeLastLogin,
  formatUserEmail,
  getRoleBadgeInfo,
  getUserInitials,
} from "@/lib/user-formatters";
import { PhoneCell } from "@/components/admin/shared/phone-cell";
import type { UserRow } from "../types";

interface UserTabProfileProps {
  user: UserRow;
}

export function UserTabProfile({ user }: UserTabProfileProps) {
  const t = useTranslations("admin.users");
  const roleInfo = getRoleBadgeInfo(user.role);
  const emailDisplay = formatUserEmail(user.email);

  return (
    <div className="space-y-4 text-xs">
      {/* Notice if user is a customer */}
      {user.role === "customer" && (
        <div className="p-3.5 bg-blue-50 border-2 border-blue-200 rounded-xl space-y-2">
          <p className="text-xs text-blue-900 leading-relaxed font-medium">
            {t("customersNotice")}
          </p>
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <span>{t("goToCustomers")}</span>
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
      )}

      {/* Main Profile Identity */}
      <div className="rounded-xl bg-card space-y-4">
        <div className="flex items-center gap-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="size-14 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div className="size-14 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-lg flex items-center justify-center shrink-0">
              {getUserInitials(user.name)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-heading text-base truncate">
              {user.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold ${roleInfo.badgeClass}`}
              >
                <span
                  className={`size-1.5 rounded-full ${roleInfo.dotClass}`}
                />
                <span>{roleInfo.label}</span>
              </span>
              {user.isGuest && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  Invité
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="divide-y divide-border-strong/70 text-ink-700">
          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-ink-500">
              <User className="size-3.5" />
              <span>Identifiant</span>
            </span>
            <span className="font-mono text-heading font-semibold select-all text-2xs">
              {user.id}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-ink-500">
              <Mail className="size-3.5" />
              <span>{t("email")}</span>
            </span>
            <span className="font-medium text-heading select-all">
              {emailDisplay}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-ink-500">
              <Phone className="size-3.5" />
              <span>{t("phone")}</span>
            </span>
            <PhoneCell phone={user.contactPhone} showIcon />
          </div>

          {user.role === "house" && (
            <div className="py-2.5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-ink-500">
                <MapPin className="size-3.5" />
                <span>{t("assignedHouse")}</span>
              </span>
              <span className="font-semibold text-heading">
                {user.houseName || "—"}
              </span>
            </div>
          )}

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-ink-500">
              <Clock className="size-3.5" />
              <span>{t("colLastLogin")}</span>
            </span>
            <span className="font-semibold text-heading">
              {formatRelativeLastLogin(user.lastLoginAt)}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-ink-500">
              <Calendar className="size-3.5" />
              <span>{t("createdAt")}</span>
            </span>
            <span className="font-semibold text-heading">
              {formatDateTime(user.createdAt)}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-ink-500">
              <Shield className="size-3.5" />
              <span>{t("emailStatus")}</span>
            </span>
            <span className="font-semibold text-heading">
              {user.emailVerified ? t("emailVerified") : t("emailUnverified")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
