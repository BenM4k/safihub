"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createStaffAccountAction } from "@/actions/admin-user.actions";
import {
  evaluatePasswordStrength,
  isValidDrcPhone,
  isValidEmail,
  normalizeDrcPhone,
} from "@/lib/user-guardrails";
import { CreateStaffPasswordField } from "./create-staff-password-field";
import { CreateStaffRoleFields } from "./create-staff-role-fields";

interface CreateStaffFormProps {
  houses: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateStaffForm({
  houses,
  onClose,
  onSuccess,
}: CreateStaffFormProps) {
  const t = useTranslations("admin.users");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+243 ");
  const [role, setRole] = useState("");
  const [houseId, setHouseId] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const res = await createStaffAccountAction(fd);
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
    <div className="flex-1 flex flex-col min-h-0">
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field className="gap-2">
            <FieldLabel htmlFor="staff-name" className="text-xs sm:text-sm font-semibold">
              {t("fullName")} <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="staff-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Patrick Ilunga"
              required
            />
          </Field>

          <Field className="gap-2" data-invalid={Boolean(email && !isEmailValid)}>
            <FieldLabel htmlFor="staff-email" className="text-xs sm:text-sm font-semibold">
              {t("email")} <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="staff-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@safihub.cd"
              required
              aria-invalid={Boolean(email && !isEmailValid)}
            />
            {email && !isEmailValid && (
              <FieldError>{t("invalidEmailFormat")}</FieldError>
            )}
          </Field>
        </div>

        <Field className="gap-2" data-invalid={Boolean(phone && phone !== "+243 " && !isPhoneValid)}>
          <FieldLabel htmlFor="staff-phone" className="text-xs sm:text-sm font-semibold">
            {t("phone")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="staff-phone"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="+243 99 953 7712"
            required
            className="font-mono text-sm"
            aria-invalid={Boolean(phone && phone !== "+243 " && !isPhoneValid)}
          />
          {phone && phone !== "+243 " && !isPhoneValid && (
            <FieldError>{t("invalidPhoneFormat")}</FieldError>
          )}
        </Field>

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
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {t("cancel")}
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !isFormValid}
        >
          {loading ? t("creatingAccount") : t("createAccountButton")}
        </Button>
      </div>
    </div>
  );
}
