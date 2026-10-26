"use client";

import { Printer, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatMoney, formatFrenchDateTime } from "@/lib/cash-formatters";
import type { SettlementReceiptData } from "./types";

interface SettlementReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SettlementReceiptData | null;
}

export function SettlementReceiptModal({
  isOpen,
  onClose,
  data,
}: SettlementReceiptModalProps) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNum = data.settlementId
    ? `SETTLE-${data.settlementId.slice(0, 8).toUpperCase()}`
    : "SETTLE-DIRECT";

  const methodLabels: Record<string, string> = {
    mobile_money: "Mobile Money",
    bank: "Virement Bancaire",
    cash: "Espèces (Caisse centrale)",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md print:p-0 print:border-none print:shadow-none print:max-w-full">
        {/* Modal bar (hidden in print) */}
        <DialogHeader className="print:hidden">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="size-4" />
            <DialogTitle className="text-xs font-bold">Règlement validé avec succès</DialogTitle>
          </div>
        </DialogHeader>

        {/* Printable Receipt Body */}
        <div className="p-4 space-y-5 bg-card text-xs print:bg-white print:text-black">
          <div className="text-center pb-4 border-b border-border space-y-1">
            <h2 className="text-lg font-black text-foreground tracking-tight print:text-black">SafiHub</h2>
            <p className="text-2xs text-muted-foreground uppercase tracking-widest font-bold">
              Quittance de règlement · Bukavu
            </p>
            <p className="font-mono text-2xs text-muted-foreground font-bold">{receiptNum}</p>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-baseline">
              <span className="text-muted-foreground">Date & heure :</span>
              <span className="font-mono font-semibold text-foreground print:text-black">
                {formatFrenchDateTime(data.createdAt)}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-muted-foreground">Bénéficiaire :</span>
              <span className="font-bold text-foreground text-right print:text-black">{data.payeeName}</span>
            </div>

            {data.payeeSubtitle && (
              <div className="flex justify-between items-baseline text-2xs">
                <span className="text-muted-foreground">Coordonnées :</span>
                <span className="text-foreground text-right print:text-black">{data.payeeSubtitle}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline">
              <span className="text-muted-foreground">Période :</span>
              <span className="font-mono font-semibold text-foreground print:text-black">
                {data.period || "Semaine en cours"}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-muted-foreground">Mode de paiement :</span>
              <span className="font-semibold text-foreground print:text-black">{methodLabels[data.method]}</span>
            </div>

            {data.reference && (
              <div className="flex justify-between items-baseline">
                <span className="text-muted-foreground">N° de transaction :</span>
                <span className="font-mono font-bold text-foreground print:text-black">{data.reference}</span>
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div className="p-4 bg-muted/40 rounded-xl border border-border text-center space-y-1 print:border-gray-300">
            <p className="text-2xs uppercase tracking-wider font-bold text-muted-foreground">
              Montant réglé
            </p>
            <p className="text-2xl font-black font-mono text-foreground tabular-nums print:text-black">
              {formatMoney(data.amount, data.currency)}
            </p>
            <p className="text-2xs text-muted-foreground pt-1 border-t border-border">
              Nouveau solde dû : {formatMoney(data.newBalanceCDF, "CDF")}
            </p>
          </div>

          <div className="pt-4 text-center text-2xs text-muted-foreground border-t border-dashed border-border">
            Document généré électroniquement par le système SafiHub · Fait foi de paiement
          </div>
        </div>

        {/* Footer actions (hidden in print) */}
        <DialogFooter className="print:hidden gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-3 font-semibold text-xs"
          >
            Fermer
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="h-9 px-3.5 font-semibold text-xs gap-1.5"
          >
            <Printer className="size-3.5" />
            <span>Imprimer</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
