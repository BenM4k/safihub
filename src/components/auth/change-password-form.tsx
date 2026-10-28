"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check, AlertCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { changeForcedPasswordAction } from "@/actions/auth-password.actions";
import { evaluatePasswordStrength } from "@/lib/user-guardrails";

export function ChangePasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const strength = evaluatePasswordStrength(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid =
    currentPassword.length > 0 &&
    strength.isValid &&
    passwordsMatch &&
    currentPassword !== newPassword;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid || isPending) return;

    setError(null);
    const fd = new FormData();
    fd.set("currentPassword", currentPassword);
    fd.set("newPassword", newPassword);
    fd.set("confirmPassword", confirmPassword);

    startTransition(async () => {
      try {
        const res = await changeForcedPasswordAction(fd);
        if (!res.ok) {
          setError(res.error);
        } else {
          router.push(res.value.redirectUrl);
          router.refresh();
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur inattendue est survenue lors de la mise à jour du mot de passe."
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-sans">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4 shrink-0" />
          <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
        </Alert>
      )}

      {/* Temporary password */}
      <Field className="space-y-1.5">
        <FieldLabel htmlFor="current-password" className="text-xs font-bold text-foreground">
          Mot de passe temporaire
        </FieldLabel>
        <div className="relative">
          <Input
            id="current-password"
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Reçu par email ou administrateur"
            autoComplete="current-password"
            className="pr-10 text-sm"
            required
          />
          <button
            type="button"
            onClick={() => setShowCurrent((prev) => !prev)}
            aria-label={showCurrent ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      {/* New password */}
      <Field className="space-y-1.5">
        <FieldLabel htmlFor="new-password" className="text-xs font-bold text-foreground">
          Nouveau mot de passe
        </FieldLabel>
        <div className="relative">
          <Input
            id="new-password"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Au moins 8 caractères"
            autoComplete="new-password"
            className="pr-10 text-sm"
            required
          />
          <button
            type="button"
            onClick={() => setShowNew((prev) => !prev)}
            aria-label={showNew ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        {/* Inline password rules */}
        <div className="pt-2 pb-1 space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`size-4 rounded-full flex items-center justify-center text-[10px] ${
                strength.hasMinLength
                  ? "bg-emerald-500/10 text-emerald-600 font-bold"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {strength.hasMinLength ? <Check className="size-2.5" /> : "•"}
            </span>
            <span
              className={
                strength.hasMinLength
                  ? "text-emerald-700 dark:text-emerald-400 font-medium"
                  : "text-muted-foreground"
              }
            >
              Au moins 8 caractères
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`size-4 rounded-full flex items-center justify-center text-[10px] ${
                strength.hasNumber || strength.hasSpecial
                  ? "bg-emerald-500/10 text-emerald-600 font-bold"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {strength.hasNumber || strength.hasSpecial ? (
                <Check className="size-2.5" />
              ) : (
                "•"
              )}
            </span>
            <span
              className={
                strength.hasNumber || strength.hasSpecial
                  ? "text-emerald-700 dark:text-emerald-400 font-medium"
                  : "text-muted-foreground"
              }
            >
              Au moins un chiffre ou un symbole spécial
            </span>
          </div>
        </div>
      </Field>

      {/* Confirm password */}
      <Field className="space-y-1.5">
        <FieldLabel htmlFor="confirm-password" className="text-xs font-bold text-foreground">
          Confirmer le nouveau mot de passe
        </FieldLabel>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Répétez le mot de passe"
            autoComplete="new-password"
            className="pr-10 text-sm"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            aria-label={showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-[11px] text-destructive font-medium mt-1">
            Les deux mots de passe ne correspondent pas.
          </p>
        )}
      </Field>

      <Button
        type="submit"
        disabled={!isFormValid || isPending}
        className="w-full h-11 text-sm font-bold gap-2 mt-2"
      >
        <KeyRound className="size-4" />
        <span>{isPending ? "Mise à jour en cours..." : "Enregistrer et continuer"}</span>
      </Button>
    </form>
  );
}
