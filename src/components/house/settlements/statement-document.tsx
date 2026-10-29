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
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 overflow-y-auto overflow-x-hidden bg-white text-slate-900 print:p-0 print:overflow-visible">
      {/* Document Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b-2 border-slate-900 pb-4">
        <div>
          <div className="text-lg sm:text-xl font-black tracking-tight text-slate-900 font-display uppercase">
            SafiHub RDC
          </div>
          <p className="text-2xs text-slate-500 uppercase tracking-widest mt-0.5">
            Plateforme de Pressing à Bukavu
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Relevé d&apos;activité & Versements
          </span>
          <span className="text-2xs text-slate-500 font-mono">
            Date d&apos;émission : {new Date().toLocaleDateString("fr-FR")}
          </span>
        </div>
      </div>

      {/* Pressing and Period info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
        <div>
          <span className="text-2xs text-slate-500 uppercase tracking-wider block font-bold">
            Atelier Partenaire
          </span>
          <p className="font-bold text-sm text-slate-900 mt-0.5">{data.houseName}</p>
          <p className="text-2xs text-slate-600 font-mono mt-0.5">
            Compte : {data.hero.maskedAccount || "Non configuré"}
          </p>
        </div>

        <div className="text-left sm:text-right">
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

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-xs divide-y divide-slate-200">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-700">
                  Chiffre d&apos;affaires brut (articles livrés)
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                  {formatMoney(data.kpis.grossRevenueCDF, "CDF")}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-700">
                  Commissions SafiHub ({data.kpis.commissionRatePercent}%)
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                  -{formatMoney(data.kpis.commissionCDF, "CDF")}
                </td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td className="py-2.5 px-3 text-slate-900">
                  Net de la période généré par l&apos;atelier
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-900 whitespace-nowrap">
                  {formatMoney(data.kpis.netReceivableCDF, "CDF")}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-700">
                  Versements effectifs reçus sur la période
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-success font-bold whitespace-nowrap">
                  -{formatMoney(data.kpis.totalSettledCDF, "CDF")}
                </td>
              </tr>
              <tr className="bg-slate-100 font-black text-xs sm:text-sm">
                <td className="py-3 px-3 text-slate-900">
                  Solde total restant dû (toutes périodes)
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-900 whitespace-nowrap">
                  {formatMoney(data.hero.balanceOwedCDF, "CDF")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Statement Footer */}
      <div className="pt-4 sm:pt-6 border-t border-slate-200 text-2xs text-slate-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <p>Document certifié extrait du Grand Livre SafiHub RDC.</p>
        <p className="font-mono">
          Prochain versement : {data.hero.nextPayoutDate}
        </p>
      </div>
    </div>
  );
}
