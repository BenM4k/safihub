"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStaffAccountAction } from "@/actions/admin-user.actions";
import {
  evaluatePasswordStrength,
  isValidDrcPhone,
  isValidEmail,
  normalizeDrcPhone,
} from "@/lib/user-guardrails";
import { CreateStaffPasswordField } from "./create/create-staff-password-field";
import { CreateStaffRoleFields } from "./create/create-staff-role-fields";

interface CreateStaffSheetProps {
  isOpen: boolean;
  houses: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateStaffSheet({
  isOpen,
  houses,
  onClose,
  onSuccess,
}: CreateStaffSheetProps) {
  const t = useTranslations("admin.users");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+243 ");
  const [role, setRole] = useState("");
  const [houseId, setHouseId] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setPhone("+243 ");
      setRole("");
      setHouseId("");
      setPassword("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (val: string) => {
    setPhone(normalizeDrcPhone(val));
  };

  const passwordStrength = evaluatePasswordStrength(password);
  const isEmailValid = isValidEmail(email);
  const isPhoneValid = isValidDrcPhone(phone);
  const isRoleValid = Boolean(role);
  const isHouseValid = role !== "house" || Boolean(houseId);
  const isFormValid =
    Boolean(name.trim()) &&
    isEmailValid &&
    isPhoneValid &&
    isRoleValid &&
    isHouseValid &&
    passwordStrength.isValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("email", email.trim().toLowerCase());
    fd.append("phone", phone.trim());
    fd.append("role", role);
    if (role === "house") {
      fd.append("houseId", houseId);
    }
    fd.append("password", password);

    const res = await createStaffAccountAction(fd);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-xl h-full bg-card border-l-2 border-border-strong shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-sheet-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-border-strong bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h2 id="create-sheet-title" className="text-sm font-bold text-heading">
                {t("createStaffTitle")}
              </h2>
              <p className="text-2xs text-ink-500">{t("createStaffDesc")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-800 p-1.5 rounded-xl border-2 border-border-strong bg-card hover:bg-surface focus:outline-none transition-colors"
            aria-label={t("cancel")}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-destructive-light border-2 border-destructive-base/30 rounded-xl text-xs font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="staff-name" className="text-xs font-bold text-heading">
                {t("fullName")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="staff-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Patrick Ilunga"
                required
                className="min-h-[40px] text-xs bg-surface border-2 border-border-strong rounded-xl text-heading"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-email" className="text-xs font-bold text-heading">
                {t("email")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@safihub.cd"
                required
                className={`min-h-[40px] text-xs bg-surface border-2 rounded-xl text-heading ${
                  email && !isEmailValid ? "border-destructive-base" : "border-border-strong"
                }`}
              />
              {email && !isEmailValid && (
                <p className="text-2xs text-destructive font-medium">Format d&apos;e-mail invalide</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="staff-phone" className="text-xs font-bold text-heading">
              {t("phone")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="staff-phone"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+243 99 953 7712"
              required
              className={`min-h-[40px] text-xs bg-surface border-2 rounded-xl font-mono text-heading ${
                phone && phone !== "+243 " && !isPhoneValid
                  ? "border-destructive-base"
                  : "border-border-strong"
              }`}
            />
            {phone && phone !== "+243 " && !isPhoneValid && (
              <p className="text-2xs text-destructive font-medium">Format attendu : +243 99 953 7712</p>
            )}
          </div>

          <CreateStaffRoleFields
            role={role}
            onRoleChange={setRole}
            houseId={houseId}
            onHouseChange={setHouseId}
            houses={houses}
          />

          <CreateStaffPasswordField value={password} onChange={setPassword} />
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t-2 border-border-strong bg-surface shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="min-h-[40px] px-4 text-xs font-semibold border-2 border-border-strong bg-card hover:bg-muted text-ink-800 rounded-xl"
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            className="min-h-[40px] px-5 text-xs font-bold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-xs"
          >
            {loading ? "Création en cours…" : "Créer le compte"}
          </Button>
        </div>
      </div>
    </div>
  );
}
