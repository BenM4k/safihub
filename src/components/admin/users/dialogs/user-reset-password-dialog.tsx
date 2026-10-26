"use client";

import { useTranslations } from "next-intl";
import { KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserResetPasswordForm } from "./user-reset-password-form";
import type { UserRow } from "../types";

interface UserResetPasswordDialogProps {
  user: UserRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserResetPasswordDialog({
  user,
  isOpen,
  onClose,
  onSuccess,
}: UserResetPasswordDialogProps) {
  const t = useTranslations("admin.users");

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border border-border rounded-xl">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
          <DialogTitle className="flex items-center gap-2 text-foreground font-bold text-sm">
            <KeyRound className="size-5 text-primary" />
            <span>{t("resetConfirm")}</span>
          </DialogTitle>
        </DialogHeader>
        <UserResetPasswordForm
          user={user}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
