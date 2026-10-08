"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { mergeGuestAccountAction } from "@/actions/admin-user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MergeGuestForm() {
  const t = useTranslations("admin.users");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleMerge(formData: FormData) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    const res = await mergeGuestAccountAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      setSuccess("Compte invité fusionné avec succès !");
      (document.getElementById("merge-form-el") as HTMLFormElement)?.reset();
    }
  }

  return (
    <form id="merge-form-el" action={handleMerge} className="p-5 bg-white rounded-xl border border-border shadow-xs space-y-3">
      <div>
        <div className="font-bold text-sm text-heading">{t("mergeGuest")}</div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Transfère l&apos;historique des commandes et adresses d&apos;un client saisi manuellement vers son nouveau compte inscrit.
        </p>
      </div>

      {error && <div className="text-xs text-destructive">{error}</div>}
      {success && <div className="text-xs text-emerald-600 font-semibold">{success}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="mgGuest" className="text-xs">{t("guestId")}</Label>
          <Input id="mgGuest" name="guestUserId" required placeholder="ex: usr_..." className="h-9 text-xs" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="mgTarget" className="text-xs">{t("targetId")}</Label>
          <Input id="mgTarget" name="targetUserId" required placeholder="ex: usr_..." className="h-9 text-xs" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading} size="sm" className="h-9">
          {loading ? "..." : t("mergeGuest")}
        </Button>
      </div>
    </form>
  );
}
