"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/label";

interface CreateStaffRoleFieldsProps {
  role: string;
  onRoleChange: (role: string) => void;
  houseId: string;
  onHouseChange: (houseId: string) => void;
  houses: Array<{ id: string; name: string }>;
}

export function CreateStaffRoleFields({
  role,
  onRoleChange,
  houseId,
  onHouseChange,
  houses,
}: CreateStaffRoleFieldsProps) {
  const t = useTranslations("admin.users");

  const getRoleDescription = (selectedRole: string) => {
    switch (selectedRole) {
      case "admin":
        return t("roleAdminDesc");
      case "courier":
        return t("roleCourierDesc");
      case "house":
        return t("roleHouseDesc");
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Role Selector */}
      <div className="space-y-1.5">
        <Label htmlFor="staff-role" className="text-xs font-bold text-heading">
          {t("colRole")} <span className="text-destructive">*</span>
        </Label>
        <select
          id="staff-role"
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          required
          className="w-full min-h-[40px] px-3 rounded-xl border-2 border-border-strong bg-surface text-xs font-semibold text-heading focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <option value="">{t("chooseRole")}</option>
          <option value="courier">{t("roleCourier")}</option>
          <option value="house">{t("roleHouse")}</option>
          <option value="admin">{t("roleAdmin")}</option>
        </select>
      </div>

      {/* Role Description Banner */}
      {role && (
        <div className="p-3 bg-surface border-2 border-border-strong/80 rounded-xl space-y-1 animate-in fade-in duration-100">
          <div className="flex items-center gap-1.5 text-2xs font-bold text-primary">
            <ShieldCheck className="size-3.5" />
            <span>Description des autorisations</span>
          </div>
          <p className="text-xs text-ink-700 leading-relaxed">
            {getRoleDescription(role)}
          </p>
        </div>
      )}

      {/* Pressing select if house role */}
      {role === "house" && (
        <div className="space-y-1.5 animate-in fade-in duration-100">
          <Label htmlFor="staff-house" className="text-xs font-bold text-heading">
            {t("assignedHouse")} <span className="text-destructive">*</span>
          </Label>
          <select
            id="staff-house"
            value={houseId}
            onChange={(e) => onHouseChange(e.target.value)}
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
    </div>
  );
}
