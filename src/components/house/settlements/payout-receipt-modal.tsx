"use client";

import { useTranslations } from "next-intl";
import { Printer, Receipt } from "lucide-react";
import type { PartnerPayoutDTO } from "@/types/partner-settlements";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReceiptDocument } from "./receipt-document";

interface PayoutReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payout: PartnerPayoutDTO | null;
  houseName: string;
  maskedAccount?: string | null;
}

export function PayoutReceiptModal({
  isOpen,
  onClose,
  payout,
  houseName,
  maskedAccount,
}: PayoutReceiptModalProps) {
  const t = useTranslations("house.settlements");

  if (!payout) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg p-0 overflow-hidden rounded-2xl bg-card border border-border shadow-lift print:p-0 print:border-none print:shadow-none print:max-w-full">
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #payout-receipt-printable, #payout-receipt-printable * {
              visibility: visible;
            }
            #payout-receipt-printable {
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
        <DialogHeader className="p-3 sm:p-4 pr-12 border-b border-border flex flex-row items-center justify-between gap-2 bg-surface print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <Receipt className="size-4 text-primary shrink-0" />
            <DialogTitle className="text-xs sm:text-sm font-bold text-foreground truncate">
              {t("officialReceiptTitle")}
            </DialogTitle>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => window.print()}
            className="h-8 px-2.5 sm:px-3 text-xs font-semibold gap-1.5 rounded-lg shrink-0 cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>{t("printOrPdf")}</span>
          </Button>
        </DialogHeader>

        {/* Printable Receipt Body */}
        <div id="payout-receipt-printable">
          <ReceiptDocument
            payout={payout}
            houseName={houseName}
            maskedAccount={maskedAccount}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
