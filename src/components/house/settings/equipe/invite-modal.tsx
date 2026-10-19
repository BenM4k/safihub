"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: "manager" | "operator") => void;
}

export function InviteModal({ isOpen, onClose, onInvite }: InviteModalProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"manager" | "operator">("operator");

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    onInvite(inviteEmail.trim(), inviteRole);
    setInviteEmail("");
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <UserPlus className="size-4" />
          <span>Inviter un nouveau collaborateur</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-foreground block mb-1">
              Adresse e-mail
            </label>
            <input
              type="email"
              placeholder="collaborateur@gmail.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">
              Rôle attribué
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "manager" | "operator")}
              className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="operator">Opérateur (Atelier & Commandes)</option>
              <option value="manager">Gérant (Catalogue & Horaires)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
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
              className="bg-primary text-primary-foreground font-bold text-xs"
            >
              Envoyer l&apos;invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
