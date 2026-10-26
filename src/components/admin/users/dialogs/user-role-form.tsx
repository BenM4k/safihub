"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { updateUserRoleAction } from "@/actions/admin-user.actions";
import { isLastAdmin } from "@/lib/user-guardrails";
import { getRoleBadgeInfo } from "@/lib/user-formatters";
import { UserRoleComparison } from "./user-role-comparison";
import type { UserRow } from "../types";

interface UserRoleFormProps {
  user: UserRow;
  currentUserId?: string | null;
  activeAdminsCount: number;
  houses: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserRoleForm({
  user,
  currentUserId,
  activeAdminsCount,
  houses,
  onClose,
  onSuccess,
}: UserRoleFormProps) {
  const t = useTranslations("admin.users");
  const [selectedRole, setSelectedRole] = useState<string>(user.role || "house");
  const [selectedHouseId, setSelectedHouseId] = useState<string>(user.houseId || "");
  const [selfConfirmed, setSelfConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = Boolean(currentUserId && currentUserId === user.id);
  const isTargetLastAdmin = isLastAdmin(user.role, activeAdminsCount);

  const currentRoleInfo = getRoleBadgeInfo(user.role);
  const newRoleInfo = getRoleBadgeInfo(selectedRole);

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
    <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
      <div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("roleChangeFor", { name: user.name, email: user.email })}
        </p>
      </div>

      {/* Role Transition Comparison and Permissions Scope */}
      <UserRoleComparison
        currentRoleInfo={currentRoleInfo}
        newRoleInfo={newRoleInfo}
        selectedRole={selectedRole}
      />

      {/* New Role Selector */}
      <Field className="gap-2">
        <FieldLabel htmlFor="role-select" className="text-xs sm:text-sm font-semibold">
          {t("assignNewRole")} <span className="text-destructive">*</span>
        </FieldLabel>
        <select
          id="role-select"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          disabled={loading}
          className="flex w-full min-h-12 rounded-xl border border-border-strong bg-card px-4 py-2.5 text-base text-foreground transition-all duration-150 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
        >
          <option value="admin">{t("roleAdmin")}</option>
          <option value="courier">{t("roleCourier")}</option>
          <option value="house">{t("roleHouse")}</option>
          <option value="customer">{t("roleCustomer")}</option>
        </select>
      </Field>

      {/* Pressing Selection if House role */}
      {selectedRole === "house" && (
        <Field className="gap-2 animate-in fade-in duration-100">
          <FieldLabel htmlFor="house-select" className="text-xs sm:text-sm font-semibold">
            {t("assignedHouse")} <span className="text-destructive">*</span>
          </FieldLabel>
          <select
            id="house-select"
            value={selectedHouseId}
            onChange={(e) => setSelectedHouseId(e.target.value)}
            required
            disabled={loading}
            className="flex w-full min-h-12 rounded-xl border border-border-strong bg-card px-4 py-2.5 text-base text-foreground transition-all duration-150 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
          >
            <option value="">{t("selectHouse")}</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      {/* Self action warning */}
      {isSelf && selectedRole !== "admin" && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-4 text-amber-600" />
            <span>{t("selfDemotionTitle")}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("selfDemotionDesc")}
          </p>
          <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-foreground cursor-pointer">
            <Checkbox
              checked={selfConfirmed}
              onCheckedChange={(checked) => setSelfConfirmed(Boolean(checked))}
            />
            <span>{t("selfDemotionCheck")}</span>
          </label>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
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
        >
          {loading && <Spinner className="size-3.5 mr-1.5" />}
          {loading ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}
