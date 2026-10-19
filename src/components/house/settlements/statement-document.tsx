import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerSettlementsPageData } from "@/types/partner-settlements";

interface StatementDocumentProps {
  data: PartnerSettlementsPageData;
}

export function StatementDocument({ data }: StatementDocumentProps) {
  const startDateStr = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(data.periodStartDate));

  const endDateStr = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(data.periodEndDate));

  return (
    <div className="p-6 sm:p-8 space-y-6 overflow-y-auto bg-white text-slate-900 print:p-0 print:overflow-visible">
      {/* Document Header */}
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
        <div>
          <div className="text-xl font-black tracking-tight text-slate-900 font-display uppercase">
            SafiHub RDC
          </div>
          <p className="text-2xs text-slate-500 uppercase tracking-widest mt-0.5">
            Plateforme de Pressing à Bukavu
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Relevé d&apos;activité & Versements
          </span>
          <span className="text-2xs text-slate-500 font-mono">
            Date d&apos;émission : {new Date().toLocaleDateString("fr-FR")}
          </span>
        </div>
      </div>

      {/* Pressing and Period info */}
      <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <span className="text-2xs text-slate-500 uppercase tracking-wider block font-bold">
            Atelier Partenaire
          </span>
          <p className="font-bold text-sm text-slate-900 mt-0.5">{data.houseName}</p>
          <p className="text-2xs text-slate-600 font-mono mt-0.5">
            Compte : {data.hero.maskedAccount || "Non configuré"}
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xs text-slate-500 uppercase tracking-wider block font-bold">
            Période du relevé
          </span>
          <p className="font-semibold text-slate-900 mt-0.5">
            Du {startDateStr} au {endDateStr}
          </p>
          <p className="text-2xs text-slate-600 mt-0.5">
            Cycle hebdomadaire du lundi
          </p>
        </div>
      </div>

      {/* Period Financial Summary Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Synthèse financière de la période
        </h3>

        <table className="w-full text-xs border border-slate-200 divide-y divide-slate-200">
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-2.5 px-3 font-medium text-slate-700">
                Chiffre d&apos;affaires brut (articles livrés)
              </td>
              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                {formatMoney(data.kpis.grossRevenueCDF, "CDF")}
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-medium text-slate-700">
                Commissions SafiHub ({data.kpis.commissionRatePercent}%)
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                -{formatMoney(data.kpis.commissionCDF, "CDF")}
              </td>
            </tr>
            <tr className="bg-slate-50 font-bold">
              <td className="py-2.5 px-3 text-slate-900">
                Net de la période généré par l&apos;atelier
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                {formatMoney(data.kpis.netReceivableCDF, "CDF")}
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-medium text-slate-700">
                Versements effectifs reçus sur la période
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-bold">
                -{formatMoney(data.kpis.totalSettledCDF, "CDF")}
              </td>
            </tr>
            <tr className="bg-slate-100 font-black text-sm">
              <td className="py-3 px-3 text-slate-900">
                Solde total restant dû (toutes périodes)
              </td>
              <td className="py-3 px-3 text-right font-mono text-slate-900">
                {formatMoney(data.hero.balanceOwedCDF, "CDF")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statement Footer */}
      <div className="pt-6 border-t border-slate-200 text-2xs text-slate-500 flex justify-between items-center">
        <p>Document certifié extrait du Grand Livre SafiHub RDC.</p>
        <p className="font-mono">
          Prochain versement : {data.hero.nextPayoutDate}
        </p>
      </div>
    </div>
  );
}
