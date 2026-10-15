"use client";

import { Printer, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  if (!isOpen || !data) return null;

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
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 print:p-0 print:bg-white"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl border-2 border-border-strong overflow-hidden print:border-none print:shadow-none print:max-w-full">
        {/* Modal bar (hidden in print) */}
        <div className="p-3 bg-surface border-b-2 border-border-strong flex items-center justify-between print:hidden">
          <div className="flex items-center gap-1.5 text-success-base text-xs font-bold">
            <CheckCircle2 className="size-4" />
            <span>Règlement validé avec succès</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-ink-500 hover:text-ink-800 rounded-lg hover:bg-ink-100"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 space-y-5 bg-white text-xs">
          <div className="text-center pb-4 border-b-2 border-border-strong space-y-1">
            <h2 className="text-lg font-black text-heading tracking-tight">SafiHub</h2>
            <p className="text-2xs text-ink-500 uppercase tracking-widest font-bold">
              Quittance de règlement · Kinshasa / Bukavu
            </p>
            <p className="font-mono text-2xs text-ink-600 font-bold">{receiptNum}</p>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-baseline">
              <span className="text-ink-600">Date & heure :</span>
              <span className="font-mono font-semibold text-heading">
                {formatFrenchDateTime(data.createdAt)}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-ink-600">Bénéficiaire :</span>
              <span className="font-bold text-heading text-right">{data.payeeName}</span>
            </div>

            {data.payeeSubtitle && (
              <div className="flex justify-between items-baseline text-2xs">
                <span className="text-ink-500">Coordonnées :</span>
                <span className="text-ink-600 text-right">{data.payeeSubtitle}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline">
              <span className="text-ink-600">Période :</span>
              <span className="font-mono font-semibold text-heading">
                {data.period || "Semaine en cours"}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-ink-600">Mode de paiement :</span>
              <span className="font-semibold text-heading">{methodLabels[data.method]}</span>
            </div>

            {data.reference && (
              <div className="flex justify-between items-baseline">
                <span className="text-ink-600">N° de transaction :</span>
                <span className="font-mono font-bold text-heading">{data.reference}</span>
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div className="p-4 bg-surface rounded-xl border-2 border-border-strong text-center space-y-1">
            <p className="text-2xs uppercase tracking-wider font-bold text-ink-600">
              Montant réglé
            </p>
            <p className="text-2xl font-black font-mono text-heading tabular-nums">
              {formatMoney(data.amount, data.currency)}
            </p>
            <p className="text-2xs text-ink-600 pt-1 border-t border-border-strong/60">
              Nouveau solde dû : {formatMoney(data.newBalanceCDF, "CDF")}
            </p>
          </div>

          <div className="pt-4 text-center text-2xs text-ink-400 border-t border-dashed border-border-strong">
            Document généré électroniquement par le système SafiHub · Fait foi de paiement
          </div>
        </div>

        {/* Footer actions (hidden in print) */}
        <div className="p-3 bg-surface border-t-2 border-border-strong flex items-center justify-between gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="min-h-[40px] px-3 font-semibold text-xs border-border-strong text-ink-700"
          >
            Fermer
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="min-h-[40px] px-4 font-semibold text-xs gap-1.5 shadow-xs"
          >
            <Printer className="size-4" />
            <span>Imprimer / PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
