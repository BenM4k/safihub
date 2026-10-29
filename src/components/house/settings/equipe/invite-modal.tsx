"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: "manager" | "operator") => void;
}

export function InviteModal({ isOpen, onClose, onInvite }: InviteModalProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"manager" | "operator">("operator");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    onInvite(inviteEmail.trim(), inviteRole);
    setInviteEmail("");
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-card border border-border shadow-lift font-sans">
        <DialogHeader className="p-4 sm:p-5 pr-12 border-b border-border/60 bg-surface text-left shrink-0">
          <DialogTitle className="flex items-center gap-2 text-primary text-base font-bold font-display">
            <UserPlus className="size-4 shrink-0" />
            <span>Inviter un nouveau collaborateur</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="overflow-y-auto overflow-x-hidden flex-1 max-w-full p-4 sm:p-5 space-y-4 text-xs min-w-0">
          <Field className="space-y-1.5 min-w-0">
            <FieldLabel className="font-semibold text-foreground">
              Adresse e-mail
            </FieldLabel>
            <Input
              type="email"
              placeholder="collaborateur@gmail.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="text-base sm:text-xs h-10 min-h-[40px] rounded-lg border-input w-full min-w-0"
              required
              autoFocus
            />
          </Field>

          <Field className="space-y-1.5 min-w-0">
            <FieldLabel className="font-semibold text-foreground">
              Rôle attribué
            </FieldLabel>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "manager" | "operator")}
              className="w-full h-10 min-h-[40px] px-3 rounded-lg border border-input text-base sm:text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="operator">Opérateur (Atelier & Commandes)</option>
              <option value="manager">Gérant (Catalogue & Horaires)</option>
            </select>
          </Field>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-border/60 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto h-9 px-4 text-xs font-semibold rounded-lg cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              className="w-full sm:w-auto h-9 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-lg shadow-xs cursor-pointer"
            >
              Envoyer l&apos;invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
