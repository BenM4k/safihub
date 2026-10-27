"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
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
    <section className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <KeyRound className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Modifier le mot de passe</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Utilisez un mot de passe robuste d&apos;au moins 8 caractères.
          </p>
        </div>
      </div>

      {passwordError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs font-semibold">{passwordError}</AlertDescription>
        </Alert>
      )}
      {passwordSuccess && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <AlertDescription className="text-xs font-semibold">{passwordSuccess}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handlePasswordSubmit} className="space-y-3.5 max-w-md text-xs">
        <Field className="space-y-1.5">
          <FieldLabel className="font-semibold text-foreground">Mot de passe actuel</FieldLabel>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="text-xs h-10 min-h-[40px] rounded-xl"
          />
        </Field>

        <Field className="space-y-1.5">
          <FieldLabel className="font-semibold text-foreground">Nouveau mot de passe</FieldLabel>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="text-xs h-10 min-h-[40px] rounded-xl"
          />
        </Field>

        <Field className="space-y-1.5">
          <FieldLabel className="font-semibold text-foreground">
            Confirmer le nouveau mot de passe
          </FieldLabel>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="text-xs h-10 min-h-[40px] rounded-xl"
          />
        </Field>

        <div className="flex items-center gap-2 pt-1">
          <Checkbox
            id="revokeOthers"
            checked={revokeOthers}
            onCheckedChange={(checked) => setRevokeOthers(Boolean(checked))}
          />
          <label htmlFor="revokeOthers" className="text-xs text-foreground cursor-pointer select-none">
            Déconnecter tous les autres appareils connectés
          </label>
        </div>

        <Button
          type="submit"
          disabled={isChangingPassword}
          className="h-10 sm:h-9 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs cursor-pointer w-full sm:w-auto"
        >
          {isChangingPassword ? (
            <>
              <Spinner className="size-3.5 text-current mr-1.5" />
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
