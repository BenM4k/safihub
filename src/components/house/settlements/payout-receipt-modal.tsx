"use client";

import { useEffect, useRef } from "react";
import { Printer, Receipt, X } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerPayoutDTO } from "@/types/partner-settlements";
import { Button } from "@/components/ui/button";

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

  if (!isOpen || !payout) return null;

  const receiptRef = payout.reference
    ? `REC-${payout.reference}`
    : `REC-${payout.id.slice(0, 8).toUpperCase()}`;

  const methodLabels: Record<string, string> = {
    airtel_money: "Airtel Money",
    orange_money: "Orange Money",
    mpesa: "M-Pesa",
    bank: "Virement Bancaire",
    cash: "Caisse centrale SafiHub",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payout-receipt-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150 print:p-0 print:bg-white"
    >
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

      <div
        id="payout-receipt-printable"
        ref={modalRef}
        className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col my-auto print:border-none print:shadow-none print:max-w-full"
      >
        {/* Modal Top Bar (screen only) */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="size-4 text-primary" />
            <h2 id="payout-receipt-title" className="text-sm font-bold text-heading">
              Reçu officiel de versement
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              ref={printButtonRef}
              type="button"
              size="sm"
              onClick={() => window.print()}
              className="min-h-[40px] px-3.5 text-xs font-semibold gap-1.5"
            >
              <Printer className="size-3.5" />
              <span>Imprimer / PDF</span>
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

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-8 space-y-5 bg-white text-slate-900 text-xs print:p-0">
          <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
            <h3 className="text-lg font-black tracking-tight font-display uppercase">SafiHub RDC</h3>
            <p className="text-2xs text-slate-500 uppercase tracking-widest font-bold">
              Quittance de versement atelier partenaire · Bukavu
            </p>
            <p className="font-mono text-2xs text-slate-700 font-bold">{receiptRef}</p>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-600">Pressing partenaire :</span>
              <span className="font-bold text-slate-900 text-right">{houseName}</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-slate-600">Compte destinataire :</span>
              <span className="font-mono text-slate-700 text-right">
                {maskedAccount || "Compte principal"}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-slate-600">Date d&apos;émission :</span>
              <span className="font-mono font-semibold text-slate-900">
                {new Intl.DateTimeFormat("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  timeZone: "Africa/Lubumbashi",
                }).format(new Date(payout.date))}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-slate-600">Période couverte :</span>
              <span className="font-medium text-slate-900">
                {payout.periodCovered || "Règlement hebdomadaire"}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-slate-600">Mode de paiement :</span>
              <span className="font-semibold text-slate-900">
                {methodLabels[payout.method] || payout.method}
              </span>
            </div>

            {payout.reference && (
              <div className="flex justify-between items-baseline">
                <span className="text-slate-600">Référence transaction :</span>
                <span className="font-mono font-bold text-slate-900">{payout.reference}</span>
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-200 text-center space-y-1">
            <p className="text-2xs uppercase tracking-wider font-bold text-slate-600">
              Montant versé
            </p>
            <p className="text-2xl font-black font-mono text-slate-900 tabular-nums">
              +{formatMoney(payout.amount, "CDF")}
            </p>
            <p className="text-2xs text-slate-600 pt-1 border-t border-slate-200">
              Statut : {payout.status === "paid" ? "Payé avec succès" : payout.status} · {payout.ordersCount} commande(s) incluse(s)
            </p>
          </div>

          <div className="pt-4 text-center text-2xs text-slate-400 border-t border-dashed border-slate-200">
            Document généré électroniquement par SafiHub RDC · Fait foi de versement
          </div>
        </div>
      </div>
    </div>
  );
}
