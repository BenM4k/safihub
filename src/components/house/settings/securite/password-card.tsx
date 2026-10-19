"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/services/auth/auth-client";

export function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOthers, setRevokeOthers] = useState(true);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError("Le nouveau mot de passe doit comporter au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: revokeOthers,
      });

      if (res.error) {
        setPasswordError(res.error.message || "Erreur lors du changement de mot de passe.");
      } else {
        setPasswordSuccess("Mot de passe modifié avec succès.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(null), 4000);
      }
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <KeyRound className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-heading">Modifier le mot de passe</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Utilisez un mot de passe robuste d&apos;au moins 8 caractères.
          </p>
        </div>
      </div>

      {passwordError && (
        <div className="p-3 bg-destructive-soft border border-destructive/30 rounded-xl text-xs text-destructive font-semibold flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{passwordError}</span>
        </div>
      )}
      {passwordSuccess && (
        <div className="p-3 bg-success-soft border border-success/30 rounded-xl text-xs text-success font-semibold flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{passwordSuccess}</span>
        </div>
      )}

      <form onSubmit={handlePasswordSubmit} className="space-y-3.5 max-w-md text-xs">
        <div>
          <label className="font-semibold text-foreground block mb-1.5">Mot de passe actuel</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="font-semibold text-foreground block mb-1.5">Nouveau mot de passe</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="font-semibold text-foreground block mb-1.5">
            Confirmer le nouveau mot de passe
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={revokeOthers}
            onChange={(e) => setRevokeOthers(e.target.checked)}
            className="rounded-sm border-border text-primary focus:ring-primary"
          />
          <span>Déconnecter tous les autres appareils connectés</span>
        </label>

        <Button
          type="submit"
          disabled={isChangingPassword}
          className="min-h-[44px] px-4 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs"
        >
          {isChangingPassword ? (
            <>
              <Loader2 className="size-3.5 animate-spin mr-1.5" />
              <span>Modification...</span>
            </>
          ) : (
            <span>Mettre à jour le mot de passe</span>
          )}
        </Button>
      </form>
    </section>
  );
}
