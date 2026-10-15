"use client";

import { ShieldCheck, AlertTriangle } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PayeeSettlementTarget } from "./types";

interface SettleConfirmReviewProps {
  target: PayeeSettlementTarget;
  amount: number;
  method: "mobile_money" | "bank" | "cash";
  reference: string;
  period: string;
  note: string;
}

export function SettleConfirmReview({
  target,
  amount,
  method,
  reference,
  period,
  note,
}: SettleConfirmReviewProps) {
  const remaining = Math.max(0, target.balanceOwedCDF - amount);

  const methodLabels: Record<string, string> = {
    mobile_money: "Mobile Money",
    bank: "Virement Bancaire",
    cash: "Espèces (Caisse)",
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="p-3 bg-primary/10 border-2 border-primary/30 rounded-xl flex items-center gap-2.5 text-primary">
        <ShieldCheck className="size-5 shrink-0" />
        <div>
          <p className="font-bold text-heading">Vérification avant décaissement</p>
          <p className="text-2xs text-ink-700">
            Veuillez contrôler les informations ci-dessous avant d&apos;enregistrer le règlement.
          </p>
        </div>
      </div>

      <div className="bg-surface p-4 rounded-xl border-2 border-border-strong space-y-3">
        <div className="flex justify-between items-baseline pb-2 border-b border-border-strong">
          <span className="text-ink-600">Bénéficiaire :</span>
          <span className="font-bold text-heading">{target.name}</span>
        </div>

        <div className="flex justify-between items-baseline pb-2 border-b border-border-strong">
          <span className="text-ink-600">Période concernée :</span>
          <span className="font-mono font-semibold text-heading">{period || "Semaine courante"}</span>
        </div>

        <div className="flex justify-between items-baseline pb-2 border-b border-border-strong">
          <span className="text-ink-600">Mode de paiement :</span>
          <span className="font-semibold text-heading">{methodLabels[method]}</span>
        </div>

        {reference && (
          <div className="flex justify-between items-baseline pb-2 border-b border-border-strong">
            <span className="text-ink-600">Référence / Preuve :</span>
            <span className="font-mono font-bold text-heading">{reference}</span>
          </div>
        )}

        {note && (
          <div className="flex justify-between items-baseline pb-2 border-b border-border-strong">
            <span className="text-ink-600">Note comptable :</span>
            <span className="text-ink-800 italic">{note}</span>
          </div>
        )}

        <div className="flex justify-between items-baseline pt-1">
          <span className="font-bold text-heading">Montant décaissé :</span>
          <span className="font-mono text-base font-black text-primary tabular-nums">
            {formatMoney(amount, "CDF")}
          </span>
        </div>

        <div className="flex justify-between items-baseline text-2xs pt-1 border-t border-border-strong">
          <span className="text-ink-600">Solde restant après opération :</span>
          <span className="font-mono font-bold text-ink-700 tabular-nums">
            {formatMoney(remaining, "CDF")}
          </span>
        </div>
      </div>

      {remaining > 0 && (
        <div className="p-2.5 bg-warning-light border border-warning-base/30 rounded-lg flex items-center gap-2 text-2xs text-warning-base">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            Règlement partiel : un solde de {formatMoney(remaining, "CDF")} restera dû à ce bénéficiaire.
          </span>
        </div>
      )}
    </div>
  );
}
