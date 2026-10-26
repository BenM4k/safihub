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
      <DialogContent className="max-w-lg p-0 overflow-hidden print:p-0 print:border-none print:shadow-none print:max-w-full">
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

        {/* Modal Top Bar (screen only) */}
        <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between bg-surface print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="size-4 text-primary" />
            <DialogTitle className="text-sm font-bold text-foreground">
              {t("officialReceiptTitle")}
            </DialogTitle>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => window.print()}
            className="min-h-[38px] px-3 text-xs font-semibold gap-1.5"
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
