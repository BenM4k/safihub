"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { FileText, X } from "lucide-react";
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
  const formId = useId();
  const [createdTicketRef, setCreatedTicketRef] = useState<string | null>(null);

  function handleClose() {
    setCreatedTicketRef(null);
    onClose();
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setCreatedTicketRef(null);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${formId}-title`}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-lift border border-border overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
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
            type="button"
            onClick={handleClose}
            className="p-1.5 text-muted-foreground hover:text-heading rounded-lg hover:bg-muted transition"
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
