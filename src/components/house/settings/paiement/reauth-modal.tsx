"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReauthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ReauthModal({ isOpen, onClose, onConfirm }: ReauthModalProps) {
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authPassword.trim()) {
      setAuthError("Veuillez saisir votre mot de passe pour confirmer.");
      return;
    }
    setAuthError(null);
    onConfirm();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2 text-warning font-bold text-sm">
          <Lock className="size-4" />
          <span>Confirmation de sécurité requise</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Pour modifier les coordonnées bancaires ou Mobile Money de versement, veuillez saisir le mot de passe de votre compte.
        </p>

        {authError && (
          <div className="p-3 bg-destructive-soft border border-destructive/30 rounded-xl text-xs text-destructive font-semibold">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="Votre mot de passe actuel"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
            autoFocus
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-primary text-primary-foreground text-xs font-bold"
            >
              Confirmer la modification
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
