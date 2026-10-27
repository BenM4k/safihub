"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SupportTicketForm,
  type SupportTicketTarget,
} from "./support-ticket-form";
import { TicketSuccessView } from "./ticket-success-view";

export type { SupportTicketTarget };

interface SupportTicketDialogProps {
  target: SupportTicketTarget | null;
  onClose: () => void;
  houseSlug: string;
}

export function SupportTicketDialog({
  target,
  onClose,
  houseSlug,
}: SupportTicketDialogProps) {
  const t = useTranslations("house.settlements");
  const [createdTicketRef, setCreatedTicketRef] = useState<string | null>(null);

  function handleClose() {
    setCreatedTicketRef(null);
    onClose();
  }

  if (!target) return null;

  return (
    <Dialog
      open={Boolean(target)}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border bg-surface text-left">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                {t("ticketModalTitle")}
              </DialogTitle>
              <DialogDescription className="text-2xs text-muted-foreground font-mono">
                {t("ticketModalRef", { ref: target.reference })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body: Form or Success */}
        {createdTicketRef ? (
          <TicketSuccessView
            ticketRef={createdTicketRef}
            reference={target.reference}
            amount={target.amount}
            onClose={handleClose}
          />
        ) : (
          <SupportTicketForm
            key={`${target.type}-${target.reference}`}
            target={target}
            onClose={handleClose}
            houseSlug={houseSlug}
            onSuccess={setCreatedTicketRef}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
