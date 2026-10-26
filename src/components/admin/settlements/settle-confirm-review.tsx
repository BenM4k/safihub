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
      <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2.5 text-primary">
        <ShieldCheck className="size-5 shrink-0" />
        <div>
          <p className="font-bold text-foreground">Vérification avant décaissement</p>
          <p className="text-2xs text-muted-foreground">
            Veuillez contrôler les informations ci-dessous avant d&apos;enregistrer le règlement.
          </p>
        </div>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-3">
        <div className="flex justify-between items-baseline pb-2 border-b border-border">
          <span className="text-muted-foreground">Bénéficiaire :</span>
          <span className="font-bold text-foreground">{target.name}</span>
        </div>

        <div className="flex justify-between items-baseline pb-2 border-b border-border">
          <span className="text-muted-foreground">Période concernée :</span>
          <span className="font-mono font-semibold text-foreground">{period || "Semaine courante"}</span>
        </div>

        <div className="flex justify-between items-baseline pb-2 border-b border-border">
          <span className="text-muted-foreground">Mode de paiement :</span>
          <span className="font-semibold text-foreground">{methodLabels[method]}</span>
        </div>

        {reference && (
          <div className="flex justify-between items-baseline pb-2 border-b border-border">
            <span className="text-muted-foreground">Référence / Preuve :</span>
            <span className="font-mono font-bold text-foreground">{reference}</span>
          </div>
        )}

        {note && (
          <div className="flex justify-between items-baseline pb-2 border-b border-border">
            <span className="text-muted-foreground">Note comptable :</span>
            <span className="text-foreground italic">{note}</span>
          </div>
        )}

        <div className="flex justify-between items-baseline pt-1">
          <span className="font-bold text-foreground">Montant décaissé :</span>
          <span className="font-mono text-base font-black text-primary tabular-nums">
            {formatMoney(amount, "CDF")}
          </span>
        </div>

        <div className="flex justify-between items-baseline text-2xs pt-1 border-t border-border">
          <span className="text-muted-foreground">Solde restant après opération :</span>
          <span className="font-mono font-bold text-foreground tabular-nums">
            {formatMoney(remaining, "CDF")}
          </span>
        </div>
      </div>

      {remaining > 0 && (
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-2xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            Règlement partiel : un solde de {formatMoney(remaining, "CDF")} restera dû à ce bénéficiaire.
          </span>
        </div>
      )}
    </div>
  );
}
