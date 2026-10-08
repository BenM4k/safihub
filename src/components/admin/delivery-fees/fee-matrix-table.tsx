import { getTranslations } from "next-intl/server";
import type { ZoneFeeRecord } from "@/dal";
import { Badge } from "@/components/ui/badge";

interface FeeMatrixTableProps {
  zoneFees: ZoneFeeRecord[];
}

export async function FeeMatrixTable({ zoneFees }: FeeMatrixTableProps) {
  const t = await getTranslations("admin.deliveryFees");

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-heading">{t("matrixTitle")}</h2>
        <span className="text-xs text-muted-foreground font-semibold">
          {zoneFees.length} combinaison(s)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="px-4 py-3">{t("customerZone")}</th>
              <th className="px-4 py-3">{t("houseZone")}</th>
              <th className="px-4 py-3">{t("deliveryFee")}</th>
              <th className="px-4 py-3">{t("distanceLevel")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {zoneFees.map((zf) => (
              <tr key={zf.id} className="hover:bg-slate-50/60 transition">
                <td className="px-4 py-3 font-semibold text-heading">
                  {zf.customerZoneName}
                </td>
                <td className="px-4 py-3 font-semibold text-heading">
                  {zf.houseZoneName}
                </td>
                <td className="px-4 py-3 font-mono font-bold text-primary">
                  {zf.deliveryFee.toLocaleString()} {zf.currency}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="bg-slate-100 text-slate-700">
                    Niveau {zf.distanceLevel}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
