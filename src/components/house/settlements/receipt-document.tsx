import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerPayoutDTO } from "@/types/partner-settlements";

interface ReceiptDocumentProps {
  payout: PartnerPayoutDTO;
  houseName: string;
  maskedAccount?: string | null;
}

export function ReceiptDocument({
  payout,
  houseName,
  maskedAccount,
}: ReceiptDocumentProps) {
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
  );
}
