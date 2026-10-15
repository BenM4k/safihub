"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetCustomerPasswordAction } from "@/actions/admin-customer.actions";
import { formatCustomerName } from "@/lib/customer-formatters";
import type { CustomerRow } from "./types";

interface CustomerResetDialogProps {
  customer: CustomerRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function generateSecurePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$";
  const buffer = new Uint8Array(10);
  crypto.getRandomValues(buffer);
  let pwd = "";
  for (let i = 0; i < 10; i++) {
    pwd += chars.charAt(buffer[i] % chars.length);
  }
  return pwd;
}

export function CustomerResetDialog({
  customer,
  isOpen,
  onClose,
  onSuccess,
}: CustomerResetDialogProps) {
  const [newPassword, setNewPassword] = useState(() => generateSecurePassword());
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !customer) return null;

  const displayName = formatCustomerName(customer.name, customer.contactPhone);

  const handleCopy = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("userId", customer.id);
    fd.append("newPassword", newPassword.trim());

    const res = await resetCustomerPasswordAction(fd);
    setLoading(false);

    if (!res.ok) {
      setError(res.error || "Une erreur est survenue.");
    } else {
      setSuccessMsg("Mot de passe réinitialisé avec succès !");
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border-2 border-border-strong overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b-2 border-border-strong flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg flex items-center justify-center bg-primary-soft text-primary border border-primary/20">
              <KeyRound className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-heading font-display">
              Réinitialisation du mot de passe
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:text-heading rounded-lg hover:bg-surface-hover"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs text-ink-700 leading-relaxed space-y-1">
            <p>
              Définir un nouveau mot de passe pour <span className="font-bold text-heading">{displayName}</span> ({customer.email}).
            </p>
            <p className="text-2xs text-ink-500">
              Ce mot de passe temporaire sera activé immédiatement. Transmettez-le au client via WhatsApp, SMS ou lors d&apos;un appel téléphonique.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive-light border border-destructive-base/30 rounded-lg text-xs text-destructive font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-success-light border border-success-base/30 rounded-lg text-xs text-success-base font-semibold">
              {successMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="newPasswordInput" className="text-xs font-semibold text-heading">
              Nouveau mot de passe temporaire
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="newPasswordInput"
                type="text"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 text-xs font-mono font-bold tracking-wider border-2 border-border-strong rounded-lg bg-white"
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewPassword(generateSecurePassword())}
                className="h-10 px-2.5 border-2 border-border-strong text-ink-600 hover:text-heading"
                title="Générer un autre mot de passe"
              >
                <RefreshCw className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-10 px-3 border-2 border-border-strong text-ink-600 hover:text-heading"
                title="Copier le mot de passe"
              >
                {copied ? <Check className="size-3.5 text-success-base" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
            {copied && <span className="text-2xs text-success-base font-bold">Copié dans le presse-papier !</span>}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t-2 border-border-strong">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="min-h-[40px] px-4 text-xs font-semibold border-2 border-border-strong"
            >
              {successMsg ? "Fermer" : "Annuler"}
            </Button>
            {!successMsg && (
              <Button
                type="submit"
                size="sm"
                disabled={loading || !newPassword}
                className="min-h-[40px] px-4 text-xs font-bold bg-primary text-white hover:bg-primary-hover"
              >
                {loading ? "Enregistrement..." : "Appliquer le mot de passe"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
