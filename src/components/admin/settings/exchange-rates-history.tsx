import { getTranslations } from "next-intl/server";
import type { ExchangeRateRecord } from "@/dal";

interface ExchangeRatesHistoryProps {
  rates: ExchangeRateRecord[];
}

export async function ExchangeRatesHistory({ rates }: ExchangeRatesHistoryProps) {
  const t = await getTranslations("admin.settings");

  return (
    <div className="rounded-xl border border-[#EAECF0] bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#EAECF0]">
        <h3 className="font-semibold text-sm text-[#101828]">
          {t("rateHistoryTitle")} ({rates.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#475467]">
          <thead className="bg-[#F8F9FA] border-b border-[#EAECF0] uppercase font-medium text-[#475467]">
            <tr>
              <th className="py-3 px-4">{t("effectiveDateCol")}</th>
              <th className="py-3 px-4">{t("pairCol")}</th>
              <th className="py-3 px-4 text-right">{t("rateAppliedCol")}</th>
              <th className="py-3 px-4 text-right">{t("recordedAtCol")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAECF0]">
            {rates.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-[#667085]">
                  {t("noRatesHistory")}
                </td>
              </tr>
            ) : (
              rates.map((r) => (
                <tr key={r.id} className="hover:bg-[#F8F9FA]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-[#101828]">
                    {r.effectiveDate}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold">{r.baseCurrency}</span> → {r.quoteCurrency}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#101828]">
                    1 {r.baseCurrency} = {Number(r.rate).toLocaleString(undefined, { maximumFractionDigits: 6 })} {r.quoteCurrency}
                  </td>
                  <td className="py-3 px-4 text-right text-[11px] text-[#667085]">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
