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
      <DialogContent className="w-full max-w-md p-6">
        <DialogHeader className="gap-1.5 pb-2">
          <DialogTitle className="flex items-center gap-2 text-primary text-base font-bold">
            <UserPlus className="size-4" />
            <span>Inviter un nouveau collaborateur</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Field className="space-y-1.5">
            <FieldLabel className="font-semibold text-foreground">
              Adresse e-mail
            </FieldLabel>
            <Input
              type="email"
              placeholder="collaborateur@gmail.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="text-base sm:text-xs h-10 min-h-[40px]"
              required
              autoFocus
            />
          </Field>

          <Field className="space-y-1.5">
            <FieldLabel className="font-semibold text-foreground">
              Rôle attribué
            </FieldLabel>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "manager" | "operator")}
              className="w-full h-10 min-h-[40px] px-3 rounded-lg border border-border text-base sm:text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="operator">Opérateur (Atelier & Commandes)</option>
              <option value="manager">Gérant (Catalogue & Horaires)</option>
            </select>
          </Field>

          <DialogFooter className="pt-2 gap-2">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
