"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  blockUserAction,
  resetUserPasswordAction,
  unblockUserAction,
} from "@/actions/admin-user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserRecord } from "@/dal";

interface UserActionModalsProps {
  user: UserRecord | null;
  mode: "block" | "reset" | null;
  onClose: () => void;
}

export function UserActionModals({ user, mode, onClose }: UserActionModalsProps) {
  const t = useTranslations("admin.users");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user || !mode) return null;

  async function handleBlock(formData: FormData) {
    setError(null);
    setLoading(true);
    formData.append("userId", user!.id);
    const res = await blockUserAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      onClose();
    }
  }

  async function handleReset(formData: FormData) {
    setError(null);
    setLoading(true);
    formData.append("userId", user!.id);
    const res = await resetUserPasswordAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl border border-border shadow-lg max-w-md w-full p-6 space-y-4">
        {mode === "block" && (
          <form action={handleBlock} className="space-y-4">
            <h3 className="text-sm font-bold text-heading">
              {t("blockUser")} : {user.name}
            </h3>
            {error && <div className="text-xs text-destructive">{error}</div>}
            <div className="space-y-1">
              <Label htmlFor="bReason" className="text-xs">{t("blockReason")}</Label>
              <Input id="bReason" name="reason" required placeholder="Motif du blocage..." className="h-9 text-xs" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" variant="destructive" disabled={loading} size="sm">
                {loading ? "..." : t("blockUser")}
              </Button>
            </div>
          </form>
        )}

        {mode === "reset" && (
          <form action={handleReset} className="space-y-4">
            <h3 className="text-sm font-bold text-heading">
              {t("resetPassword")} : {user.name}
            </h3>
            {error && <div className="text-xs text-destructive">{error}</div>}
            <div className="space-y-1">
              <Label htmlFor="nPass" className="text-xs">{t("newPassword")}</Label>
              <Input id="nPass" name="newPassword" type="password" required minLength={8} placeholder="Min. 8 caractères" className="h-9 text-xs" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading} size="sm">
                {loading ? "..." : t("resetPassword")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function UnblockButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleUnblock() {
    setLoading(true);
    const fd = new FormData();
    fd.append("userId", userId);
    await unblockUserAction(fd);
    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={handleUnblock}
      className="h-7 text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200"
    >
      Débloquer
    </Button>
  );
}
