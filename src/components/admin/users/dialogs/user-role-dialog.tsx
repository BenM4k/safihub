"use client";

import { useTranslations } from "next-intl";
import { UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserRoleForm } from "./user-role-form";
import type { UserRow } from "../types";

interface UserRoleDialogProps {
  user: UserRow | null;
  isOpen: boolean;
  currentUserId?: string | null;
  activeAdminsCount: number;
  houses: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserRoleDialog({
  user,
  isOpen,
  currentUserId,
  activeAdminsCount,
  houses,
  onClose,
  onSuccess,
}: UserRoleDialogProps) {
  const t = useTranslations("admin.users");

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border border-border rounded-xl">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
          <DialogTitle className="flex items-center gap-2 text-foreground font-bold text-sm">
            <UserCog className="size-5 text-primary" />
            <span>{t("roleChangeConfirm")}</span>
          </DialogTitle>
        </DialogHeader>
        <UserRoleForm
          user={user}
          currentUserId={currentUserId}
          activeAdminsCount={activeAdminsCount}
          houses={houses}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
