"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CoverageExtensionForm } from "./coverage-extension-form";
import { CoverageExtensionSuccessView } from "./coverage-extension-success-view";

interface CoverageExtensionTicketDialogProps {
  isOpen: boolean;
  effectiveMaxDistance: number;
  houseId?: string;
  onClose: () => void;
}

export function CoverageExtensionTicketDialog({
  isOpen,
  effectiveMaxDistance,
  houseId,
  onClose,
}: CoverageExtensionTicketDialogProps) {
  const t = useTranslations("house.coverage");
  const [createdTicketRef, setCreatedTicketRef] = useState<string | null>(null);

  function handleClose() {
    setCreatedTicketRef(null);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="p-0 overflow-hidden rounded-2xl bg-card border border-border shadow-lift font-sans sm:max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 pr-12 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20 shrink-0">
              <FileText className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold text-foreground font-display truncate">
                {t("requestExtensionModalTitle")}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {t("requestExtensionModalSubtitle")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="overflow-y-auto overflow-x-hidden flex-1 max-w-full">
          {createdTicketRef ? (
            <CoverageExtensionSuccessView ticketRef={createdTicketRef} onClose={handleClose} />
          ) : (
            <CoverageExtensionForm
              effectiveMaxDistance={effectiveMaxDistance}
              houseId={houseId}
              onSuccess={(ref) => setCreatedTicketRef(ref)}
              onCancel={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
