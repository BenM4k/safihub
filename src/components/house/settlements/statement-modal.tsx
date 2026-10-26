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
      <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[92vh] flex flex-col print:max-h-none print:overflow-visible print:border-none print:shadow-none print:max-w-full print:m-0">
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

        {/* Modal Top Bar (screen only) */}
        <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between bg-surface print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <DialogTitle className="text-sm font-bold text-foreground">
              {t("statementTitle")}
            </DialogTitle>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => window.print()}
            className="min-h-[38px] px-3.5 text-xs font-semibold gap-1.5"
          >
            <Printer className="size-3.5" />
            <span>{t("printOrSavePdf")}</span>
          </Button>
        </DialogHeader>

        {/* Printable Statement Document */}
        <div id="statement-printable" className="flex-1 overflow-y-auto">
          <StatementDocument data={data} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
