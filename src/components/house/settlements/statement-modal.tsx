"use client";

import { useEffect, useRef } from "react";
import { FileText, Printer, X } from "lucide-react";
import type { PartnerSettlementsPageData } from "@/types/partner-settlements";
import { Button } from "@/components/ui/button";
import { StatementDocument } from "./statement-document";

interface StatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PartnerSettlementsPageData;
}

export function StatementModal({ isOpen, onClose, data }: StatementModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const printButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    printButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handlePrint() {
    window.print();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="statement-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Modal Top Bar (screen only) */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <h2 id="statement-title" className="text-sm font-bold text-heading">
              Relevé de compte pressing
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              ref={printButtonRef}
              type="button"
              size="sm"
              onClick={handlePrint}
              className="min-h-[40px] px-3.5 text-xs font-semibold gap-1.5"
            >
              <Printer className="size-3.5" />
              <span>Imprimer / Enregistrer en PDF</span>
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-heading rounded-lg hover:bg-surface-hover transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Fermer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document */}
        <StatementDocument data={data} />
      </div>
    </div>
  );
}
