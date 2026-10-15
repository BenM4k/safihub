"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, ArrowRight, ShieldCheck, UserCog, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateUserRoleAction } from "@/actions/admin-user.actions";
import { isLastAdmin } from "@/lib/user-guardrails";
import { getRoleBadgeInfo } from "@/lib/user-formatters";
import type { UserRow } from "../types";

interface UserRoleDialogProps {
  user: UserRow | null;
  isOpen: boolean;
  currentUserId?: string | null;
  activeAdminsCount: number;
  houses: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserRoleDialog({
  user,
  isOpen,
  currentUserId,
  activeAdminsCount,
  houses,
  onClose,
  onSuccess,
}: UserRoleDialogProps) {
  const t = useTranslations("admin.users");
  const [selectedRole, setSelectedRole] = useState<string>("courier");
  const [selectedHouseId, setSelectedHouseId] = useState<string>("");
  const [selfConfirmed, setSelfConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = Boolean(currentUserId && user && currentUserId === user.id);
  const isTargetLastAdmin = Boolean(user && isLastAdmin(user.role, activeAdminsCount));

  const [prevUser, setPrevUser] = useState(user);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (user !== prevUser || isOpen !== prevIsOpen) {
    setPrevUser(user);
    setPrevIsOpen(isOpen);
    if (isOpen && user) {
      setSelectedRole(user.role || "courier");
      setSelectedHouseId(user.houseId || "");
      setSelfConfirmed(false);
      setError(null);
    }
  }

  if (!isOpen || !user) return null;

  const currentRoleInfo = getRoleBadgeInfo(user.role);
  const newRoleInfo = getRoleBadgeInfo(selectedRole);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTargetLastAdmin && selectedRole !== "admin") {
      setError(t("lastAdminWarning"));
      return;
    }
    if (selectedRole === "house" && !selectedHouseId) {
      setError(t("selectHouseRequired"));
      return;
    }
    if (isSelf && selectedRole !== "admin" && !selfConfirmed) {
      setError(t("selfDemotionConfirmRequired"));
      return;
    }

    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("userId", user.id);
    fd.append("newRole", selectedRole);
    if (selectedRole === "house") {
      fd.append("houseId", selectedHouseId);
    }
    if (isSelf) {
      fd.append("confirmedSelfAction", "true");
    }

    try {
      const res = await updateUserRoleAction(fd);
      if (!res.ok) {
        setError(res.error);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unknownError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-card rounded-2xl border-2 border-border-strong shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-border-strong bg-surface">
          <div className="flex items-center gap-2 text-heading font-bold text-sm">
            <UserCog className="size-5 text-primary" />
            <span id="role-dialog-title">{t("roleChangeConfirm")}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-800 p-1 rounded-lg focus:outline-none"
            aria-label={t("cancel")}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-xs text-ink-700 leading-relaxed">
              {t("roleChangeFor", { name: user.name, email: user.email })}
            </p>
          </div>

          {/* Role Transition Comparison */}
          <div className="p-3.5 bg-surface border-2 border-border-strong rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-2xs text-ink-500 font-medium uppercase tracking-wider block">
                {t("currentRole")}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${currentRoleInfo.badgeClass}`}
              >
                {currentRoleInfo.label}
              </span>
            </div>

            <ArrowRight className="size-4 text-ink-400 shrink-0" />

            <div className="space-y-1 text-right">
              <span className="text-2xs text-ink-500 font-medium uppercase tracking-wider block">
                {t("newRole")}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${newRoleInfo.badgeClass}`}
              >
                {newRoleInfo.label}
              </span>
            </div>
          </div>

          {/* New Role Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="role-select" className="text-xs font-bold text-heading">
              {t("assignNewRole")} <span className="text-destructive">*</span>
            </Label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full min-h-[40px] px-3 rounded-xl border-2 border-border-strong bg-surface text-xs font-semibold text-heading focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="admin">{t("roleAdmin")}</option>
              <option value="courier">{t("roleCourier")}</option>
              <option value="house">{t("roleHouse")}</option>
              <option value="customer">{t("roleCustomer")}</option>
            </select>
          </div>

          {/* Permission explanation */}
          <div className="p-3 bg-card border-2 border-border-strong/70 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-2xs font-bold text-primary">
              <ShieldCheck className="size-3.5" />
              <span>{t("permissionsScope")}</span>
            </div>
            <p className="text-xs text-ink-700 leading-relaxed">
              {getRoleDescription(selectedRole)}
            </p>
          </div>

          {/* Pressing Selection if House role */}
          {selectedRole === "house" && (
            <div className="space-y-1.5 animate-in fade-in duration-100">
              <Label htmlFor="house-select" className="text-xs font-bold text-heading">
                {t("assignedHouse")} <span className="text-destructive">*</span>
              </Label>
              <select
                id="house-select"
                value={selectedHouseId}
                onChange={(e) => setSelectedHouseId(e.target.value)}
                required
                className="w-full min-h-[40px] px-3 rounded-xl border-2 border-border-strong bg-surface text-xs font-semibold text-heading focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="">{t("selectHouse")}</option>
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Self action warning */}
          {isSelf && selectedRole !== "admin" && (
            <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <AlertTriangle className="size-4 text-amber-600" />
                <span>{t("selfDemotionTitle")}</span>
              </div>
              <p className="text-2xs text-amber-800 leading-relaxed">
                {t("selfDemotionDesc")}
              </p>
              <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-amber-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selfConfirmed}
                  onChange={(e) => setSelfConfirmed(e.target.checked)}
                  className="rounded border-amber-400 text-amber-700 focus:ring-amber-500"
                />
                <span>{t("selfDemotionCheck")}</span>
              </label>
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-destructive-light border border-destructive-base/30 rounded-xl text-xs font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-strong/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="min-h-[40px] px-4 text-xs font-semibold border-2 border-border-strong bg-surface hover:bg-muted text-ink-800 rounded-xl"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                (selectedRole === "house" && !selectedHouseId) ||
                (isSelf && selectedRole !== "admin" && !selfConfirmed) ||
                (isTargetLastAdmin && selectedRole !== "admin")
              }
              className="min-h-[40px] px-4 text-xs font-bold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-xs"
            >
              {loading ? t("saving") : t("save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
