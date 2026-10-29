"use client";

import { useTranslations } from "next-intl";
import { FileText, Printer } from "lucide-react";
import type { PartnerSettlementsPageData } from "@/types/partner-settlements";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatementDocument } from "./statement-document";

interface StatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PartnerSettlementsPageData;
}

export function StatementModal({ isOpen, onClose, data }: StatementModalProps) {
  const t = useTranslations("house.settlements");

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl p-0 overflow-hidden max-h-[92vh] flex flex-col rounded-2xl bg-card border border-border shadow-lift print:max-h-none print:overflow-visible print:border-none print:shadow-none print:max-w-full print:m-0">
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #statement-printable, #statement-printable * {
              visibility: visible;
            }
            #statement-printable {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              max-height: none !important;
              overflow: visible !important;
            }
          }
        `}</style>

        {/* Modal Top Bar (screen only) with right padding to clear Radix close button */}
        <DialogHeader className="p-3 sm:p-4 pr-12 border-b border-border flex flex-row items-center justify-between gap-2 bg-surface print:hidden shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="size-4 text-primary shrink-0" />
            <DialogTitle className="text-xs sm:text-sm font-bold text-foreground truncate">
              {t("statementTitle")}
            </DialogTitle>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => window.print()}
            className="h-8 px-2.5 sm:px-3 text-xs font-semibold gap-1.5 rounded-lg shrink-0 cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>{t("printOrSavePdf")}</span>
          </Button>
        </DialogHeader>

        {/* Printable Statement Document */}
        <div id="statement-printable" className="flex-1 overflow-y-auto overflow-x-hidden">
          <StatementDocument data={data} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
