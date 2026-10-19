"use client";

import {
  SupportTicketForm,
  type SupportTicketTarget,
} from "./support-ticket-form";

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
  if (!target) return null;
  return (
    <SupportTicketForm
      key={`${target.type}-${target.reference}`}
      target={target}
      onClose={onClose}
      houseSlug={houseSlug}
    />
  );
}
