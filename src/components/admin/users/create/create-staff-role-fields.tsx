"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";

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
    <div className="flex flex-col gap-4">
      {/* Role Selector */}
      <Field className="gap-2">
        <FieldLabel htmlFor="staff-role" className="text-xs sm:text-sm font-semibold">
          {t("colRole")} <span className="text-destructive">*</span>
        </FieldLabel>
        <select
          id="staff-role"
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          required
          className="flex w-full min-h-12 rounded-xl border border-border-strong bg-card px-4 py-2.5 text-base text-foreground transition-all duration-150 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
        >
          <option value="">{t("chooseRole")}</option>
          <option value="house">{t("roleHouse")}</option>
          <option value="admin">{t("roleAdmin")}</option>
        </select>
      </Field>

      {/* Role Description Banner */}
      {role && (
        <div className="p-3 bg-muted/40 border border-border rounded-lg space-y-1 animate-in fade-in duration-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <ShieldCheck className="size-4" />
            <span>{t("permissionsScope")}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {getRoleDescription(role)}
          </p>
        </div>
      )}

      {/* Pressing select if house role */}
      {role === "house" && (
        <Field className="gap-2 animate-in fade-in duration-100">
          <FieldLabel htmlFor="staff-house" className="text-xs sm:text-sm font-semibold">
            {t("assignedHouse")} <span className="text-destructive">*</span>
          </FieldLabel>
          <select
            id="staff-house"
            value={houseId}
            onChange={(e) => onHouseChange(e.target.value)}
            required
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
    </div>
  );
}
