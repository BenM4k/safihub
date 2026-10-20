"use client";

import { useId, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { FileText, X } from "lucide-react";
import { CoverageExtensionForm } from "./coverage-extension-form";
import { CoverageExtensionSuccessView } from "./coverage-extension-success-view";
import { useAccessibleDialog } from "@/components/house/orders/use-accessible-dialog";

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
  const formId = useId();
  const [createdTicketRef, setCreatedTicketRef] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function handleClose() {
    setCreatedTicketRef(null);
    onClose();
  }

  const containerRef = useAccessibleDialog<HTMLDivElement>({
    isOpen,
    onClose: handleClose,
    initialFocusRef: closeButtonRef,
    trapTab: true,
  });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${formId}-title`}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="w-full max-w-lg bg-card rounded-2xl shadow-lift border border-border overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col outline-none"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl flex items-center justify-center bg-primary-soft text-primary border border-primary/20">
              <FileText className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id={`${formId}-title`} className="text-sm font-bold text-heading font-display">
                {t("requestExtensionModalTitle")}
              </h2>
              <p className="text-[11px] text-muted-foreground">{t("requestExtensionModalSubtitle")}</p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="p-1.5 text-muted-foreground hover:text-heading rounded-lg hover:bg-muted transition cursor-pointer"
            aria-label={t("closeDialog")}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
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
    </div>
  );
}
